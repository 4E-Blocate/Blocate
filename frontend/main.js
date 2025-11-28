import { ethers } from 'ethers';

// Configuration
const CONFIG = {
  CONTRACT_ADDRESS: "0x717CD91f1C0897CEc98e3e1F85d3Cd6FE7D73C4B",
  SEPOLIA_CHAIN_ID: "0xaa36a7",
  SEPOLIA_RPC: "https://eth-sepolia.g.alchemy.com/v2/demo",
  GUNDB_PEERS: ['http://localhost:8765/gun'],
  WEBSOCKET_URL: 'ws://localhost:8080/notifications'
};

// Contract ABI
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
let gun = null;
let map = null;
let homeMarker = null;
let currentMarker = null;
let safeZoneCircle = null;
let bpmChart = null;
let tempChart = null;
let selectedDeviceId = null; // Track which patient is being monitored
let guardianPatients = []; // List of patients assigned to the logged-in guardian

// Vital sign history for charts
const vitalHistory = {
  bpm: [],
  temp: [],
  spo2: [],
  timestamps: [],
  maxPoints: 20
};

// Initialize app
document.addEventListener('DOMContentLoaded', init);

function init() {
  console.log('Initializing Blocate Patient Guardian DePIN...');
  
  // Setup navigation
  setupNavigation();
  
  // Setup wallet connection
  setupWallet();
  
  // Initialize GunDB for real-time data
  initGunDB();
  
  // Initialize map
  initMap();
  
  // Initialize charts
  initCharts();
  
  // Setup event listeners
  setupEventListeners();
  
  // Display contract info
  document.getElementById('contractAddress').textContent = CONFIG.CONTRACT_ADDRESS;
}

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.content-section');
  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSection = item.dataset.section;
      
      // Update active nav item
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      // Show target section
      sections.forEach(section => section.classList.remove('active'));
      document.getElementById(targetSection).classList.add('active');
    });
  });
}

function setupWallet() {
  const connectBtn = document.getElementById('connectBtn');
  const disconnectBtn = document.getElementById('disconnectBtn');
  
  if (typeof window.ethereum === 'undefined') {
    document.getElementById('walletStatus').innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
      <span class="wallet-text">Please install MetaMask</span>
    `;
    connectBtn.disabled = true;
    return;
  }
  
  connectBtn.addEventListener('click', connectWallet);
  disconnectBtn.addEventListener('click', disconnectWallet);
  
  // Listen for account changes
  window.ethereum.on('accountsChanged', handleAccountsChanged);
  window.ethereum.on('chainChanged', () => window.location.reload());
  
  // Try to connect if already authorized
  checkIfConnected();
}

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
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    userAddress = await signer.getAddress();
    
    const network = await provider.getNetwork();
    const networkName = network.name === 'sepolia' ? 'Sepolia Testnet' : network.name;
    
    // Update network badges
    document.getElementById('networkName').textContent = networkName;
    document.getElementById('networkNameSettings').textContent = networkName;
    document.getElementById('connectedWallet').textContent = `${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
    
    // Check if on Sepolia
    if (network.chainId !== 11155111n) {
      const switchNetwork = confirm('Please switch to Sepolia Testnet. Switch now?');
      if (switchNetwork) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: CONFIG.SEPOLIA_CHAIN_ID }],
        });
        window.location.reload();
        return;
      }
    }
    
    // Create contract instance
    contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    // Get DeviceRegistry contract for guardian name
    const deviceRegistryAddress = await contract.deviceRegistry();
    const DEVICE_REGISTRY_ABI = [
      "function setGuardianName(string name)",
      "function getGuardianName(address guardian) view returns (string)"
    ];
    window.deviceRegistryContract = new ethers.Contract(deviceRegistryAddress, DEVICE_REGISTRY_ABI, signer);
    
    // Update wallet UI
    const walletStatus = document.getElementById('walletStatus');
    walletStatus.className = 'wallet-connected';
    walletStatus.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span class="wallet-text">${userAddress.substring(0, 6)}...${userAddress.substring(38)}</span>
    `;
    
    document.getElementById('connectBtn').style.display = 'none';
    document.getElementById('disconnectBtn').style.display = 'block';
    
    console.log('Connected to wallet:', userAddress);
    
    // Load initial data
    await loadCurrentGuardianName();
    await loadMyDevices();
    await loadMyPatients();
    
  } catch (error) {
    console.error('Connection error:', error);
    alert('Failed to connect wallet: ' + error.message);
  }
}

function handleAccountsChanged(accounts) {
  if (accounts.length === 0 || accounts[0] !== userAddress) {
    location.reload();
  }
}

function disconnectWallet() {
  provider = null;
  signer = null;
  contract = null;
  userAddress = null;
  
  const walletStatus = document.getElementById('walletStatus');
  walletStatus.className = 'wallet-disconnected';
  walletStatus.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
    <span class="wallet-text">Not Connected</span>
  `;
  
  document.getElementById('connectBtn').style.display = 'block';
  document.getElementById('disconnectBtn').style.display = 'none';
  
  console.log('Wallet disconnected');
}

// Initialize GunDB for real-time sensor data
async function initGunDB() {
  try {
    if (typeof Gun !== 'undefined') {
      gun = Gun({
        peers: CONFIG.GUNDB_PEERS,
        localStorage: false,
        radisk: false
      });
      console.log('GunDB initialized');
      subscribeToSensorData();
    }
  } catch (error) {
    console.warn('GunDB initialization failed:', error.message);
  }
}

function subscribeToSensorData() {
  if (!gun) return;
  
  console.log(' Subscribing to GunDB events...');
  console.log('GunDB peers:', CONFIG.GUNDB_PEERS);
  
  // Listen to all events but filter by selected deviceId
  gun.get('events').map().on((data, key) => {
    if (data && typeof data === 'object') {
      console.log(' Received GunDB event:', key, data);
      
      // Check if it has the required fields
      if (data.deviceId && (data.bpm !== undefined || data.temp !== undefined)) {
        // FILTER: Only update dashboard if this event is for the selected patient
        if (!selectedDeviceId) {
          console.log('⚠️ No patient selected, ignoring event');
          return;
        }
        
        if (data.deviceId !== selectedDeviceId) {
          console.log(`⚠️ Event is for ${data.deviceId}, but monitoring ${selectedDeviceId}, ignoring`);
          return;
        }
        
        console.log('✅ Valid sensor data received for selected patient');
        updateDashboard(data);
      } else {
        console.log('⚠️ Invalid data structure:', data);
      }
    }
  });
  
  console.log('✅ Subscribed to sensor data from GunDB');
  
  // Also test the connection
  gun.get('events').once((data) => {
    console.log('GunDB connection test - events node:', data);
  });
}

function updateDashboard(data) {
  console.log('📊 Updating dashboard with:', data);
  
  // Update vital signs
  if (data.bpm !== undefined) {
    document.getElementById('bpmValue').textContent = data.bpm;
    updateVitalStatus('bpm', data.bpm);
  }
  
  if (data.temp !== undefined) {
    document.getElementById('tempValue').textContent = data.temp.toFixed(1);
    updateVitalStatus('temp', data.temp);
  }
  
  if (data.spo2 !== undefined) {
    document.getElementById('spo2Value').textContent = data.spo2;
    updateVitalStatus('spo2', data.spo2);
  }
  
  if (data.deviceId) {
    document.getElementById('deviceValue').textContent = data.deviceId;
  }
  
  if (data.gps) {
    document.getElementById('locationStatus').textContent = 'Active';
    
    // Update map with location - need to get home location from blockchain
    if (contract && data.deviceId) {
      updateMapWithDeviceData(data.deviceId, data.gps);
    }
  }
  
  // Update timestamps
  const now = new Date();
  document.getElementById('lastUpdate').textContent = now.toLocaleTimeString();
  document.getElementById('lastUpdateTime').textContent = `Updated ${now.toLocaleTimeString()}`;
  
  // Update device status
  const deviceStatus = document.getElementById('deviceStatus');
  deviceStatus.innerHTML = `
    <span class="status-dot"></span>
    <span id="deviceStatusText">Online</span>
  `;
  deviceStatus.className = 'vital-status normal';
  
  // Add data to charts
  addToVitalHistory(data);
  
  // Show alerts if needed
  if (data.eventType && data.eventType !== 'normal') {
    showAlert(data);
  } else if (data.geofenceViolation) {
    showAlert({
      ...data,
      eventType: 'alert'
    });
  }
  
  console.log('✅ Dashboard updated successfully');
}

function updateVitalStatus(type, value) {
  const statusEl = document.getElementById(`${type}Status`);
  if (!statusEl || value === undefined) return;
  
  let status = 'normal';
  let text = 'Normal';
  
  if (type === 'bpm') {
    if (value < 60 || value > 100) {
      status = 'warning';
      text = 'Abnormal';
    }
    if (value < 40 || value > 120) {
      status = 'critical';
      text = 'Critical';
    }
  } else if (type === 'temp') {
    if (value < 36.1 || value > 37.2) {
      status = 'warning';
      text = 'Elevated';
    }
    if (value < 35 || value > 38.5) {
      status = 'critical';
      text = 'Critical';
    }
  } else if (type === 'spo2') {
    if (value < 95) {
      status = 'warning';
      text = 'Low';
    }
    if (value < 90) {
      status = 'critical';
      text = 'Critical';
    }
  }
  
  statusEl.className = `vital-status ${status}`;
  statusEl.textContent = text;
}

function showAlert(data) {
  const alertBanner = document.getElementById('alertBanner');
  const alertText = document.getElementById('alertText');
  
  let message = '';
  if (data.eventType === 'alert') {
    message = `Alert: Abnormal vitals detected - Heart Rate: ${data.bpm} BPM, Temperature: ${data.temp}°C`;
    alertBanner.className = 'alert-banner';
  } else if (data.eventType === 'critical') {
    message = `CRITICAL: Immediate attention required - Heart Rate: ${data.bpm} BPM, Temperature: ${data.temp}°C`;
    alertBanner.className = 'alert-banner critical';
  }
  
  alertText.textContent = message;
  alertBanner.style.display = 'flex';
}

// Initialize Leaflet map
function initMap() {
  map = L.map('map').setView([14.5995, 120.9842], 13);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  
  console.log('Map initialized');
}

function updateMapLocation(currentGPS, homeGPS) {
  if (!map) return;
  
  try {
    const [currentLat, currentLng] = currentGPS.split(',').map(Number);
    const [homeLat, homeLng] = homeGPS ? homeGPS.split(',').map(Number) : [currentLat, currentLng];
    
    console.log('📍 Updating map - Current:', currentLat, currentLng, 'Home:', homeLat, homeLng);
    
    // Remove old markers
    if (homeMarker) map.removeLayer(homeMarker);
    if (currentMarker) map.removeLayer(currentMarker);
    if (safeZoneCircle) map.removeLayer(safeZoneCircle);
    
    // Add home marker (blue)
    homeMarker = L.marker([homeLat, homeLng], {
      icon: L.divIcon({
        className: 'custom-marker',
        html: '<div style="background: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>'
      })
    }).addTo(map).bindPopup('Home Location');
    
    // Add current location marker (red)
    currentMarker = L.marker([currentLat, currentLng], {
      icon: L.divIcon({
        className: 'custom-marker',
        html: '<div style="background: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>'
      })
    }).addTo(map).bindPopup('Current Location');
    
    // Add safe zone circle (500m radius)
    safeZoneCircle = L.circle([homeLat, homeLng], {
      radius: 500,
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.1,
      dashArray: '5, 5'
    }).addTo(map);
    
    // Calculate distance
    const distance = calculateDistance(currentLat, currentLng, homeLat, homeLng);
    document.getElementById('distanceFromHome').textContent = `${(distance * 1000).toFixed(0)}m from home`;
    
    // Update geofence status
    const geoStatus = document.getElementById('geoStatus');
    if (distance > 0.5) {
      geoStatus.className = 'vital-status critical';
      geoStatus.textContent = 'Outside Safe Zone';
    } else {
      geoStatus.className = 'vital-status normal';
      geoStatus.textContent = 'Within Safe Zone';
    }
    
    // Fit map bounds
    const bounds = L.latLngBounds([
      [homeLat, homeLng],
      [currentLat, currentLng]
    ]);
    map.fitBounds(bounds, { padding: [50, 50] });
    
    console.log('✅ Map updated successfully');
    
  } catch (error) {
    console.error('Error updating map:', error);
  }
}

// Helper function to fetch device info and update map
async function updateMapWithDeviceData(deviceId, currentGPS) {
  if (!contract) return;
  
  try {
    const device = await contract.getDevice(deviceId);
    updateMapLocation(currentGPS, device.homeLocation);
  } catch (error) {
    console.error('Error fetching device info for map:', error);
    // Use current location as both if we can't get home location
    updateMapLocation(currentGPS, currentGPS);
  }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Initialize charts
function initCharts() {
  const bpmCtx = document.getElementById('bpmChart').getContext('2d');
  const tempCtx = document.getElementById('tempChart').getContext('2d');
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 300 // Faster animations for better performance
    },
    plugins: {
      legend: { display: false }
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  };
  
  bpmChart = new Chart(bpmCtx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Heart Rate (BPM)',
        data: [],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2
      }]
    },
    options: {
      ...chartOptions,
      scales: {
        y: {
          beginAtZero: false,
          min: 40,
          max: 120,
          ticks: {
            stepSize: 20
          }
        },
        x: {
          ticks: {
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 6
          }
        }
      }
    }
  });
  
  tempChart = new Chart(tempCtx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Temperature (°C)',
        data: [],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2
      }]
    },
    options: {
      ...chartOptions,
      scales: {
        y: {
          beginAtZero: false,
          min: 35,
          max: 40,
          ticks: {
            stepSize: 1
          }
        },
        x: {
          ticks: {
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 6
          }
        }
      }
    }
  });
  
  console.log('Charts initialized');
}

function addToVitalHistory(data) {
  if (!data.bpm && !data.temp && !data.spo2) return;
  
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  vitalHistory.timestamps.push(time);
  vitalHistory.bpm.push(data.bpm || null);
  vitalHistory.temp.push(data.temp || null);
  vitalHistory.spo2.push(data.spo2 || null);
  
  // Keep only last N points
  if (vitalHistory.timestamps.length > vitalHistory.maxPoints) {
    vitalHistory.timestamps.shift();
    vitalHistory.bpm.shift();
    vitalHistory.temp.shift();
    vitalHistory.spo2.shift();
  }
  
  // Update charts with better performance
  if (bpmChart) {
    bpmChart.data.labels = vitalHistory.timestamps;
    bpmChart.data.datasets[0].data = vitalHistory.bpm;
    bpmChart.update('active'); // Use 'active' mode for better performance
  }
  
  if (tempChart) {
    tempChart.data.labels = vitalHistory.timestamps;
    tempChart.data.datasets[0].data = vitalHistory.temp;
    tempChart.update('active');
  }
}

// Setup all event listeners
function setupEventListeners() {
  // Register form
  const registerForm = document.getElementById('registerForm');
  registerForm.addEventListener('submit', handleRegister);
  
  // Query device
  document.getElementById('getDeviceBtn').addEventListener('click', getDeviceInfo);
  document.getElementById('getEventsBtn').addEventListener('click', getDeviceEvents);
  
  // Guardian settings
  document.getElementById('setGuardianNameBtn').addEventListener('click', handleSetGuardianName);
  document.getElementById('changeGuardianBtn').addEventListener('click', handleChangeGuardian);
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
  
  const guardianAddress = guardianAddressInput || userAddress;
  
  if (guardianAddressInput && !ethers.isAddress(guardianAddressInput)) {
    alert('Invalid guardian wallet address!');
    return;
  }
  
  if (!homeGPS.match(/^-?\d+\.?\d*,-?\d+\.?\d*$/)) {
    alert('Invalid GPS format. Use: latitude,longitude');
    return;
  }
  
  try {
    const isRegistered = await contract.isDeviceRegistered(deviceId);
    if (isRegistered) {
      alert(`Device ${deviceId} is already registered!`);
      return;
    }
    
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    const tx = await contract.registerDevice(deviceId, guardianAddress, patientName, age, homeGPS);
    console.log('Transaction sent:', tx.hash);
    
    submitBtn.textContent = 'Confirming...';
    await tx.wait();
    
    alert(`Device ${deviceId} registered successfully!`);
    registerForm.reset();
    document.getElementById('registerModal').style.display = 'none';
    
    // Reload devices
    await loadMyDevices();
    
  } catch (error) {
    console.error('Registration error:', error);
    alert('Failed to register device: ' + error.message);
  } finally {
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Register Device';
  }
}

async function getDeviceInfo() {
  const deviceId = document.getElementById('queryDeviceId').value.trim();
  if (!deviceId || !contract) return;
  
  try {
    const device = await contract.getDevice(deviceId);
    const deviceInfo = document.getElementById('deviceInfo');
    
    deviceInfo.innerHTML = `
      <h4>Device Information</h4>
      <div class="detail-row"><span class="detail-label">Device ID:</span> <span class="detail-value">${device.deviceId}</span></div>
      <div class="detail-row"><span class="detail-label">Patient:</span> <span class="detail-value">${device.fullName} (${device.age} years)</span></div>
      <div class="detail-row"><span class="detail-label">Guardian:</span> <span class="detail-value">${device.guardian}</span></div>
      <div class="detail-row"><span class="detail-label">Home Location:</span> <span class="detail-value">${device.homeLocation}</span></div>
      <div class="detail-row"><span class="detail-label">Status:</span> <span class="detail-value">${device.isActive ? 'Active' : 'Inactive'}</span></div>
    `;
    deviceInfo.classList.add('show');
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error fetching device info');
  }
}

async function getDeviceEvents() {
  const deviceId = document.getElementById('queryDeviceId').value.trim();
  if (!deviceId || !contract) return;
  
  try {
    const events = await contract.getDeviceEvents(deviceId, 10);
    const eventsOutput = document.getElementById('eventsOutput');
    
    if (events.length === 0) {
      eventsOutput.innerHTML = '<p>No events found</p>';
    } else {
      let html = '<h4>Recent Events</h4>';
      events.forEach(event => {
        const date = new Date(Number(event.timestamp) * 1000).toLocaleString();
        html += `
          <div class="event-item">
            <div class="event-header">
              <span class="event-type ${event.eventType}">${event.eventType.toUpperCase()}</span>
              <span class="event-time">${date}</span>
            </div>
            <div class="event-details">Hash: ${event.dataHash}</div>
          </div>
        `;
      });
      eventsOutput.innerHTML = html;
    }
    eventsOutput.classList.add('show');
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error fetching events');
  }
}

async function loadMyDevices() {
  if (!contract || !userAddress) return;
  
  try {
    const deviceIds = await contract.getPatientDevices(userAddress);
    const devicesGrid = document.getElementById('devicesGrid');
    
    if (deviceIds.length === 0) {
      devicesGrid.innerHTML = `
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
          </svg>
          <p>No devices registered</p>
          <small>Click "Register New Device" to get started</small>
        </div>
      `;
      return;
    }
    
    let html = '';
    for (const deviceId of deviceIds) {
      const device = await contract.getDevice(deviceId);
      html += `
        <div class="device-card">
          <div class="device-header">
            <div>
              <h4>${device.fullName}</h4>
              <p>${device.deviceId}</p>
            </div>
            <span class="device-status ${device.isActive ? 'active' : 'inactive'}">
              <span class="status-dot"></span>
              ${device.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div class="device-details">
            <div class="detail-row">
              <span class="detail-label">Age:</span>
              <span class="detail-value">${device.age} years</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Home:</span>
              <span class="detail-value">${device.homeLocation}</span>
            </div>
          </div>
        </div>
      `;
    }
    devicesGrid.innerHTML = html;
    
  } catch (error) {
    console.error('Error loading devices:', error);
  }
}

async function loadMyPatients() {
  if (!contract || !userAddress) return;
  
  try {
    const deviceIds = await contract.getGuardianDevices(userAddress);
    const patientsGrid = document.getElementById('patientsGrid');
    
    if (deviceIds.length === 0) {
      patientsGrid.innerHTML = `
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
          </svg>
          <p>No patients assigned</p>
          <small>Patients will appear when they assign you as guardian</small>
        </div>
      `;
      guardianPatients = [];
      updatePatientSelector();
      return;
    }
    
    let html = '';
    guardianPatients = []; // Reset the list
    
    for (const deviceId of deviceIds) {
      const device = await contract.getDevice(deviceId);
      const eventCount = await contract.getDeviceEventCount(deviceId);
      
      // Store patient info for selector
      guardianPatients.push({
        deviceId: device.deviceId,
        fullName: device.fullName,
        age: device.age,
        homeLocation: device.homeLocation
      });
      
      html += `
        <div class="patient-card">
          <div class="patient-header">
            <div class="patient-avatar">${device.fullName.charAt(0).toUpperCase()}</div>
            <div class="patient-info">
              <h4>${device.fullName}</h4>
              <p>${device.deviceId}</p>
            </div>
          </div>
          <div class="patient-details">
            <div class="detail-row">
              <span class="detail-label">Age:</span>
              <span class="detail-value">${device.age} years</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Events:</span>
              <span class="detail-value">${eventCount.toString()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="detail-value">${device.isActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </div>
      `;
    }
    patientsGrid.innerHTML = html;
    
    // Update the patient selector dropdown
    updatePatientSelector();
    
    // Auto-select first patient if none selected
    if (!selectedDeviceId && guardianPatients.length > 0) {
      selectPatient(guardianPatients[0].deviceId);
    }
    
  } catch (error) {
    console.error('Error loading patients:', error);
  }
}

async function loadCurrentGuardianName() {
  if (!contract || !userAddress) return;
  
  try {
    const currentName = await window.deviceRegistryContract.getGuardianName(userAddress);
    const displayDiv = document.getElementById('currentGuardianNameDisplay');
    const displayText = document.getElementById('currentGuardianNameText');
    
    if (currentName && currentName.trim() !== '') {
      displayText.textContent = currentName;
      displayDiv.style.display = 'block';
    }
  } catch (error) {
    console.error('Error loading guardian name:', error);
  }
}

async function handleSetGuardianName() {
  if (!contract) {
    alert('Please connect your wallet first!');
    return;
  }
  
  const name = document.getElementById('guardianNameInput').value.trim();
  if (!name) {
    alert('Please enter a name');
    return;
  }
  
  try {
    const btn = document.getElementById('setGuardianNameBtn');
    btn.disabled = true;
    btn.textContent = 'Processing...';
    
    const tx = await window.deviceRegistryContract.setGuardianName(name);
    await tx.wait();
    
    alert('Guardian name updated successfully!');
    await loadCurrentGuardianName();
    
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to update name: ' + error.message);
  } finally {
    const btn = document.getElementById('setGuardianNameBtn');
    btn.disabled = false;
    btn.textContent = 'Update Name';
  }
}

async function handleChangeGuardian() {
  if (!contract) {
    alert('Please connect your wallet first!');
    return;
  }

  const deviceId = document.getElementById('changeGuardianDeviceId').value.trim();
  const newGuardian = document.getElementById('newGuardianAddress').value.trim();
  
  if (!deviceId || !newGuardian) {
    alert('Please enter both device ID and new guardian address');
    return;
  }
  
  if (!ethers.isAddress(newGuardian)) {
    alert('Invalid guardian wallet address!');
    return;
  }
  
  try {
    const btn = document.getElementById('changeGuardianBtn');
    btn.disabled = true;
    btn.textContent = 'Processing...';
    
    const tx = await contract.changeGuardian(deviceId, newGuardian);
    await tx.wait();
    
    alert('Guardian changed successfully!');
    
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to change guardian: ' + error.message);
  } finally {
    const btn = document.getElementById('changeGuardianBtn');
    btn.disabled = false;
    btn.textContent = 'Change Guardian';
  }
}

// ===== PATIENT SELECTION FUNCTIONS =====

function updatePatientSelector() {
  const selector = document.getElementById('patientSelector');
  const container = document.getElementById('patientSelectorContainer');
  
  if (guardianPatients.length === 0) {
    container.style.display = 'none';
    return;
  }
  
  // Show the selector
  container.style.display = 'flex';
  
  // Populate dropdown
  selector.innerHTML = '<option value="">Select a patient...</option>';
  guardianPatients.forEach(patient => {
    const option = document.createElement('option');
    option.value = patient.deviceId;
    option.textContent = `${patient.fullName} (${patient.deviceId})`;
    if (patient.deviceId === selectedDeviceId) {
      option.selected = true;
    }
    selector.appendChild(option);
  });
  
  // Add change event listener (only once)
  if (!selector.dataset.listenerAttached) {
    selector.addEventListener('change', (e) => {
      const deviceId = e.target.value;
      if (deviceId) {
        selectPatient(deviceId);
      }
    });
    selector.dataset.listenerAttached = 'true';
  }
}

async function selectPatient(deviceId) {
  console.log(`Selecting patient: ${deviceId}`);
  selectedDeviceId = deviceId;
  
  // Update the dropdown
  const selector = document.getElementById('patientSelector');
  if (selector) {
    selector.value = deviceId;
  }
  
  // Load the most recent data for this patient
  await loadLatestPatientData(deviceId);
}

async function loadLatestPatientData(deviceId) {
  if (!gun || !deviceId) return;
  
  console.log(`Loading latest data for ${deviceId}...`);
  
  try {
    // First, get device info from blockchain for home location
    const device = await contract.getDevice(deviceId);
    console.log(`Device home location: ${device.homeLocation}`);
    
    // Search through GunDB for the most recent event for this device
    let latestEvent = null;
    let latestTimestamp = 0;
    let eventsFound = 0;
    
    // Create a promise that resolves after collecting events
    await new Promise((resolve) => {
      const timeout = setTimeout(resolve, 2000); // Wait max 2 seconds
      
      gun.get('events').map().once((data, key) => {
        if (data && data.deviceId === deviceId) {
          eventsFound++;
          const eventTimestamp = data.timestamp || data.storedAt || 0;
          console.log(`   Found event from ${new Date(eventTimestamp).toLocaleString()}`);
          
          if (eventTimestamp > latestTimestamp) {
            latestTimestamp = eventTimestamp;
            latestEvent = data;
          }
        }
      });
    });
    
    console.log(`📊 Scanned events: ${eventsFound} events found for ${deviceId}`);
    
    if (latestEvent) {
      console.log('✅ Found latest event:', latestEvent);
      updateDashboard(latestEvent);
    } else {
      console.log('⚠️ No sensor data found for this patient in GunDB');
      console.log('💡 The patient device may not have sent data yet, or GunDB is not synchronized');
      // Reset dashboard to show no data
      resetDashboard();
    }
    
  } catch (error) {
    console.error('Error loading patient data:', error);
    resetDashboard();
  }
}

function resetDashboard() {
  console.log('🔄 Resetting dashboard...');
  
  // Reset vital signs
  document.getElementById('bpmValue').textContent = '--';
  document.getElementById('tempValue').textContent = '--';
  document.getElementById('spo2Value').textContent = '--';
  document.getElementById('deviceValue').textContent = selectedDeviceId || '--';
  document.getElementById('locationStatus').textContent = 'No data';
  document.getElementById('distanceFromHome').textContent = '--';
  document.getElementById('lastUpdateTime').textContent = 'No data';
  
  // Reset statuses
  document.getElementById('bpmStatus').className = 'vital-status normal';
  document.getElementById('bpmStatus').textContent = 'Normal';
  document.getElementById('tempStatus').className = 'vital-status normal';
  document.getElementById('tempStatus').textContent = 'Normal';
  document.getElementById('spo2Status').className = 'vital-status normal';
  document.getElementById('spo2Status').textContent = 'Normal';
  document.getElementById('geoStatus').className = 'vital-status normal';
  document.getElementById('geoStatus').textContent = 'Within Safe Zone';
  
  const deviceStatus = document.getElementById('deviceStatus');
  deviceStatus.innerHTML = `
    <span class="status-dot"></span>
    <span id="deviceStatusText">Waiting for data...</span>
  `;
  deviceStatus.className = 'vital-status';
  
  // Hide alert banner
  document.getElementById('alertBanner').style.display = 'none';
}
