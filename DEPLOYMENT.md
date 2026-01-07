# Deployment Guide

This guide covers deploying the Dengue Surveillance System to Vercel (frontend) and Render (backend) with MongoDB Atlas.

## Prerequisites

1. **MongoDB Atlas Account**
   - Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Get your connection string
   - Whitelist IP addresses (or use `0.0.0.0/0` for development)

2. **Vercel Account**
   - Sign up at [Vercel](https://vercel.com)

3. **Render Account**
   - Sign up at [Render](https://render.com)

## Backend Deployment (Render)

### Step 1: Prepare MongoDB Atlas

1. Create a MongoDB Atlas cluster
2. Create a database user
3. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/dengue_surveillance?retryWrites=true&w=majority
   ```
4. Whitelist IP addresses (for Render, you may need to allow all: `0.0.0.0/0`)

### Step 2: Deploy to Render

#### Option A: Using Render Dashboard

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `dengue-surveillance-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run prisma:generate && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free or Starter

5. Add Environment Variables:
   ```
   NODE_ENV=production
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/dengue_surveillance?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
   JWT_EXPIRES_IN=7d
   PORT=5000
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

6. Click "Create Web Service"

#### Option B: Using render.yaml (Recommended)

1. The `render.yaml` file is already configured in the backend directory
2. Push your code to GitHub
3. In Render Dashboard, select "New +" → "Blueprint"
4. Connect your repository
5. Render will automatically detect and use `render.yaml`

### Step 3: Run Database Migrations

After deployment, run migrations:

1. SSH into your Render service (if available) OR
2. Use Render Shell:
   ```bash
   cd backend
   npm run prisma:migrate
   npm run prisma:seed  # Optional: seed initial data
   ```

Or add a one-time migration script in Render's build command.

### Step 4: Get Backend URL

After deployment, Render will provide a URL like:
```
https://dengue-surveillance-api.onrender.com
```

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. Ensure `frontend/.env.example` exists (already created)
2. Update `frontend/vite.config.ts` if needed

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
cd frontend
npm install -g vercel
vercel login
vercel
```

Follow the prompts and set environment variables when asked.

#### Option B: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

6. Click "Deploy"

## Public Forecast Site Deployment (Vercel)

This repo also includes a **public, no-login** forecast site in `forecast/`.

### Deploy to Vercel (Dashboard)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `forecast`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
   (Do **not** include `/api` — the app appends it.)

6. Click "Deploy"

### Update Backend CORS (Render)

Add the forecast site URL to the backend env var in Render:

```
FRONTEND_URLS=https://your-frontend.vercel.app,https://your-forecast.vercel.app
```

Then restart the backend service.

### Step 3: Update Backend CORS

After getting your Vercel frontend URL, update the backend's `FRONTEND_URL` environment variable in Render:

```
FRONTEND_URL=https://your-frontend.vercel.app
```

Then restart the backend service.

## Environment Variables Summary

### Backend (Render)

```env
NODE_ENV=production
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/dengue_surveillance?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=7d
PORT=5000
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (Vercel)

```env
VITE_API_URL=https://your-backend.onrender.com/api
```

## Post-Deployment Checklist

- [ ] Backend is accessible at `https://your-backend.onrender.com/api/health`
- [ ] Frontend is accessible at `https://your-frontend.vercel.app`
- [ ] Database migrations completed
- [ ] Initial data seeded (if needed)
- [ ] CORS configured correctly
- [ ] Environment variables set correctly
- [ ] Test login functionality
- [ ] Test API endpoints

## Troubleshooting

### Backend Issues

1. **Database Connection Failed**
   - Check MongoDB Atlas IP whitelist
   - Verify connection string format
   - Check network access in MongoDB Atlas

2. **Prisma Client Not Generated**
   - Ensure `postinstall` script runs: `npm run prisma:generate`
   - Check build logs in Render

3. **CORS Errors**
   - Verify `FRONTEND_URL` matches your Vercel URL exactly
   - Check browser console for exact error

### Frontend Issues

1. **API Calls Failing**
   - Verify `VITE_API_URL` is set correctly
   - Check browser network tab for actual requests
   - Ensure backend is running

2. **Build Failures**
   - Check Vercel build logs
   - Verify all dependencies are in `package.json`

## Production Best Practices

1. **Security**
   - Use strong `JWT_SECRET` (32+ characters)
   - Enable MongoDB Atlas network restrictions
   - Use environment variables for all secrets
   - Enable HTTPS (automatic on Vercel/Render)

2. **Performance**
   - Enable Prisma connection pooling
   - Use MongoDB indexes (already defined in schema)
   - Monitor Render service metrics

3. **Monitoring**
   - Set up error tracking (e.g., Sentry)
   - Monitor API response times
   - Set up uptime monitoring

## Cost Estimation

- **Vercel**: Free tier (hobby) - sufficient for most use cases
- **Render**: Free tier available (with limitations)
- **MongoDB Atlas**: Free tier (M0) - 512MB storage

## Support

For issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check Vercel logs: Dashboard → Your Project → Deployments → View Function Logs
3. Check MongoDB Atlas logs: Atlas → Monitoring

