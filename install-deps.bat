@echo off
echo ===================================================
echo   Installing Lepakshi Spices Dependencies
echo ===================================================

echo.
echo [1/4] Installing Root dependencies...
call npm install

echo.
echo [2/4] Installing Server dependencies...
call npm --prefix server install

echo.
echo [3/4] Installing Admin Frontend dependencies...
call npm --prefix apps/admin install

echo.
echo [4/4] Installing User Frontend dependencies...
call npm --prefix apps/user install

echo.
echo ===================================================
echo   All dependencies installed successfully!
echo ===================================================
pause
