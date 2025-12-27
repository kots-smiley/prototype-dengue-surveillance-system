# Render Deployment Guide

## 🚀 Quick Deploy to Render

### Step 1: Connect Repository

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `kots-smiley/prototype-dengue-surveillance-system`
4. Click **"Connect"**

### Step 2: Configure Service

The `render.yaml` file is already configured, but you can also configure manually:

**Basic Settings:**
- **Name**: `dengue-surveillance-api`
- **Environment**: `Node`
- **Region**: `Oregon` (or your preferred region)
- **Branch**: `main`
- **Root Directory**: `backend`

**Build & Start:**
- **Build Command**: `npm ci && npm run prisma:generate && npm run build`
- **Start Command**: `npm start`

**Health Check:**
- **Health Check Path**: `/api/health`

### Step 3: Set Environment Variables

Click **"Environment"** tab and add these variables:

#### Required Variables:

```env
NODE_ENV=production
```

```env
DATABASE_URL=mongodb+srv://kotssmiley_db_user:Oami3hj3MG1gjhrv@prototype.pbrw9z0.mongodb.net/dengue_surveillance?retryWrites=true&w=majority
```

```env
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long-change-this
```
⚠️ **Important**: Use a strong, random secret (32+ characters)

```env
JWT_EXPIRES_IN=7d
```

```env
FRONTEND_URL=https://your-frontend.vercel.app
```
⚠️ **Update this** after deploying frontend to Vercel

#### Optional Variables:

```env
PORT=5000
```
(Usually auto-set by Render, but you can specify)

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will:
   - Install dependencies
   - Generate Prisma Client
   - Build TypeScript
   - Start the server

### Step 5: Push Database Schema

After the first deployment, you need to push the Prisma schema to MongoDB:

**Option A: Using Render Shell**
1. Go to your service in Render Dashboard
2. Click **"Shell"** tab
3. Run:
   ```bash
   cd backend
   npx prisma db push
   ```

**Option B: Using Render Script**
Add this to your build command temporarily:
```bash
npm ci && npm run prisma:generate && npm run build && npx prisma db push
```

**Option C: Manual via MongoDB Atlas**
- The schema will be created automatically when you first use the app
- Or use Prisma Studio: `npx prisma studio` (in Render Shell)

### Step 6: Seed Initial Data (Optional)

If you want to seed initial admin user:

1. Go to **"Shell"** in Render Dashboard
2. Run:
   ```bash
   cd backend
   npm run prisma:seed
   ```

Or add to build command (one-time):
```bash
npm ci && npm run prisma:generate && npm run build && npm run prisma:seed
```

## 🔧 Configuration Details

### Build Process

1. **`npm ci`** - Clean install (faster, more reliable than `npm install`)
2. **`npm run prisma:generate`** - Generate Prisma Client
3. **`npm run build`** - Compile TypeScript to JavaScript
4. **`npm start`** - Run the compiled server

### Port Configuration

- Render automatically sets the `PORT` environment variable
- The server listens on `0.0.0.0` to accept external connections
- Default port is `5000` if not set

### Health Check

- Endpoint: `/api/health`
- Returns: `{ status: 'ok', timestamp: '...' }`
- Used by Render to monitor service health

## 📋 Post-Deployment Checklist

- [ ] Service is running (green status in Render)
- [ ] Health check passes (`/api/health` returns 200)
- [ ] Database schema pushed (`npx prisma db push`)
- [ ] Initial data seeded (optional)
- [ ] Environment variables set correctly
- [ ] CORS configured with frontend URL
- [ ] Test API endpoints

## 🔍 Troubleshooting

### Build Fails

**Error: Prisma Client not generated**
- Solution: Ensure `npm run prisma:generate` is in build command
- Check that `postinstall` script runs: `prisma generate`

**Error: TypeScript compilation fails**
- Solution: Check `tsconfig.json` settings
- Verify all imports are correct

### Runtime Errors

**Error: Cannot connect to database**
- Check `DATABASE_URL` is set correctly
- Verify MongoDB Atlas IP whitelist includes Render IPs
- For Render, you may need to whitelist `0.0.0.0/0` (all IPs)

**Error: JWT_SECRET not set**
- Ensure `JWT_SECRET` environment variable is set
- Must be at least 32 characters

**Error: CORS errors**
- Verify `FRONTEND_URL` matches your Vercel URL exactly
- Check CORS configuration in `server.ts`

### Database Issues

**Schema not created**
- Run `npx prisma db push` in Render Shell
- Or add to build command (one-time)

**Connection timeout**
- Check MongoDB Atlas Network Access
- Add Render's IP range or `0.0.0.0/0` for development

## 🔗 Useful Links

- **Render Dashboard**: https://dashboard.render.com
- **Service Logs**: Available in Render Dashboard → Your Service → Logs
- **Shell Access**: Render Dashboard → Your Service → Shell
- **Environment Variables**: Render Dashboard → Your Service → Environment

## 📝 Notes

- Render free tier has limitations (spins down after inactivity)
- Consider upgrading to Starter plan for always-on service
- Monitor logs for any issues
- Set up alerts in Render Dashboard

## ✅ Success Indicators

When deployment is successful, you should see:
- ✅ Service status: "Live"
- ✅ Health check: Passing
- ✅ Logs show: "🚀 Server running on port..."
- ✅ API responds at: `https://your-service.onrender.com/api/health`

Your backend is now ready for production! 🎉

