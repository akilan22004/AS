# furniture-

Annamalai Furniture — Premium Handcrafted Solid Wood Furniture Web Application & Admin Portal.

## Overview
A modern, mobile-first luxury furniture catalogue and administrative management system built with React, Vite, TypeScript, Tailwind CSS, Express, and Supabase.

## Tech Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, React Query, React Router v7.
- **Backend API**: Express, Node.js, Prisma ORM, SQLite.
- **Database & Storage**: Supabase (PostgreSQL & Supabase Storage bucket `furniture_image`).
- **Deployment Target**: Vercel (SPA mode with configured rewrites and security headers).

## Project Structure
- `client/`: Mobile-first customer website and Admin Portal.
- `server/`: Express REST API, Prisma schema, image processing services.
- `supabase/`: Database migration SQL and storage bucket policies.

## Development

```bash
# Install dependencies
npm run install:all

# Run both client and backend concurrently
npm run dev

# Run client only
npm run client

# Run backend server only
npm run server
```

## Vercel Deployment
This repository is pre-configured with `vercel.json` for seamless deployment:
- Framework: Vite
- Root Directory: `.` or `client`
- Build Command: `npm --prefix client run build`
- Output Directory: `client/dist`

### Environment Variables
Configure the following in your Vercel Project Settings:
- `VITE_SUPABASE_URL`: Your Supabase Project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase publishable/anon key
