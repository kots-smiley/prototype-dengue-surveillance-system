# MongoDB Connection Fix Guide

## Issue
The application is failing to connect to MongoDB Atlas with SSL/TLS errors.

## Solution Options

### Option 1: Fix MongoDB Atlas Connection (Recommended for Production)

1. **Check your MongoDB Atlas connection string format:**
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/database?retryWrites=true&w=majority
   ```

2. **Whitelist your IP address in MongoDB Atlas:**
   - Go to MongoDB Atlas Dashboard
   - Click "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development, you can add `0.0.0.0/0` (allows all IPs - only for development!)
   - Or add your specific IP address

3. **Check your connection string in `.env` file:**
   ```env
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/dengue_surveillance?retryWrites=true&w=majority"
   ```

4. **Verify SSL/TLS settings:**
   - Make sure your connection string includes proper SSL parameters
   - For Prisma with MongoDB Atlas, the connection string should work as-is

### Option 2: Use Local MongoDB (Recommended for Development)

1. **Install MongoDB locally:**
   - Download from: https://www.mongodb.com/try/download/community
   - Or use Docker: `docker run -d -p 27017:27017 --name mongodb mongo`

2. **Update your `.env` file:**
   ```env
   DATABASE_URL="mongodb://localhost:27017/dengue_surveillance?retryWrites=true&w=majority"
   ```

3. **Run Prisma migrations:**
   ```bash
   cd backend
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

### Quick Fix: Update .env File

Create or update `backend/.env` with one of these:

**For Local MongoDB:**
```env
DATABASE_URL="mongodb://localhost:27017/dengue_surveillance?retryWrites=true&w=majority"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

**For MongoDB Atlas (after fixing IP whitelist):**
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/dengue_surveillance?retryWrites=true&w=majority"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

## After Updating .env

1. Restart the backend server
2. The connection should work now
