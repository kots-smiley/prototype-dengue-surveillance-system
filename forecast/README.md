# Dengue Surveillance Forecast (Public Site)

This is the **public, no-login** forecast dashboard. It pulls read-only data from the backend’s public endpoints (e.g. `/api/public/forecast/summary`) so the numbers match what the admin system has collected.

## Run locally

1. Start the backend (`backend/`) on port `5000`
2. In this folder:

```bash
npm install
npm run dev
```

## Environment

- Copy `env.example` to `.env` and set `VITE_API_URL` if needed.

## Deploy to Vercel

In Vercel:

- **Framework preset**: Vite
- **Root Directory**: `forecast`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Environment Variables**:
  - `VITE_API_URL=https://your-backend.onrender.com` (do **not** include `/api` — the app appends it)



