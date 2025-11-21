@echo off
echo ================================================
echo  DePIN Patient Monitor - Complete Setup
echo ================================================
echo.

echo [1/4] Starting Ganache (Local Blockchain)...
echo.
start "Ganache Blockchain" cmd /k "ganache --port 8545 --deterministic --chain.hardfork shanghai && echo. && echo Ganache is running with Shanghai hardfork support. Keep this window open! && pause"

timeout /t 3 /nobreak >nul

echo [2/4] Starting Mosquitto (MQTT Broker)...
echo.
where mosquitto >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Mosquitto not found!
    echo Install it with: choco install mosquitto
    echo.
    pause
) else (
    start "Mosquitto MQTT Broker" cmd /k "mosquitto -v && pause"
)

timeout /t 2 /nobreak >nul

echo.
echo [3/4] Next Steps:
echo ================================================
echo.
echo 1. Deploy contracts using Remix IDE:
echo    - Go to https://remix.ethereum.org
echo    - Import contracts from backend/contracts/
echo    - Compile PatientMonitor.sol
echo    - Deploy to http://127.0.0.1:8545 via MetaMask
echo.
echo 2. Configure backend/.env:
echo    - TON_CONTRACT_ADDRESS=^<deployed_address^>
echo    - TON_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
echo    - TON_RPC=http://127.0.0.1:8545
echo.
echo 3. Start backend:
echo    cd backend
echo    node index.js
echo.
echo [4/4] Press any key to open setup guide...
pause >nul

start SETUP_GUIDE.md

echo.
echo ================================================
echo  Setup in progress...
echo  Keep Ganache and Mosquitto windows open!
echo ================================================
echo.
pause
