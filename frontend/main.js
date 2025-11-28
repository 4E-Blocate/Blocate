import { ethers } from 'ethers';

// Configuration - UPDATE THIS AFTER DEPLOYMENT!
const CONFIG = {
  CONTRACT_ADDRESS: "0x717CD91f1C0897CEc98e3e1F85d3Cd6FE7D73C4B", // Replace with your deployed address
  SEPOLIA_CHAIN_ID: "0xaa36a7", // 11155111 in decimal
  SEPOLIA_RPC: "https://eth-sepolia.g.alchemy.com/v2/demo", // Public RPC for fallback
  GUNDB_PEERS: ['http://localhost:8765/gun'], // GunDB relay server from backend
  WEBSOCKET_URL: 'ws://localhost:8080/notifications' // WebSocket notification server
};

// Initialize GunDB
let gun = null;
let sensorDataListener = null;

// WebSocket for real-time notifications
let notificationWS = null;
let notificationQueue = [];

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
  "function getDeviceEventCount(string deviceId) view returns (uint256)",
  "function isDeviceRegistered(string deviceId) view returns (bool)",
  "function isDeviceActive(string deviceId) view returns (bool)",
  "function logEvent(string deviceId, bytes32 dataHash, string eventType)",
  "function getGuardianDevices(address guardian) view returns (string[])",
  "function getPatientDevices(address patient) view returns (string[])",
  "function setGuardianName(string name)",
  "function getGuardianName(address guardian) view returns (string)",
  "function changeGuardian(string deviceId, address newGuardian)",
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
const getMyDevicesBtn = document.getElementById('getMyDevicesBtn');
const getMyPatientsBtn = document.getElementById('getMyPatientsBtn');
const deviceInfo = document.getElementById('deviceInfo');
const eventsOutput = document.getElementById('eventsOutput');
const multiDeviceOutput = document.getElementById('multiDeviceOutput');
const contractAddress = document.getElementById('contractAddress');
const networkName = document.getElementById('networkName');
const setGuardianNameBtn = document.getElementById('setGuardianNameBtn');
const guardianNameInput = document.getElementById('guardianNameInput');
const guardianNameStatus = document.getElementById('guardianNameStatus');
const changeGuardianBtn = document.getElementById('changeGuardianBtn');
const changeGuardianDeviceId = document.getElementById('changeGuardianDeviceId');
const newGuardianAddress = document.getElementById('newGuardianAddress');
const changeGuardianStatus = document.getElementById('changeGuardianStatus');

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
  getMyDevicesBtn.addEventListener('click', getMyDevices);
  getMyPatientsBtn.addEventListener('click', getMyPatients);
  setGuardianNameBtn.addEventListener('click', handleSetGuardianName);
  changeGuardianBtn.addEventListener('click', handleChangeGuardian);

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
    
    // Get DeviceRegistry contract address and create instance for guardian name
    const deviceRegistryAddress = await contract.deviceRegistry();
    console.log('DeviceRegistry address:', deviceRegistryAddress);
    
    const DEVICE_REGISTRY_ABI = [
      "function setGuardianName(string name)",
      "function getGuardianName(address guardian) view returns (string)"
    ];
    
    window.deviceRegistryContract = new ethers.Contract(deviceRegistryAddress, DEVICE_REGISTRY_ABI, signer);

    // Update UI
    walletStatus.innerHTML = `<span class="status-icon">✅</span><span class="status-text">Connected: ${userAddress.substring(0, 6)}...${userAddress.substring(38)}</span>`;
    walletStatus.className = 'connected';
    connectBtn.style.display = 'none';
    disconnectBtn.style.display = 'inline-block';

    console.log('Connected to wallet:', userAddress);
    console.log('Contract:', CONFIG.CONTRACT_ADDRESS);

    // Initialize WebSocket notifications for this guardian
    initNotificationWebSocket(userAddress);

    // Load current guardian name if set
    await loadCurrentGuardianName();

  } catch (error) {
    console.error('Connection error:', error);
    alert('Failed to connect wallet: ' + error.message);
  }
}

async function loadCurrentGuardianName() {
  try {
    console.log('Loading guardian name for:', userAddress);
    
    // Use DeviceRegistry contract directly
    const directContract = window.deviceRegistryContract || contract;
    const currentName = await directContract.getGuardianName(userAddress);
    console.log('Guardian name result:', currentName);
    
    const displayDiv = document.getElementById('currentGuardianNameDisplay');
    const displayText = document.getElementById('currentGuardianNameText');
    
    if (currentName && currentName.trim() !== '') {
      displayText.textContent = currentName;
      displayDiv.style.display = 'block';
      guardianNameInput.placeholder = `Current: ${currentName}`;
      console.log('✅ Name displayed:', currentName);
    } else {
      displayText.textContent = 'Not set';
      displayDiv.style.display = 'block';
      guardianNameInput.placeholder = 'e.g., Dr. Smith, Mom, John Doe';
      console.log('⚠️ No name set');
    }
  } catch (error) {
    console.error('❌ Error loading guardian name:', error);
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
  multiDeviceOutput.innerHTML = '';
  multiDeviceOutput.classList.remove('show');
  
  console.log('Wallet disconnected');
}

// Helper function to get guardian display name
async function getGuardianDisplayName(guardianAddress) {
  if (!contract) {
    return `${guardianAddress.substring(0, 6)}...${guardianAddress.substring(38)}`;
  }
  
  try {
    const name = await contract.getGuardianName(guardianAddress);
    if (name && name.trim() !== '') {
      return `${name} (${guardianAddress.substring(0, 6)}...${guardianAddress.substring(38)})`;
    }
    return `${guardianAddress.substring(0, 6)}...${guardianAddress.substring(38)}`;
  } catch (error) {
    console.error('Error getting guardian name:', error);
    return `${guardianAddress.substring(0, 6)}...${guardianAddress.substring(38)}`;
  }
}

async function getMyDevices() {
  if (!contract) {
    alert('Please connect your wallet first!');
    return;
  }

  try {
    getMyDevicesBtn.disabled = true;
    getMyDevicesBtn.innerHTML = '<span class="loading"></span> Loading...';

    const deviceIds = await contract.getPatientDevices(userAddress);
    console.log('My devices:', deviceIds);

    if (deviceIds.length === 0) {
      multiDeviceOutput.innerHTML = `
        <h4>My Registered Devices (0)</h4>
        <p>You haven't registered any devices yet.</p>
      `;
      multiDeviceOutput.classList.add('show');
      return;
    }

    // Fetch details for each device
    let html = `<h4>My Registered Devices (${deviceIds.length})</h4>`;
    
    for (const deviceId of deviceIds) {
      try {
        const device = await contract.getDevice(deviceId);
        const registeredDate = new Date(Number(device.registeredAt) * 1000).toLocaleString();
        const guardianDisplay = await getGuardianDisplayName(device.guardian);
        
        html += `
          <div class="device-card">
            <div class="device-header">
              <strong>📱 ${device.deviceId}</strong>
              <span class="status-badge ${device.isActive ? 'active' : 'inactive'}">
                ${device.isActive ? '✅ Active' : '❌ Inactive'}
              </span>
            </div>
            <div class="device-details" style="color: navy !important;">
              <div><strong>Patient:</strong> ${device.fullName} (${device.age} years)</div>
              <div><strong>Guardian:</strong> ${guardianDisplay}</div>
              <div><strong>Home:</strong> ${device.homeLocation}</div>
              <div><strong>Registered:</strong> ${registeredDate}</div>
            </div>
          </div>
        `;
      } catch (error) {
        html += `
          <div class="device-card error">
            <strong>${deviceId}</strong>
            <p>Error loading device info</p>
          </div>
        `;
      }
    }

    multiDeviceOutput.innerHTML = html;
    multiDeviceOutput.classList.add('show');

  } catch (error) {
    console.error('Error fetching my devices:', error);
    alert('Failed to fetch your devices: ' + error.message);
  } finally {
    getMyDevicesBtn.disabled = false;
    getMyDevicesBtn.textContent = 'My Registered Devices';
  }
}

async function getMyPatients() {
  if (!contract) {
    alert('Please connect your wallet first!');
    return;
  }

  try {
    getMyPatientsBtn.disabled = true;
    getMyPatientsBtn.innerHTML = '<span class="loading"></span> Loading...';

    const deviceIds = await contract.getGuardianDevices(userAddress);
    console.log('Patients I guard:', deviceIds);

    if (deviceIds.length === 0) {
      multiDeviceOutput.innerHTML = `
        <h4>Patients I'm Guarding (0)</h4>
        <p>You are not assigned as a guardian for any patients yet.</p>
      `;
      multiDeviceOutput.classList.add('show');
      return;
    }

    // Fetch details for each device
    let html = `<h4>Patients I'm Guarding (${deviceIds.length})</h4>`;
    
    for (const deviceId of deviceIds) {
      try {
        const device = await contract.getDevice(deviceId);
        const eventCount = await contract.getDeviceEventCount(deviceId);
        const registeredDate = new Date(Number(device.registeredAt) * 1000).toLocaleString();
        
        html += `
          <div class="device-card guardian" style="color: navy !important;">
            <div class="device-header" style="color: navy !important;">
              <strong>🏥 ${device.deviceId}</strong>
              <span class="status-badge ${device.isActive ? 'active' : 'inactive'}">
          ${device.isActive ? '✅ Active' : '❌ Inactive'}
              </span>
            </div>
            <div class="device-details" style="color: navy !important;">
              <div style="color: navy !important;"><strong>Patient:</strong> ${device.fullName} (${device.age} years)</div>
              <div style="color: navy !important;"><strong>Patient Address:</strong> ${device.patient.substring(0, 6)}...${device.patient.substring(38)}</div>
              <div style="color: navy !important;"><strong>Home Location:</strong> ${device.homeLocation}</div>
              <div style="color: navy !important;"><strong>Events Logged:</strong> ${eventCount.toString()}</div>
              <div style="color: navy !important;"><strong>Registered:</strong> ${registeredDate}</div>
            </div>
            <button class="btn btn-sm" onclick="viewPatientEvents('${deviceId}')" style="color: navy !important; background: transparent; border: 1px solid navy;">View Events</button>
          </div>
        `;
      } catch (error) {
        html += `
          <div class="device-card error">
            <strong>${deviceId}</strong>
            <p>Error loading patient info</p>
          </div>
        `;
      }
    }

    multiDeviceOutput.innerHTML = html;
    multiDeviceOutput.classList.add('show');

  } catch (error) {
    console.error('Error fetching my patients:', error);
    alert('Failed to fetch your patients: ' + error.message);
  } finally {
    getMyPatientsBtn.disabled = false;
    getMyPatientsBtn.textContent = "Patients I'm Guarding";
  }
}

// Helper function to view events for a specific patient
window.viewPatientEvents = async function(deviceId) {
  document.getElementById('queryDeviceId').value = deviceId;
  await getDeviceEvents();
  document.getElementById('eventsOutput').scrollIntoView({ behavior: 'smooth' });
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

async function handleSetGuardianName() {
  if (!contract || !window.deviceRegistryContract) {
    alert('Please connect your wallet first!');
    return;
  }

  const name = guardianNameInput.value.trim();
  if (!name) {
    alert('Please enter a display name');
    return;
  }

  if (name.length > 50) {
    alert('Name is too long (max 50 characters)');
    return;
  }

  try {
    setGuardianNameBtn.disabled = true;
    setGuardianNameBtn.innerHTML = '<span class="loading"></span> Waiting for signature...';

    // Use DeviceRegistry contract directly
    const tx = await window.deviceRegistryContract.setGuardianName(name);
    console.log('Transaction sent:', tx.hash);

    setGuardianNameBtn.textContent = 'Waiting for confirmation...';
    
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);

    guardianNameStatus.innerHTML = `
      <div class="success-message">
        <h4>✅ Guardian Name Set Successfully!</h4>
        <p><strong>Your Display Name:</strong> ${name}</p>
        <p><strong>Wallet Address:</strong> ${userAddress}</p>
        <p>Patients will now see "${name}" instead of just your wallet address.</p>
        <small>Transaction: ${tx.hash}</small>
      </div>
    `;
    guardianNameStatus.classList.add('show');

    // Clear input and reload name
    guardianNameInput.value = '';
    await loadCurrentGuardianName();

  } catch (error) {
    console.error('Error setting guardian name:', error);
    
    let errorMsg = 'Failed to set guardian name: ';
    if (error.code === 'ACTION_REJECTED') {
      errorMsg += 'Transaction was rejected by user';
    } else {
      errorMsg += error.message;
    }
    
    alert(errorMsg);
  } finally {
    setGuardianNameBtn.disabled = false;
    setGuardianNameBtn.textContent = 'Set My Name';
  }
}

async function handleChangeGuardian() {
  if (!contract) {
    alert('Please connect your wallet first!');
    return;
  }

  const deviceId = changeGuardianDeviceId.value.trim();
  const newGuardian = newGuardianAddress.value.trim();

  if (!deviceId) {
    alert('Please enter a device ID');
    return;
  }

  if (!newGuardian || !newGuardian.startsWith('0x') || newGuardian.length !== 42) {
    alert('Please enter a valid wallet address (0x...)');
    return;
  }

  try {
    changeGuardianBtn.disabled = true;
    changeGuardianBtn.innerHTML = '<span class="loading"></span> Waiting for signature...';

    const tx = await contract.changeGuardian(deviceId, newGuardian);
    console.log('Transaction sent:', tx.hash);

    changeGuardianBtn.textContent = 'Waiting for confirmation...';
    
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);

    changeGuardianStatus.innerHTML = `
      <div class="success-message">
        <h4>✅ Guardian Changed Successfully!</h4>
        <p><strong>Device:</strong> ${deviceId}</p>
        <p><strong>New Guardian:</strong> ${newGuardian}</p>
        <p>The new guardian can now monitor this device and receive alerts.</p>
        <small>Transaction: ${tx.hash}</small>
      </div>
    `;
    changeGuardianStatus.classList.add('show');

    // Clear inputs
    changeGuardianDeviceId.value = '';
    newGuardianAddress.value = '';

  } catch (error) {
    console.error('Error changing guardian:', error);
    
    let errorMsg = 'Failed to change guardian: ';
    if (error.code === 'ACTION_REJECTED') {
      errorMsg += 'Transaction was rejected by user';
    } else if (error.message.includes('Only patient')) {
      errorMsg += 'Only the patient can change their guardian';
    } else if (error.message.includes('not registered')) {
      errorMsg += 'Device not registered';
    } else {
      errorMsg += error.message;
    }
    
    alert(errorMsg);
  } finally {
    changeGuardianBtn.disabled = false;
    changeGuardianBtn.textContent = 'Change Guardian';
  }
}

// ============ WebSocket Notification System ============

/**
 * Initialize WebSocket connection for real-time guardian notifications
 * @param {string} guardianAddress - Connected wallet address
 */
function initNotificationWebSocket(guardianAddress) {
  try {
    console.log('Connecting to notification server...');
    
    notificationWS = new WebSocket(CONFIG.WEBSOCKET_URL);

    notificationWS.onopen = () => {
      console.log('✅ Connected to notification server');
      
      // Check if Telegram chat ID is saved in localStorage
      let telegramChatId = localStorage.getItem('telegramChatId');
      
      // Use default Telegram chat ID if not saved (all alerts go to admin)
      if (!telegramChatId) {
        telegramChatId = '7378178370'; // Default admin chat ID
        localStorage.setItem('telegramChatId', telegramChatId);
      }
      
      // Subscribe to notifications for this guardian address
      const subscribeData = {
        type: 'subscribe',
        guardianAddress: guardianAddress
      };
      
      // Include Telegram chat ID if available
      if (telegramChatId) {
        subscribeData.telegramChatId = telegramChatId;
      }
      
      notificationWS.send(JSON.stringify(subscribeData));

      // Show notification permission request
      if (Notification.permission === 'default') {
        requestNotificationPermission();
      }
    };

    notificationWS.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Notification received:', data);

        if (data.type === 'subscribed') {
          console.log('✅ Subscribed to notifications for', data.guardianAddress);
          showInAppNotification('Notifications Enabled', 'You will receive real-time patient alerts', 'success');
        } else if (data.type === 'alert') {
          handleAlertNotification(data);
        }
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    };

    notificationWS.onerror = (error) => {
      console.error('WebSocket error:', error);
      showInAppNotification('Notification Error', 'Failed to connect to notification server', 'error');
    };

    notificationWS.onclose = () => {
      console.log('Notification WebSocket closed');
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (userAddress) {
          initNotificationWebSocket(userAddress);
        }
      }, 5000);
    };

  } catch (error) {
    console.error('Failed to initialize notification WebSocket:', error);
  }
}

/**
 * Request browser notification permission
 */
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Browser does not support notifications');
    return;
  }

  if (Notification.permission === 'granted') {
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    console.log('✅ Notification permission granted');
    showInAppNotification('Notifications Enabled', 'You will receive desktop notifications for patient alerts', 'success');
  }
}

/**
 * Handle incoming alert notification
 * @param {Object} alert - Alert data from server
 */
function handleAlertNotification(alert) {
  const { deviceId, patientName, alertType, message, bpm, temp, gps, timestamp } = alert;

  // Show desktop notification
  showDesktopNotification(alert);

  // Show in-app notification
  const title = `🚨 ${alertType.toUpperCase()} Alert`;
  const body = `${patientName || deviceId}: ${message}`;
  showInAppNotification(title, body, alertType);

  // Play alert sound
  playAlertSound(alertType);

  // Add to notification queue
  notificationQueue.unshift({
    ...alert,
    receivedAt: Date.now()
  });

  // Update UI
  updateNotificationBadge();
  updateAlertsList();
}

/**
 * Show desktop notification (if permission granted)
 * @param {Object} alert - Alert data
 */
function showDesktopNotification(alert) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const { patientName, deviceId, alertType, message, bpm, temp } = alert;

  const options = {
    body: `${message}\nHeart Rate: ${bpm} BPM | Temperature: ${temp}°C`,
    icon: '/assets/alert-icon.png',
    badge: '/assets/badge-icon.png',
    tag: `alert-${deviceId}-${Date.now()}`,
    requireInteraction: alertType === 'critical',
    vibrate: alertType === 'critical' ? [200, 100, 200, 100, 200] : [200, 100, 200]
  };

  const notification = new Notification(
    `🚨 ${alertType.toUpperCase()}: ${patientName || deviceId}`,
    options
  );

  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}

/**
 * Show in-app notification banner
 */
function showInAppNotification(title, message, type = 'info') {
  const existing = document.querySelector('.notification-banner');
  if (existing) {
    existing.remove();
  }

  const banner = document.createElement('div');
  banner.className = `notification-banner notification-${type}`;
  banner.innerHTML = `
    <div class="notification-content">
      <h4>${title}</h4>
      <p>${message}</p>
    </div>
    <button class="notification-close" onclick="this.parentElement.remove()">×</button>
  `;

  document.body.appendChild(banner);

  if (type !== 'critical') {
    setTimeout(() => {
      banner.classList.add('fade-out');
      setTimeout(() => banner.remove(), 300);
    }, 10000);
  }
}

/**
 * Play alert sound
 */
function playAlertSound(alertType) {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (alertType === 'critical') {
      oscillator.frequency.value = 880;
      gainNode.gain.value = 0.3;
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        osc2.connect(gainNode);
        osc2.frequency.value = 880;
        osc2.start();
        osc2.stop(audioContext.currentTime + 0.2);
      }, 300);
    } else {
      oscillator.frequency.value = 440;
      gainNode.gain.value = 0.2;
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.15);
    }
  } catch (error) {
    console.error('Failed to play alert sound:', error);
  }
}

/**
 * Update notification badge
 */
function updateNotificationBadge() {
  const unreadCount = notificationQueue.filter(n => !n.read).length;
  const badge = document.getElementById('notificationBadge');
  if (badge) {
    badge.textContent = unreadCount > 0 ? unreadCount : '';
    badge.style.display = unreadCount > 0 ? 'block' : 'none';
  }
  if (unreadCount > 0) {
    document.title = `(${unreadCount}) BLocate - Patient Alerts`;
  } else {
    document.title = 'BLocate - Patient Monitoring';
  }
}

/**
 * Update alerts list
 */
function updateAlertsList() {
  const alertsList = document.getElementById('alertsList');
  if (!alertsList) return;

  if (notificationQueue.length === 0) {
    alertsList.innerHTML = '<p class="no-alerts">No alerts</p>';
    return;
  }

  alertsList.innerHTML = notificationQueue.slice(0, 10).map(alert => `
    <div class="alert-item alert-${alert.alertType}">
      <div class="alert-header">
        <strong>${alert.patientName || alert.deviceId}</strong>
        <span class="alert-time">${new Date(alert.timestamp).toLocaleString()}</span>
      </div>
      <div class="alert-body">
        <p>${alert.message}</p>
        <div class="alert-vitals">❤️ ${alert.bpm} BPM | 🌡️ ${alert.temp}°C</div>
      </div>
    </div>
  `).join('');
}

