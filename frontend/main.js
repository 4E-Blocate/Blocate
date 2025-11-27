import { ethers } from 'ethers';

// Configuration - UPDATE THIS AFTER DEPLOYMENT!
const CONFIG = {
  CONTRACT_ADDRESS: "0xDef80349B405f4AEBC83B2ccB360F71a142E13bA", // Replace with your deployed address
  SEPOLIA_CHAIN_ID: "0xaa36a7", // 11155111 in decimal
  SEPOLIA_RPC: "https://eth-sepolia.g.alchemy.com/v2/demo", // Public RPC for fallback
  GUNDB_PEERS: ['http://localhost:8765/gun'] // GunDB relay server from backend
};

// Initialize GunDB
let gun = null;
let sensorDataListener = null;

// Try to load Gun if available
async function initGunDB() {
  try {
    // Check if Gun is already loaded
    if (typeof Gun !== 'undefined') {
      gun = Gun({
        peers: CONFIG.GUNDB_PEERS,
        localStorage: false,
        radisk: false
      });
      console.log('✅ GunDB initialized with peers:', CONFIG.GUNDB_PEERS);
      subscribeToSensorData();
    } else {
      console.warn('⚠️ Gun library not loaded. Loading from CDN...');
      // Dynamically load Gun script
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/gun/gun.js';
      script.onload = () => {
        gun = Gun({
          peers: CONFIG.GUNDB_PEERS,
          localStorage: false,
          radisk: false
        });
        console.log('✅ GunDB initialized with peers:', CONFIG.GUNDB_PEERS);
        subscribeToSensorData();
      };
      script.onerror = () => {
        console.error('❌ Failed to load Gun library');
      };
      document.head.appendChild(script);
    }
  } catch (error) {
    console.warn('⚠️ GunDB initialization failed:', error.message);
  }
}

// Subscribe to real-time sensor data from GunDB
function subscribeToSensorData() {
  if (!gun) return;
  
  console.log('📡 Subscribing to GunDB events...');
  
  // Listen to all patient telemetry events
  gun.get('events').map().on((data, key) => {
    if (data && data.deviceId) {
      console.log('📥 Received sensor data:', data);
      updateSensorDisplay(data);
    }
  });
  
  console.log('✅ Listening for sensor data from GunDB');
}

// Contract ABI - Minimal interface for our needs
const CONTRACT_ABI = [
  "function registerDevice(string deviceId, address guardian, string fullName, uint8 age, string homeLocation)",
  "function getDevice(string deviceId) view returns (tuple(string deviceId, address patient, address guardian, string fullName, uint8 age, string homeLocation, bool isActive, uint256 registeredAt))",
  "function getDeviceEvents(string deviceId, uint256 limit) view returns (tuple(string deviceId, bytes32 dataHash, address guardian, string eventType, uint256 timestamp)[])",
  "function isDeviceRegistered(string deviceId) view returns (bool)",
  "function isDeviceActive(string deviceId) view returns (bool)",
  "function logEvent(string deviceId, bytes32 dataHash, string eventType)",
  "function deviceRegistry() view returns (address)",
  "function eventLogger() view returns (address)"
];

// Global state
let provider = null;
let signer = null;
let contract = null;
let userAddress = null;

// DOM Elements
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const walletStatus = document.getElementById('walletStatus');
const registerForm = document.getElementById('registerForm');
const getDeviceBtn = document.getElementById('getDeviceBtn');
const getEventsBtn = document.getElementById('getEventsBtn');
const deviceInfo = document.getElementById('deviceInfo');
const eventsOutput = document.getElementById('eventsOutput');
const contractAddress = document.getElementById('contractAddress');
const networkName = document.getElementById('networkName');

// Initialize
init();

function init() {
  // Display contract address
  contractAddress.textContent = CONFIG.CONTRACT_ADDRESS;
  
  // Initialize GunDB for real-time sensor data
  initGunDB();
  
  // Check if MetaMask is installed
  if (typeof window.ethereum === 'undefined') {
    walletStatus.innerHTML = '<span class="status-icon">⚠️</span><span class="status-text">Please install MetaMask</span>';
    connectBtn.disabled = true;
    return;
  }

  // Setup event listeners
  connectBtn.addEventListener('click', connectWallet);
  disconnectBtn.addEventListener('click', disconnectWallet);
  registerForm.addEventListener('submit', handleRegister);
  getDeviceBtn.addEventListener('click', getDeviceInfo);
  getEventsBtn.addEventListener('click', getDeviceEvents);

  // Listen for account changes
  window.ethereum.on('accountsChanged', handleAccountsChanged);
  window.ethereum.on('chainChanged', () => window.location.reload());

  // Try to connect if already authorized
  checkIfConnected();
}

// Update sensor display with real-time data
function updateSensorDisplay(data) {
  const bpmValue = document.getElementById('bpmValue');
  const tempValue = document.getElementById('tempValue');
  const gpsValue = document.getElementById('gpsValue');
  const deviceValue = document.getElementById('deviceValue');
  const lastUpdate = document.getElementById('lastUpdate');
  const sensorStatus = document.getElementById('sensorStatus');
  const eventAlert = document.getElementById('eventAlert');
  
  // Update values
  bpmValue.textContent = data.bpm || '--';
  tempValue.textContent = data.temp ? data.temp.toFixed(1) : '--';
  gpsValue.textContent = data.gps || '--';
  deviceValue.textContent = data.deviceId || '--';
  
  // Update timestamp
  const now = new Date();
  lastUpdate.textContent = now.toLocaleTimeString();
  
  // Update status badge
  sensorStatus.classList.add('active');
  sensorStatus.innerHTML = '<span class="status-dot"></span><span>Receiving live data</span>';
  
  // Show alert if event type is not normal
  if (data.eventType && data.eventType !== 'normal') {
    eventAlert.style.display = 'flex';
    const alertText = eventAlert.querySelector('.alert-text');
    
    if (data.eventType === 'alert') {
      alertText.textContent = `⚠️ Alert: Abnormal vitals detected - BPM: ${data.bpm}, Temp: ${data.temp}°C`;
      eventAlert.style.background = 'rgba(251, 191, 36, 0.2)';
      eventAlert.style.borderColor = '#fbbf24';
    } else if (data.eventType === 'critical') {
      alertText.textContent = `🚨 CRITICAL: Immediate attention required - BPM: ${data.bpm}, Temp: ${data.temp}°C`;
      eventAlert.style.background = 'rgba(239, 68, 68, 0.2)';
      eventAlert.style.borderColor = '#ef4444';
    }
  } else {
    eventAlert.style.display = 'none';
  }
  
  // Visual feedback - flash the updated card
  const cards = document.querySelectorAll('.sensor-card');
  cards.forEach(card => {
    card.style.animation = 'none';
    setTimeout(() => {
      card.style.animation = 'cardFlash 0.5s ease';
    }, 10);
  });
}

// Add CSS animation for card flash
const style = document.createElement('style');
style.textContent = `
  @keyframes cardFlash {
    0%, 100% { background: rgba(255, 255, 255, 0.15); }
    50% { background: rgba(255, 255, 255, 0.3); }
  }
`;
document.head.appendChild(style);

async function checkIfConnected() {
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length > 0) {
      await connectWallet();
    }
  } catch (error) {
    console.error('Error checking connection:', error);
  }
}

async function connectWallet() {
  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Create provider and signer
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    userAddress = await signer.getAddress();

    // Check network
    const network = await provider.getNetwork();
    networkName.textContent = network.name === 'sepolia' ? 'Sepolia Testnet' : `${network.name} (Chain ID: ${network.chainId})`;

    // Check if on Sepolia
    if (network.chainId !== 11155111n) {
      const switchNetwork = confirm('Please switch to Sepolia Testnet. Switch now?');
      if (switchNetwork) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CONFIG.SEPOLIA_CHAIN_ID }],
          });
          window.location.reload();
          return;
        } catch (error) {
          console.error('Failed to switch network:', error);
          alert('Failed to switch network. Please switch to Sepolia manually.');
          return;
        }
      } else {
        alert('This app requires Sepolia Testnet.');
        return;
      }
    }

    // Create contract instance
    contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    // Update UI
    walletStatus.innerHTML = `<span class="status-icon">✅</span><span class="status-text">Connected: ${userAddress.substring(0, 6)}...${userAddress.substring(38)}</span>`;
    walletStatus.className = 'connected';
    connectBtn.style.display = 'none';
    disconnectBtn.style.display = 'inline-block';

    console.log('Connected to wallet:', userAddress);
    console.log('Contract:', CONFIG.CONTRACT_ADDRESS);

  } catch (error) {
    console.error('Connection error:', error);
    alert('Failed to connect wallet: ' + error.message);
  }
}

function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // User disconnected
    location.reload();
  } else if (accounts[0] !== userAddress) {
    // User switched accounts
    location.reload();
  }
}

function disconnectWallet() {
  // Reset state
  provider = null;
  signer = null;
  contract = null;
  userAddress = null;
  
  // Update UI
  walletStatus.innerHTML = '<span class="status-icon">❌</span><span class="status-text">Wallet Not Connected</span>';
  walletStatus.className = 'disconnected';
  connectBtn.style.display = 'inline-block';
  disconnectBtn.style.display = 'none';
  
  // Clear results
  deviceInfo.innerHTML = '';
  deviceInfo.classList.remove('show');
  eventsOutput.innerHTML = '';
  eventsOutput.classList.remove('show');
  
  console.log('Wallet disconnected');
}

async function handleRegister(e) {
  e.preventDefault();

  if (!contract) {
    alert('Please connect your wallet first!');
    return;
  }

  const deviceId = document.getElementById('deviceId').value.trim();
  const patientName = document.getElementById('patientName').value.trim();
  const age = parseInt(document.getElementById('age').value);
  const guardianAddressInput = document.getElementById('guardianAddress').value.trim();
  const homeGPS = document.getElementById('homeGPS').value.trim();

  // Use provided guardian address or default to user's wallet
  const guardianAddress = guardianAddressInput || userAddress;

  // Validate guardian address if provided
  if (guardianAddressInput && !ethers.isAddress(guardianAddressInput)) {
    alert('Invalid guardian wallet address format!');
    return;
  }

  // Validate GPS format
  if (!homeGPS.match(/^-?\d+\.?\d*,-?\d+\.?\d*$/)) {
    alert('Invalid GPS format. Use: latitude,longitude (e.g., 14.5995,120.9842)');
    return;
  }

  try {
    console.log('Registering device:', { deviceId, patientName, age, guardianAddress, homeGPS });

    // Check if already registered (with retry for new contracts)
    let isRegistered = false;
    let retries = 3;
    while (retries > 0) {
      try {
        isRegistered = await contract.isDeviceRegistered(deviceId);
        break;
      } catch (err) {
        if (err.code === 'BAD_DATA' && retries > 1) {
          console.log('Contract not ready, waiting 3 seconds...');
          await new Promise(resolve => setTimeout(resolve, 3000));
          retries--;
        } else {
          throw err;
        }
      }
    }
    
    if (isRegistered) {
      alert(`Device ${deviceId} is already registered!`);
      return;
    }

    // Disable button
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Waiting for signature...';

    // Call contract
    const tx = await contract.registerDevice(
      deviceId,
      guardianAddress, // Can be different from patient
      patientName,
      age,
      homeGPS
    );

    submitBtn.textContent = 'Waiting for confirmation...';
    console.log('Transaction sent:', tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);

    const guardianNote = guardianAddressInput ? `\nGuardian: ${guardianAddress}` : '\nGuardian: Same as patient (your wallet)';
    alert(`✅ Device registered successfully!${guardianNote}\n\nTransaction: ${tx.hash}`);
    
    // Reset form
    registerForm.reset();
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;

  } catch (error) {
    console.error('Registration error:', error);
    
    let errorMsg = 'Registration failed: ';
    if (error.code === 'ACTION_REJECTED') {
      errorMsg += 'Transaction was rejected by user';
    } else if (error.message.includes('insufficient funds')) {
      errorMsg += 'Insufficient funds for gas. Get Sepolia ETH from a faucet.';
    } else {
      errorMsg += error.message;
    }
    
    alert(errorMsg);
    
    // Re-enable button
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Register Device';
  }
}

async function getDeviceInfo() {
  if (!contract) {
    alert('Please connect your wallet first!');
    return;
  }

  const deviceId = document.getElementById('queryDeviceId').value.trim();
  if (!deviceId) {
    alert('Please enter a device ID');
    return;
  }

  try {
    getDeviceBtn.disabled = true;
    getDeviceBtn.innerHTML = '<span class="loading"></span> Loading...';

    const device = await contract.getDevice(deviceId);
    console.log('Device info:', device);

    if (!device.isActive && device.registeredAt === 0n) {
      deviceInfo.innerHTML = `<h4>Device Not Found</h4><p>Device "${deviceId}" is not registered.</p>`;
      deviceInfo.classList.add('show');
      return;
    }

    const registeredDate = new Date(Number(device.registeredAt) * 1000).toLocaleString();

    deviceInfo.innerHTML = `
      <h4>Device Information</h4>
      <div class="device-info-item"><strong>Device ID:</strong> ${device.deviceId}</div>
      <div class="device-info-item"><strong>Patient Name:</strong> ${device.fullName}</div>
      <div class="device-info-item"><strong>Age:</strong> ${device.age}</div>
      <div class="device-info-item"><strong>Home Location:</strong> ${device.homeLocation}</div>
      <div class="device-info-item"><strong>Guardian:</strong> ${device.guardian}</div>
      <div class="device-info-item"><strong>Patient Wallet:</strong> ${device.patient}</div>
      <div class="device-info-item"><strong>Registered:</strong> ${registeredDate}</div>
      <div class="device-info-item"><strong>Status:</strong> ${device.isActive ? '✅ Active' : '❌ Inactive'}</div>
    `;
    deviceInfo.classList.add('show');

  } catch (error) {
    console.error('Error fetching device:', error);
    alert('Failed to fetch device information: ' + error.message);
  } finally {
    getDeviceBtn.disabled = false;
    getDeviceBtn.textContent = 'Get Device Info';
  }
}

async function getDeviceEvents() {
  if (!contract) {
    alert('Please connect your wallet first!');
    return;
  }

  const deviceId = document.getElementById('queryDeviceId').value.trim();
  if (!deviceId) {
    alert('Please enter a device ID');
    return;
  }

  try {
    getEventsBtn.disabled = true;
    getEventsBtn.innerHTML = '<span class="loading"></span> Loading...';

    const events = await contract.getDeviceEvents(deviceId, 20);
    console.log('Events:', events);

    if (events.length === 0) {
      eventsOutput.innerHTML = `<h4>No Events Found</h4><p>No events recorded for device "${deviceId}".</p>`;
      eventsOutput.classList.add('show');
      return;
    }

    let html = `<h4>Recent Events (${events.length})</h4>`;
    
    events.forEach((event, index) => {
      const timestamp = new Date(Number(event.timestamp) * 1000).toLocaleString();
      const eventTypeClass = event.eventType.toLowerCase();
      
      html += `
        <div class="event-item">
          <strong>Event #${index + 1}</strong>
          <span class="event-type ${eventTypeClass}">${event.eventType.toUpperCase()}</span>
          <br>
          <small><strong>Timestamp:</strong> ${timestamp}</small><br>
          <small><strong>Data Hash:</strong> <code>${event.dataHash}</code></small><br>
          <small><strong>Guardian:</strong> ${event.guardian}</small>
        </div>
      `;
    });

    eventsOutput.innerHTML = html;
    eventsOutput.classList.add('show');

  } catch (error) {
    console.error('Error fetching events:', error);
    alert('Failed to fetch events: ' + error.message);
  } finally {
    getEventsBtn.disabled = false;
    getEventsBtn.textContent = 'Get Events';
  }
}
