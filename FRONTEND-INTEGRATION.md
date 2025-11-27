# Frontend Integration Guide

## Contract Details

**Network:** Sepolia Testnet  
**Contract Address:** `0xDef80349B405f4AEBC83B2ccB360F71a142E13bA`  
**Chain ID:** 11155111 (0xaa36a7)

## Required Dependencies

```bash
npm install ethers wagmi viem @rainbow-me/rainbowkit
# or
pnpm add ethers wagmi viem @rainbow-me/rainbowkit
```

## Contract ABI

```typescript
const PATIENT_MONITOR_ABI = [
  // Device Registration
  "function registerDevice(string deviceId, address guardian, string fullName, uint8 age, string homeLocation)",
  "function getDevice(string deviceId) view returns (tuple(string deviceId, address patient, address guardian, string fullName, uint8 age, string homeLocation, bool isActive, uint256 registeredAt))",
  "function isDeviceRegistered(string deviceId) view returns (bool)",
  "function isDeviceActive(string deviceId) view returns (bool)",
  
  // Guardian Management
  "function changeGuardian(string deviceId, address newGuardian)",
  "function deactivateDevice(string deviceId)",
  "function getGuardianDevices(address guardian) view returns (string[])",
  "function getPatientDevices(address patient) view returns (string[])",
  
  // Event Logging
  "function logEvent(string deviceId, bytes32 dataHash, string eventType)",
  "function getDeviceEvents(string deviceId, uint256 limit) view returns (tuple(string deviceId, bytes32 dataHash, address guardian, string eventType, uint256 timestamp)[])",
  "function getDeviceEventCount(string deviceId) view returns (uint256)",
  
  // Stats
  "function getTotalDevices() view returns (uint256)",
  "function getTotalEvents() view returns (uint256)",
  
  // Sub-contract addresses
  "function deviceRegistry() view returns (address)",
  "function eventLogger() view returns (address)"
];
```

## Next.js Setup (App Router)

### 1. Create `lib/contracts.ts`

```typescript
export const CONTRACT_CONFIG = {
  address: '0xDef80349B405f4AEBC83B2ccB360F71a142E13bA' as `0x${string}`,
  abi: PATIENT_MONITOR_ABI,
  chainId: 11155111, // Sepolia
} as const;

export const SEPOLIA_CONFIG = {
  id: 11155111,
  name: 'Sepolia',
  network: 'sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Sepolia Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://eth-sepolia.g.alchemy.com/v2/demo'] },
    public: { http: ['https://rpc.sepolia.org'] },
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
  },
  testnet: true,
} as const;
```

### 2. Create `providers/Web3Provider.tsx` (using Wagmi + RainbowKit)

```typescript
'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const config = getDefaultConfig({
  appName: 'Patient Guardian DePIN',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Get from cloud.walletconnect.com
  chains: [sepolia],
  ssr: true,
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### 3. Wrap App in `app/layout.tsx`

```typescript
import { Web3Provider } from '@/providers/Web3Provider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
```

### 4. Connect Wallet Component

```typescript
'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export function WalletConnect() {
  return <ConnectButton />;
}
```

### 5. Register Device Hook (`hooks/useRegisterDevice.ts`)

```typescript
'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_CONFIG } from '@/lib/contracts';

export function useRegisterDevice() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const registerDevice = async (
    deviceId: string,
    guardianAddress: `0x${string}`,
    fullName: string,
    age: number,
    homeLocation: string // "lat,lng" format
  ) => {
    writeContract({
      address: CONTRACT_CONFIG.address,
      abi: CONTRACT_CONFIG.abi,
      functionName: 'registerDevice',
      args: [deviceId, guardianAddress, fullName, age, homeLocation],
    });
  };

  return {
    registerDevice,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}
```

### 6. Get Device Info Hook (`hooks/useGetDevice.ts`)

```typescript
'use client';

import { useReadContract } from 'wagmi';
import { CONTRACT_CONFIG } from '@/lib/contracts';

export function useGetDevice(deviceId: string) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_CONFIG.address,
    abi: CONTRACT_CONFIG.abi,
    functionName: 'getDevice',
    args: [deviceId],
  });

  return {
    device: data ? {
      deviceId: data.deviceId,
      patient: data.patient,
      guardian: data.guardian,
      fullName: data.fullName,
      age: Number(data.age),
      homeLocation: data.homeLocation,
      isActive: data.isActive,
      registeredAt: Number(data.registeredAt),
    } : null,
    isLoading,
    error,
    refetch,
  };
}
```

### 7. Get Events Hook (`hooks/useGetDeviceEvents.ts`)

```typescript
'use client';

import { useReadContract } from 'wagmi';
import { CONTRACT_CONFIG } from '@/lib/contracts';

export function useGetDeviceEvents(deviceId: string, limit: number = 20) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_CONFIG.address,
    abi: CONTRACT_CONFIG.abi,
    functionName: 'getDeviceEvents',
    args: [deviceId, BigInt(limit)],
  });

  return {
    events: data?.map(event => ({
      deviceId: event.deviceId,
      dataHash: event.dataHash,
      guardian: event.guardian,
      eventType: event.eventType,
      timestamp: Number(event.timestamp),
    })) || [],
    isLoading,
    error,
    refetch,
  };
}
```

### 8. Get Guardian Devices Hook (`hooks/useGetGuardianDevices.ts`)

```typescript
'use client';

import { useReadContract, useAccount } from 'wagmi';
import { CONTRACT_CONFIG } from '@/lib/contracts';

export function useGetGuardianDevices(guardianAddress?: `0x${string}`) {
  const { address } = useAccount();
  const targetAddress = guardianAddress || address;

  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_CONFIG.address,
    abi: CONTRACT_CONFIG.abi,
    functionName: 'getGuardianDevices',
    args: targetAddress ? [targetAddress] : undefined,
    query: {
      enabled: !!targetAddress,
    },
  });

  return {
    deviceIds: data || [],
    isLoading,
    error,
    refetch,
  };
}
```

### 9. Get Patient Devices Hook (`hooks/useGetPatientDevices.ts`)

```typescript
'use client';

import { useReadContract, useAccount } from 'wagmi';
import { CONTRACT_CONFIG } from '@/lib/contracts';

export function useGetPatientDevices(patientAddress?: `0x${string}`) {
  const { address } = useAccount();
  const targetAddress = patientAddress || address;

  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_CONFIG.address,
    abi: CONTRACT_CONFIG.abi,
    functionName: 'getPatientDevices',
    args: targetAddress ? [targetAddress] : undefined,
    query: {
      enabled: !!targetAddress,
    },
  });

  return {
    deviceIds: data || [],
    isLoading,
    error,
    refetch,
  };
}
```

### 10. Guardian Dashboard Component

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useGetGuardianDevices } from '@/hooks/useGetGuardianDevices';
import { useGetDevice } from '@/hooks/useGetDevice';
import { subscribeToDeviceData } from '@/lib/gun';

export function GuardianDashboard() {
  const { address } = useAccount();
  const { deviceIds, isLoading } = useGetGuardianDevices();
  
  if (isLoading) return <div>Loading your patients...</div>;
  if (deviceIds.length === 0) return <div>No patients assigned to you yet.</div>;

  return (
    <div className="guardian-dashboard">
      <h2>Your Patients ({deviceIds.length})</h2>
      <div className="patient-grid">
        {deviceIds.map(deviceId => (
          <PatientCard key={deviceId} deviceId={deviceId} />
        ))}
      </div>
    </div>
  );
}

function PatientCard({ deviceId }: { deviceId: string }) {
  const { device } = useGetDevice(deviceId);
  const [liveData, setLiveData] = useState<any>(null);

  useEffect(() => {
    subscribeToDeviceData(deviceId, setLiveData);
  }, [deviceId]);

  if (!device) return <div>Loading {deviceId}...</div>;

  const isAlert = liveData?.eventType === 'alert' || liveData?.eventType === 'critical';

  return (
    <div className={`patient-card ${isAlert ? 'alert' : ''}`}>
      <h3>{device.fullName}</h3>
      <p>Age: {device.age}</p>
      <p>Device: {deviceId}</p>
      
      {liveData ? (
        <div className="vitals">
          <div className={`vital ${liveData.bpm > 100 ? 'warning' : ''}`}>
            ❤️ {liveData.bpm} BPM
          </div>
          <div className={`vital ${liveData.temp > 37.5 ? 'warning' : ''}`}>
            🌡️ {liveData.temp}°C
          </div>
          <div className="vital">
            📍 {liveData.gps}
          </div>
          {isAlert && (
            <div className="alert-badge">
              ⚠️ {liveData.eventType.toUpperCase()}
            </div>
          )}
        </div>
      ) : (
        <div className="no-data">No recent data</div>
      )}
    </div>
  );
}
```

### 11. Example Component Usage

```typescript
'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useRegisterDevice } from '@/hooks/useRegisterDevice';
import { useGetDevice } from '@/hooks/useGetDevice';
import { useGetDeviceEvents } from '@/hooks/useGetDeviceEvents';
import { WalletConnect } from '@/components/WalletConnect';

export default function DeviceManager() {
  const { address, isConnected } = useAccount();
  const [deviceId, setDeviceId] = useState('');
  
  const { registerDevice, isPending, isSuccess } = useRegisterDevice();
  const { device, isLoading: deviceLoading } = useGetDevice(deviceId);
  const { events, isLoading: eventsLoading } = useGetDeviceEvents(deviceId);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    await registerDevice(
      formData.get('deviceId') as string,
      (formData.get('guardian') as `0x${string}`) || address!,
      formData.get('name') as string,
      parseInt(formData.get('age') as string),
      formData.get('gps') as string
    );
  };

  return (
    <div>
      <WalletConnect />
      
      {isConnected && (
        <>
          <form onSubmit={handleRegister}>
            <input name="deviceId" placeholder="Device ID" required />
            <input name="name" placeholder="Patient Name" required />
            <input name="age" type="number" placeholder="Age" required />
            <input name="guardian" placeholder="Guardian Address (optional)" />
            <input name="gps" placeholder="14.5995,120.9842" required />
            <button type="submit" disabled={isPending}>
              {isPending ? 'Registering...' : 'Register Device'}
            </button>
          </form>

          <div>
            <input 
              value={deviceId} 
              onChange={(e) => setDeviceId(e.target.value)}
              placeholder="Query Device ID"
            />
            
            {device && (
              <div>
                <h3>{device.fullName}</h3>
                <p>Age: {device.age}</p>
                <p>Guardian: {device.guardian}</p>
                <p>Location: {device.homeLocation}</p>
              </div>
            )}

            {events.length > 0 && (
              <div>
                <h3>Events ({events.length})</h3>
                {events.map((event, i) => (
                  <div key={i}>
                    <span>{event.eventType}</span>
                    <span>{new Date(event.timestamp * 1000).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
```

## Real-time Data (GunDB)

### Install Gun.js

```bash
npm install gun
```

### Create Gun Client (`lib/gun.ts`)

```typescript
import Gun from 'gun';

export const gun = Gun({
  peers: ['http://localhost:8765/gun'], // Your backend Gun relay
  localStorage: false,
  radisk: false,
});

export function subscribeToDeviceData(
  deviceId: string,
  callback: (data: any) => void
) {
  gun.get('events')
    .map()
    .on((data, key) => {
      if (data && data.deviceId === deviceId) {
        callback(data);
      }
    });
}
```

### Use in Component

```typescript
'use client';

import { useEffect, useState } from 'react';
import { subscribeToDeviceData } from '@/lib/gun';

export function LiveSensorData({ deviceId }: { deviceId: string }) {
  const [sensorData, setSensorData] = useState<any>(null);

  useEffect(() => {
    subscribeToDeviceData(deviceId, (data) => {
      setSensorData(data);
    });
  }, [deviceId]);

  if (!sensorData) return <div>Waiting for data...</div>;

  return (
    <div>
      <div>BPM: {sensorData.bpm}</div>
      <div>Temp: {sensorData.temp}°C</div>
      <div>GPS: {sensorData.gps}</div>
      <div>Status: {sensorData.eventType}</div>
    </div>
  );
}
```

## Important Notes

### Access Control
- **Patient** (device owner) can:
  - Register device
  - Change guardian
  - Deactivate device
  
- **Guardian** can:
  - Log events (if backend wallet is guardian)
  - View device info
  - View all events

### Event Types
- `"normal"` - Normal vitals (NOT logged to blockchain to save gas)
- `"alert"` - Abnormal vitals or geofence breach (logged to blockchain)
- `"critical"` - Emergency (logged to blockchain)

### Gas Optimization
Backend only logs `alert` and `critical` events to blockchain. All events still go to GunDB for real-time display.

### Guardian Assignment
- Leave guardian address empty → User's wallet becomes guardian
- Provide different address → That wallet becomes guardian
- Backend wallet (`0x81f1cD1E0B31C8B89C6616abf2FdE7fc380fF921`) is guardian for test devices

### Multi-Device Support
- Use `getGuardianDevices(address)` to get all devices for a guardian
- Use `getPatientDevices(address)` to get all devices for a patient
- Backend processes multiple devices automatically via MQTT topics

## Testing

1. Get Sepolia ETH: https://sepoliafaucet.com/
2. Connect wallet to Sepolia network
3. Register a device (gas cost: ~0.001 ETH)
4. View device info (free - read-only)
5. Check events after ESP32 sends alerts (free - read-only)

## Backend API Endpoints

Your Next.js API routes can call the backend if needed:

```typescript
// Example: Force event logging from Next.js backend
fetch('http://localhost:3000/api/log-event', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    deviceId: 'patient-000',
    bpm: 120,
    temp: 38.5,
    gps: '14.5995,120.9842',
  }),
});
```

But normally, events come from ESP32 → MQTT → Backend → Blockchain automatically.

## Wallet Messaging (XMTP Protocol)

XMTP (Extensible Message Transport Protocol) enables direct wallet-to-wallet messaging. **100% free, no tokens required**.

### Setup XMTP

```bash
npm install @xmtp/xmtp-js ethers
```

### Backend Integration (`backend/xmtpNotifications.js`)

```javascript
import { Client } from '@xmtp/xmtp-js';
import { Wallet } from 'ethers';

let xmtpClient = null;

/**
 * Initialize XMTP client (call once on startup)
 */
export async function initXMTP() {
  try {
    const wallet = new Wallet(process.env.TON_PRIVATE_KEY);
    
    xmtpClient = await Client.create(wallet, {
      env: 'production' // or 'dev' for testing
    });
    
    console.log('[INFO] XMTP client initialized:', wallet.address);
    return true;
  } catch (error) {
    console.error('[ERROR] XMTP initialization failed:', error.message);
    return false;
  }
}

/**
 * Send message to guardian wallet
 */
export async function notifyGuardian(guardianAddress, deviceId, alertData) {
  if (!xmtpClient) {
    throw new Error('XMTP client not initialized');
  }

  try {
    // Check if guardian can receive XMTP messages
    const canMessage = await xmtpClient.canMessage(guardianAddress);
    if (!canMessage) {
      console.warn(`Guardian ${guardianAddress} hasn't enabled XMTP yet`);
      return { success: false, reason: 'Guardian not on XMTP' };
    }

    // Get or create conversation
    const conversation = await xmtpClient.conversations.newConversation(guardianAddress);
    
    // Format alert message
    const message = `🚨 PATIENT ALERT

Device: ${deviceId}
Status: ${alertData.eventType.toUpperCase()}

Vitals:
❤️ Heart Rate: ${alertData.bpm} BPM
🌡️ Temperature: ${alertData.temp}°C
📍 Location: ${alertData.gps}

Time: ${new Date().toLocaleString()}

View details: https://yourapp.com/device/${deviceId}`;

    // Send message
    await conversation.send(message);
    
    console.log(`📬 XMTP alert sent to guardian ${guardianAddress}`);
    return { success: true };
    
  } catch (error) {
    console.error('Failed to send XMTP message:', error);
    throw error;
  }
}

/**
 * Send message to multiple guardians
 */
export async function notifyMultipleGuardians(guardianAddresses, deviceId, alertData) {
  const results = [];
  
  for (const address of guardianAddresses) {
    try {
      const result = await notifyGuardian(address, deviceId, alertData);
      results.push({ address, ...result });
    } catch (error) {
      results.push({ address, success: false, error: error.message });
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  console.log(`📬 XMTP broadcast: ${successCount}/${guardianAddresses.length} guardians notified`);
  
  return results;
}

/**
 * Get conversation history (for debugging)
 */
export async function getConversations() {
  if (!xmtpClient) return [];
  
  const conversations = await xmtpClient.conversations.list();
  return conversations.map(c => ({
    peerAddress: c.peerAddress,
    createdAt: c.createdAt
  }));
}
```

### Integrate into Backend Logic

```javascript
// In backend/index.js
import { initXMTP } from './xmtpNotifications.js';

async function main() {
  // ... existing initialization ...
  
  // Initialize XMTP
  await initXMTP();
  
  // ... rest of startup ...
}

// In backend/logic.js
import { notifyGuardian } from './xmtpNotifications.js';
import { getDeviceInfo } from './tonBlockchain.js';

export async function processAlert(payload) {
  try {
    console.log(`\n🚨 ALERT received from ${payload.deviceId}`);
    
    const eventData = {
      ...payload,
      eventType: 'critical',
      isManualAlert: true,
      processedAt: Date.now()
    };

    // Store in GunDB
    const gunDbId = await storeEvent(eventData);
    console.log(`💾 Alert stored in GunDB: ${gunDbId}`);

    // Log to blockchain if registered
    const registered = await isDeviceRegistered(payload.deviceId);
    
    if (registered) {
      // Get device info to find guardian
      const deviceInfo = await getDeviceInfo(payload.deviceId);
      
      // Log to blockchain
      try {
        await logEventToChain(payload.deviceId, eventData, 'critical');
        console.log(`⛓️  Alert logged to blockchain`);
      } catch (error) {
        console.error(`Blockchain logging failed: ${error.message}`);
      }

      // Send XMTP message to guardian
      try {
        await notifyGuardian(deviceInfo.guardian, payload.deviceId, eventData);
        console.log(`📬 Guardian notified via XMTP`);
      } catch (error) {
        console.error(`XMTP notification failed: ${error.message}`);
      }
    }

    return {
      success: true,
      deviceId: payload.deviceId,
      eventType: 'critical',
      storage: { dbId: gunDbId },
      timestamp: eventData.processedAt
    };

  } catch (error) {
    console.error(`Failed to process alert: ${error.message}\n`);
    throw error;
  }
}
```

### Frontend - XMTP Inbox

```typescript
'use client';

import { Client, Conversation } from '@xmtp/xmtp-js';
import { useEffect, useState } from 'react';
import { useWalletClient } from 'wagmi';

export function useXMTP() {
  const { data: walletClient } = useWalletClient();
  const [client, setClient] = useState<Client | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Map<string, any[]>>(new Map());

  useEffect(() => {
    if (!walletClient) return;

    const initXMTP = async () => {
      try {
        const xmtpClient = await Client.create(walletClient, {
          env: 'production'
        });
        setClient(xmtpClient);

        // Load conversations
        const convos = await xmtpClient.conversations.list();
        setConversations(convos);

        // Load messages for each conversation
        const messagesMap = new Map();
        for (const convo of convos) {
          const msgs = await convo.messages();
          messagesMap.set(convo.peerAddress, msgs);
        }
        setMessages(messagesMap);

        // Stream new messages
        const stream = await xmtpClient.conversations.stream();
        for await (const conversation of stream) {
          setConversations(prev => [...prev, conversation]);
        }
      } catch (error) {
        console.error('Failed to initialize XMTP:', error);
      }
    };

    initXMTP();
  }, [walletClient]);

  return { client, conversations, messages };
}

// Inbox Component
export function XMTPInbox() {
  const { conversations, messages } = useXMTP();

  if (conversations.length === 0) {
    return <div>No messages yet</div>;
  }

  return (
    <div className="xmtp-inbox">
      <h2>Patient Alerts</h2>
      {conversations.map((convo) => {
        const msgs = messages.get(convo.peerAddress) || [];
        
        return (
          <div key={convo.peerAddress} className="conversation">
            <h3>From: {convo.peerAddress.slice(0, 6)}...{convo.peerAddress.slice(-4)}</h3>
            
            <div className="messages">
              {msgs.map((msg, i) => (
                <div key={i} className={`message ${msg.senderAddress === convo.peerAddress ? 'received' : 'sent'}`}>
                  <pre>{msg.content}</pre>
                  <small>{new Date(msg.sent).toLocaleString()}</small>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Real-time message streaming
export function useXMTPStream(conversation: Conversation | null) {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!conversation) return;

    const streamMessages = async () => {
      // Load existing messages
      const existing = await conversation.messages();
      setMessages(existing);

      // Stream new messages
      const stream = await conversation.streamMessages();
      for await (const message of stream) {
        setMessages(prev => [...prev, message]);
        
        // Play notification sound
        if (message.senderAddress !== conversation.clientAddress) {
          new Audio('/alert-sound.mp3').play();
        }
      }
    };

    streamMessages();
  }, [conversation]);

  return messages;
}
```

### Enable XMTP on First Use

```typescript
'use client';

import { Client } from '@xmtp/xmtp-js';
import { useWalletClient } from 'wagmi';

export function EnableXMTPButton() {
  const { data: walletClient } = useWalletClient();

  const enable = async () => {
    if (!walletClient) {
      alert('Please connect wallet first');
      return;
    }

    try {
      // This creates XMTP identity for the wallet
      await Client.create(walletClient, { env: 'production' });
      alert('✅ XMTP enabled! You can now receive patient alerts.');
    } catch (error) {
      console.error('Failed to enable XMTP:', error);
      alert('Failed to enable XMTP');
    }
  };

  return (
    <button onClick={enable} className="btn btn-primary">
      Enable Patient Alerts
    </button>
  );
}
```
