# Device Registration Test Guide

## 🎯 Goal
Register `test-device-001` on-chain so the backend can log events to the blockchain.

---

## 📝 Step-by-Step Registration in Remix

### 1. **Open Deployed Contract in Remix**
   - Go to "Deployed Contracts" section (bottom of Deploy panel)
   - Expand the `PatientMonitor` contract at `0xe78a0f7e598cc8b0bb87894b0f60dd2a88d6a8ab`

### 2. **Register the Test Device**
   Find the **`registerDevice`** function and fill in:
   
   **Parameters:**
   ```
   deviceId: "test-device-001"
   guardian: 0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0
   ```
   
   > **Note:** Using Ganache account #2 as guardian (patient is account #1 which deployed the contract)
   
   Click the orange **"transact"** button.

### 3. **Verify Registration**
   After transaction confirms, test with **`isDeviceRegistered`**:
   ```
   deviceId: "test-device-001"
   ```
   Should return: `true` ✅

### 4. **Check Device Details**
   Call **`getDevice`**:
   ```
   deviceId: "test-device-001"
   ```
   
   Should return:
   ```
   patient: 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1  (your account)
   guardian: 0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0
   isActive: true
   registeredAt: <timestamp>
   ```

---

## 🧪 Test Full Stack After Registration

Once registered, send another MQTT message:

```powershell
& "C:\Program Files\mosquitto\mosquitto_pub.exe" -h localhost -t "patient/test-device-001/telemetry" -m '{\"deviceId\":\"test-device-001\",\"bpm\":82,\"spo2\":97,\"temp\":36.8,\"gps\":\"14.5995,120.9842\",\"timestamp\":1762596500000}'
```

**Expected Output:**
```
✅ Device test-device-001 registered on-chain
📝 Logging event to blockchain...
⛓️  Transaction hash: 0x...
💾 Event stored in OrbitDB: zdpu...
✅ Telemetry processed successfully
```

---

## 📊 Verify On-Chain Event

In Remix, call **`getDeviceEvents`**:
```
deviceId: "test-device-001"
limit: 10
```

Should return array with your logged events! 🎉

---

## 🎯 Ganache Account Reference

```
Account #1 (Patient/Deployer): 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1
Account #2 (Guardian):          0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0
Account #3 (Available):         0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b
```

---

## 🚀 What Happens Next

Once device is registered:
1. Backend checks device registration ✅
2. Processes telemetry data ✅  
3. Logs event to blockchain ✅
4. Stores full data in OrbitDB ✅
5. Guardian can query events from contract ✅

**This completes the full DePIN workflow!** 🎉
