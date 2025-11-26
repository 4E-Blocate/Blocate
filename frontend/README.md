# Patient Guardian Frontend

Simple web interface for the Patient Guardian DePIN system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Update contract address in `main.js`:
   - After deploying backend contracts, copy the PatientMonitor address
   - Replace `CONTRACT_ADDRESS` in `main.js` line 4

3. Run development server:
```bash
npm run dev
```

4. Open browser to the URL shown (usually http://localhost:5173)

## Features

- ✅ Connect MetaMask wallet
- ✅ Register new IoT devices
- ✅ View device information
- ✅ View event history
- ✅ Automatic network detection (Sepolia)

## Requirements

- MetaMask browser extension
- Sepolia testnet ETH (from faucet)
- Deployed smart contracts on Sepolia
