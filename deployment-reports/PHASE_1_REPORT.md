# ANNAMALAI FURNITURE — Phase 1 Backup and Project Audit

Date: 2026-11-06

## Status

**Phase 1: PASS.** The source/assets archive and private SQLite snapshots were created and verified before proceeding to Phase 2. No application or business data was modified.

## Architecture found

- **Frontend:** React 18, TypeScript, Vite, React Router, and TanStack Query. The customer website and Admin Portal are routes in the same SPA.
- **Backend:** Express 4 with TypeScript, Prisma, Multer, and Sharp. The Vite development server proxies `/api` and `/uploads` to the backend.
- **Current catalog database:** SQLite at `server/prisma/dev.db`, according to the Prisma schema and current server configuration. The backend still serves product/category reads and writes through SQLite.
- **Local media:** 69 image-like assets under `client/public`; 26 uploaded image files under `server/uploads`. All 22 local `ProductImage` records have matching original and thumbnail files.
- **Authentication:** The browser uses Supabase Email/Password Auth and calls `is_admin()` for authorization. The Express admin middleware verifies the bearer token with Supabase and also calls `is_admin()`. The local SQLite database separately retains two legacy `AdminUser` records and 29 audit entries; do not run the legacy setup script.
- **Supabase integration boundary:** SQL migration files exist, but the live Supabase project has not yet been migrated/verified. Catalog operations and file uploads are still local SQLite/filesystem operations; they are not yet Supabase-backed.
- **Git:** There is no `.git` directory in the project workspace, so a Git backup checkpoint could not be created.

## Data inventory

Counts are from a read-only SQLite inspection:

| Entity | Count |
|---|---:|
| Categories | 8 |
| Products | 18 |
| Product images | 22 |
| Promotional media records | 0 |
| Website settings | 6 |
| Admin audit records | 29 |
| Legacy local admin records | 2 |
| Uploaded image files | 26 |
| Public image-like assets | 69 |

The root `uploads` directory was empty. The configured upload directory is `server/uploads`.

## Backup created and verified

- Portable source/assets archive: `deployment-reports/backups/annamalai-phase1-source-assets-20261106.zip`
  - 215 files; 95 image-like assets; 6,519,778 bytes.
  - `zipfile.testzip()` returned no corrupt entries.
  - The archive was extracted to a temporary directory and key project files were verified.
  - SHA-256: `86c3badeb87c5b08f932611986575ab7833e099398d6ad123bfd4c9fd6ba88b1`
  - Excludes `.env*`, SQLite databases, dependencies, generated build/test output, Git metadata, and workspace tooling folders.
- Private SQLite snapshots were made with SQLite's online backup API and each passed `PRAGMA quick_check`. The product database was reopened read-only and its table counts matched the source.
  - Restricted folder: `C:\Users\Welcome\.copilot\session-state\cd84bf01-3be6-4083-9ca8-106077e799a1\files\phase1-secure-db-20261106`
  - Files: `dev.db` (application data, including legacy credential hashes/TOTP material) and `sessions.db` (transient session state).
  - Windows ACL permits only the current Windows user and `NT AUTHORITY\SYSTEM`.
- Existing `.env` files were left in place and excluded from the portable archive; no secrets were copied into the report or archive.

## Files created

- `deployment-reports/PHASE_1_REPORT.md`
- `deployment-reports/backups/annamalai-phase1-source-assets-20261106.zip`

The restricted database snapshots are stored outside the project folder above.

## Tests and result

- SQLite inventory and product-image path checks: **PASS**.
- SQLite online backups and integrity/count verification: **PASS**.
- Portable archive CRC test and temporary extraction check: **PASS**.
- Secret/dependency/database exclusion check for the portable archive: **PASS**.
- Application records or files changed: **none**.

## Phase 2 readiness

Proceeding to Phase 2 is safe for read-only inspection. The live Supabase table/schema, Auth-user mapping, and policies still require verification through a privileged SQL Editor because the configured publishable key cannot read `admin_users` or `auth.users`. See `PHASE_2_REPORT.md` for the exact read-only checks and the migration approval boundary.
