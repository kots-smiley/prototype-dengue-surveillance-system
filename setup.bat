@echo off
echo Setting up HealthWatch - Multi-Disease Surveillance System...
echo.

echo Installing backend dependencies...
cd backend
call npm install
echo Backend dependencies installed.
echo.

echo Installing frontend dependencies...
cd ..\frontend
call npm install
echo Frontend dependencies installed.
echo.

echo Installing forecast (public site) dependencies...
cd ..\forecast
call npm install
echo Forecast dependencies installed.
echo.

cd ..

echo Next steps:
echo 1. Set up MongoDB (local or MongoDB Atlas)
echo 2. Copy backend\env.example to backend\.env and configure DATABASE_URL + JWT_SECRET
echo 3. Copy frontend\env.example to frontend\.env
echo 4. Copy forecast\env.example to forecast\.env
echo 5. Run: cd backend ^&^& npm run prisma:generate ^&^& npm run prisma:db:push ^&^& npm run db:seed
echo 6. Start backend: cd backend ^&^& npm run dev
echo 7. Start frontend: cd frontend ^&^& npm run dev
echo 8. Start forecast: cd forecast ^&^& npm run dev
echo.
echo Setup complete!
pause
