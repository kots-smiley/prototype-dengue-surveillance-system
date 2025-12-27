@echo off
echo 🚀 Setting up Dengue Surveillance System...
echo.

echo 📦 Setting up backend...
cd backend
call npm install
echo ✅ Backend dependencies installed
echo.

echo 📦 Setting up frontend...
cd ..\frontend
call npm install
echo ✅ Frontend dependencies installed
echo.

cd ..

echo 📝 Next steps:
echo 1. Set up MongoDB (local or MongoDB Atlas)
echo 2. Copy backend\.env.example to backend\.env and configure
echo 3. Copy frontend\.env.example to frontend\.env
echo 4. Run: cd backend ^&^& npm run prisma:generate ^&^& npm run prisma:migrate ^&^& npm run prisma:seed
echo 5. Start backend: cd backend ^&^& npm run dev
echo 6. Start frontend: cd frontend ^&^& npm run dev
echo.
echo ✅ Setup complete!
pause


