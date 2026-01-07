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


