# XMTP Integration Summary

## Why XMTP for Patient Guardian?

✅ **100% FREE** - No tokens required (unlike Push Protocol which needs ~50 PUSH tokens)  
✅ **Works in Indonesia** - No token purchase needed  
✅ **Direct Messaging** - Wallet-to-wallet communication  
✅ **Real-time** - Instant alert delivery  
✅ **End-to-End Encrypted** - Maximum privacy  
✅ **Mobile Support** - Guardians receive alerts on Converse app or Coinbase Wallet

## Quick Setup

### 1. Install Dependencies
```bash
npm install @xmtp/xmtp-js ethers
```

### 2. Backend (`backend/xmtpNotifications.js`)
```javascript
import { Client } from '@xmtp/xmtp-js';
import { Wallet } from 'ethers';

let xmtpClient = null;

export async function initXMTP() {
  const wallet = new Wallet(process.env.TON_PRIVATE_KEY);
  xmtpClient = await Client.create(wallet, { env: 'production' });
  console.log('[INFO] XMTP ready:', wallet.address);
}

export async function notifyGuardian(guardianAddress, deviceId, alertData) {
  if (!xmtpClient) throw new Error('XMTP not initialized');
  
  const canMessage = await xmtpClient.canMessage(guardianAddress);
  if (!canMessage) {
    return { success: false, reason: 'Guardian not on XMTP' };
  }

  const conversation = await xmtpClient.conversations.newConversation(guardianAddress);
  
  const message = `🚨 PATIENT ALERT

Device: ${deviceId}
Status: ${alertData.eventType.toUpperCase()}

❤️ BPM: ${alertData.bpm}
🌡️ Temp: ${alertData.temp}°C
📍 GPS: ${alertData.gps}

Time: ${new Date().toLocaleString()}`;

  await conversation.send(message);
  return { success: true };
}
```

### 3. Initialize in `backend/index.js`
```javascript
import { initXMTP } from './xmtpNotifications.js';

async function main() {
  // ... existing code ...
  await initXMTP();
  // ... rest of startup ...
}
```

### 4. Use in `backend/logic.js`
```javascript
import { notifyGuardian } from './xmtpNotifications.js';

// In processAlert() function:
if (registered) {
  const deviceInfo = await getDeviceInfo(payload.deviceId);
  await notifyGuardian(deviceInfo.guardian, payload.deviceId, eventData);
}
```

### 5. Frontend - Guardian Inbox
```typescript
'use client';

import { Client } from '@xmtp/xmtp-js';
import { useWalletClient } from 'wagmi';
import { useEffect, useState } from 'react';

export function XMTPInbox() {
  const { data: walletClient } = useWalletClient();
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!walletClient) return;

    const init = async () => {
      const client = await Client.create(walletClient, { env: 'production' });
      const conversations = await client.conversations.list();
      
      // Load all messages
      const allMessages = [];
      for (const convo of conversations) {
        const msgs = await convo.messages();
        allMessages.push(...msgs);
      }
      setMessages(allMessages);

      // Stream new messages
      const stream = await client.conversations.streamAllMessages();
      for await (const message of stream) {
        setMessages(prev => [...prev, message]);
        new Audio('/alert-sound.mp3').play(); // Alert sound
      }
    };

    init();
  }, [walletClient]);

  return (
    <div className="inbox">
      <h2>Patient Alerts ({messages.length})</h2>
      {messages.map((msg, i) => (
        <div key={i} className="message">
          <pre>{msg.content}</pre>
          <small>{new Date(msg.sent).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}
```

### 6. Enable Button (First-time use)
```typescript
export function EnableXMTPButton() {
  const { data: walletClient } = useWalletClient();

  const enable = async () => {
    await Client.create(walletClient, { env: 'production' });
    alert('✅ XMTP enabled! You can now receive alerts.');
  };

  return <button onClick={enable}>Enable Patient Alerts</button>;
}
```

## How It Works

1. **Backend sends alert** → Guardian's wallet address via XMTP
2. **Guardian receives** → In your Next.js app OR Converse mobile app
3. **Real-time streaming** → Messages appear instantly
4. **Offline support** → Messages stored, delivered when online

## Mobile Support

Guardians can install these apps to receive alerts on their phone:
- **Converse**: https://converse.xyz/ (iOS & Android)
- **Coinbase Wallet**: Built-in XMTP support

They just connect with the same wallet address!

## Cost Comparison

| Action | XMTP | Push Protocol |
|--------|------|---------------|
| Create channel | FREE | ~50 PUSH tokens (~$10) |
| Send message | FREE | FREE |
| Receive message | FREE | FREE |
| First-time setup | FREE (just sign) | FREE (just sign) |

**Total cost: $0 for XMTP vs $10+ for Push Protocol**

## Next Steps

1. Add `xmtpNotifications.js` to backend
2. Call `initXMTP()` on backend startup
3. Add `XMTPInbox` component to Next.js frontend
4. Test: Register device → Send alert → See message in inbox
5. Optional: Download Converse app to test mobile notifications

All code is in `FRONTEND-INTEGRATION.md` - ready to copy-paste!
