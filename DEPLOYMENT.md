# Deployment Guide

This guide covers deploying **HealthWatch** to Vercel (frontend + public forecast site) and Render (backend) with MongoDB Atlas.

## Prerequisites

1. **MongoDB Atlas** — create a free cluster, a database user, and get the connection string. Whitelist IPs (or `0.0.0.0/0` for testing).
2. **Vercel account** — for the admin frontend and the public forecast site.
3. **Render account** — for the backend API.

## Backend Deployment (Render)

### Option A — Blueprint (recommended)
1. The repo includes `render.yaml`. Push to GitHub.
2. In Render: **New +** → **Blueprint**, connect the repo. Render reads `render.yaml`.
3. Set the secret env vars (`DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `FRONTEND_URLS`).

### Option B — Manual Web Service
- **Root Directory:** `backend`
- **Build Command:** `npm install && npm run prisma:generate && npm run build`
- **Start Command:** `npm start`
- **Health Check Path:** `/api/health`

### Environment Variables (Render)

```env
NODE_ENV=production
DATABASE_URL=mongodb+srv://USER:PASS@cluster.mongodb.net/healthwatch?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=7d
PORT=5000
FRONTEND_URL=https://your-admin.vercel.app
# Allow both the admin app and the public forecast site through CORS:
FRONTEND_URLS=https://your-admin.vercel.app,https://your-forecast.vercel.app
```

### Sync schema & seed (MongoDB)

MongoDB uses `prisma db push` (not SQL migrations). After the first deploy, run once via the Render Shell:

```bash
npm run prisma:db:push   # create collections/indexes
npm run db:seed          # seed barangays, diseases, users, sample data
```

## Frontend (Admin) Deployment (Vercel)

- **Framework Preset:** Vite
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variable:**
  ```
  VITE_API_BASE_URL=https://your-backend.onrender.com/api
  ```

## Public Forecast Site Deployment (Vercel)

- **Framework Preset:** Vite
- **Root Directory:** `forecast`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variable:**
  ```
  VITE_API_URL=https://your-backend.onrender.com
  ```
  (Do **not** include `/api` — the app appends it.)

After deploying the frontends, set the backend `FRONTEND_URLS` (Render) to include both Vercel URLs and restart the service.

## Post-Deployment Checklist

- [ ] `GET https://your-backend.onrender.com/api/health` returns `{ success: true }`
- [ ] Admin app loads and login works
- [ ] Public forecast site loads and shows data
- [ ] Schema pushed and data seeded
- [ ] CORS allows both frontends
- [ ] Strong `JWT_SECRET` (32+ chars) set
- [ ] Default seeded passwords changed

## Troubleshooting

- **DB connection failed:** check Atlas IP whitelist and the connection string.
- **Prisma client missing:** ensure `npm run prisma:generate` runs in the build (it also runs via `postinstall`).
- **CORS errors:** verify `FRONTEND_URL` / `FRONTEND_URLS` match the deployed Vercel URLs exactly.
- **Empty dashboards:** run `npm run db:seed`.
