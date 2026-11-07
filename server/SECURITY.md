# Security operations

## Configure the two administrators

Admin registration is intentionally not exposed as a public webpage or API. From a trusted local terminal, prepare the development database and run the interactive setup:

```powershell
npm run db:push
npm run setup:admin
```

The setup prompts for exactly two distinct admin emails, separate usernames, and individual passwords. Password and authenticator-code input is hidden. Each administrator enrolls an authenticator app and confirms it before any account changes are written. Passwords are bcrypt-hashed; TOTP secrets are encrypted with AES-256-GCM. In development, the script writes the allowlist and, if absent, a random MFA encryption key to the ignored `server/.env`. Restart the server after setup.

Rerunning setup resets both configured passwords and MFA enrollment. Back up the local database and `.env` securely first. Do not copy `.env` into source control, tickets, chat, logs, or unencrypted backups. Losing the MFA encryption key requires re-enrollment.

An authorized production operator may use the same local CLI with `NODE_ENV=production`, the preconfigured `ADMIN_EMAILS`, `SESSION_SECRET`, `MFA_ENCRYPTION_KEY`, and `DATABASE_URL` injected from protected sources, plus `ADMIN_SETUP_CONFIRM_PRODUCTION=true`. The operator must also type `PROVISION ADMINS` interactively. The script never writes production secrets or credentials to `.env`. Do not expose a public bootstrap endpoint.

## Production environment and infrastructure

Before production startup:

- Use Node.js 20.19+ or 22.12+ for the patched build and image-processing dependencies.
- Set `NODE_ENV=production`, `ADMIN_EMAILS` to exactly two distinct valid addresses, and `CORS_ORIGIN` to the exact HTTPS frontend origin.
- Set a unique random `SESSION_SECRET` of at least 64 characters and a base64-encoded random 32-byte `MFA_ENCRYPTION_KEY` using the host's secret manager.
- Terminate TLS at a trusted reverse proxy and set `TRUST_PROXY_HOPS` to the exact proxy count. Restrict network access so clients cannot bypass the proxy; the application rejects requests not marked HTTPS by that trusted proxy.
- Keep the SQLite database, session store, and upload directories on restricted persistent storage. Schedule and restore-test encrypted backups of the database, uploads, and required secrets. This codebase does not configure managed backups or a shared multi-instance session store; production topology must provide these operational controls.
- Review dependency advisories and apply updates in a staged environment before release.

The application uses strict-origin checks for production state-changing requests, same-site HTTP-only secure session cookies, login/API rate limits, backend allowlist and role checks, audit records for authentication and successful admin mutations, and decoded-image validation/size limits. Admin TOTP codes are accepted within a one-step clock-skew window and cannot be reused for the same time step.

## Local verification

```powershell
npm --prefix server run test:security
npm --prefix server run test:security-e2e
npm --prefix server run test:admin-e2e
```

The security E2E uses a temporary isolated SQLite database and removes its test files. The authenticated admin suite requires the local QA admin to be enrolled through the setup flow. Neither suite should be pointed at production data.
