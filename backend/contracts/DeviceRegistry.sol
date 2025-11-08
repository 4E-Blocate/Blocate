// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IDeviceRegistry.sol";

/**
 * @title DeviceRegistry
 * @dev Manages device registration, guardian assignment, and device lifecycle
 * @notice Each device links a patient's IoT sensor to their guardian's wallet
 */
contract DeviceRegistry is IDeviceRegistry {
    
    // ============ State Variables ============
    
    /// @dev Mapping from deviceId to Device struct
    mapping(string => Device) private devices;
    
    /// @dev Mapping from guardian address to their device IDs
    mapping(address => string[]) private guardianDevices;
    
    /// @dev Mapping from patient address to their device IDs
    mapping(address => string[]) private patientDevices;
    
    /// @dev Total number of registered devices
    uint256 public totalDevices;
    
    // ============ Modifiers ============
    
    modifier onlyPatient(string memory deviceId) {
        require(
            devices[deviceId].patient == msg.sender,
            "DeviceRegistry: Only patient can perform this action"
        );
        _;
    }
    
    modifier deviceExists(string memory deviceId) {
        require(
            devices[deviceId].patient != address(0),
            "DeviceRegistry: Device not registered"
        );
        _;
    }
    
    modifier deviceActive(string memory deviceId) {
        require(
            devices[deviceId].isActive,
            "DeviceRegistry: Device is not active"
        );
        _;
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice Register a new IoT device
     * @dev Patient (msg.sender) registers their device and assigns a guardian
     * @param deviceId Unique device identifier (ESP32 UUID)
     * @param guardian Wallet address of the guardian
     */
    function registerDevice(
        string memory deviceId,
        address guardian
    ) external override {
        require(
            devices[deviceId].patient == address(0),
            "DeviceRegistry: Device already registered"
        );
        require(
            guardian != address(0),
            "DeviceRegistry: Invalid guardian address"
        );
        require(
            msg.sender != address(0),
            "DeviceRegistry: Invalid patient address"
        );
        require(
            bytes(deviceId).length >= 8,
            "DeviceRegistry: Device ID too short (min 8 chars)"
        );
        
        devices[deviceId] = Device({
            deviceId: deviceId,
            patient: msg.sender,
            guardian: guardian,
            isActive: true,
            registeredAt: block.timestamp
        });
        
        guardianDevices[guardian].push(deviceId);
        patientDevices[msg.sender].push(deviceId);
        
        totalDevices++;
        
        emit DeviceRegistered(deviceId, msg.sender, guardian, block.timestamp);
    }
    
    /**
     * @notice Change the guardian for a device
     * @dev Only the patient can change their guardian
     * @param deviceId Device to update
     * @param newGuardian New guardian wallet address
     */
    function changeGuardian(
        string memory deviceId,
        address newGuardian
    ) external override onlyPatient(deviceId) deviceExists(deviceId) {
        require(
            newGuardian != address(0),
            "DeviceRegistry: Invalid guardian address"
        );
        
        address oldGuardian = devices[deviceId].guardian;
        devices[deviceId].guardian = newGuardian;
        
        // Add to new guardian's list
        guardianDevices[newGuardian].push(deviceId);
        
        emit GuardianChanged(deviceId, oldGuardian, newGuardian, block.timestamp);
    }
    
    /**
     * @notice Deactivate a device
     * @dev Can be called by patient or guardian. Gas-optimized with memory caching.
     * @param deviceId Device to deactivate
     */
    function deactivateDevice(
        string memory deviceId
    ) external override deviceExists(deviceId) {
        // Cache device in memory to avoid redundant storage reads
        Device memory device = devices[deviceId];
        require(
            device.patient == msg.sender || 
            device.guardian == msg.sender,
            "DeviceRegistry: Not authorized"
        );
        
        devices[deviceId].isActive = false;
        
        emit DeviceDeactivated(deviceId, block.timestamp);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get device information
     * @param deviceId Device identifier
     * @return Device struct with all device details
     */
    function getDevice(
        string memory deviceId
    ) external view override returns (Device memory) {
        return devices[deviceId];
    }
    
    /**
     * @notice Get all devices for a guardian
     * @param guardian Guardian wallet address
     * @return Array of device IDs
     */
    function getGuardianDevices(
        address guardian
    ) external view returns (string[] memory) {
        return guardianDevices[guardian];
    }
    
    /**
     * @notice Get all devices for a patient
     * @param patient Patient wallet address
     * @return Array of device IDs
     */
    function getPatientDevices(
        address patient
    ) external view returns (string[] memory) {
        return patientDevices[patient];
    }
    
    /**
     * @notice Check if device is registered
     * @param deviceId Device identifier
     * @return True if registered
     */
    function isDeviceRegistered(
        string memory deviceId
    ) external view override returns (bool) {
        return devices[deviceId].patient != address(0);
    }
    
    /**
     * @notice Check if device is active
     * @param deviceId Device identifier
     * @return True if active
     */
    function isDeviceActive(
        string memory deviceId
    ) external view override returns (bool) {
        return devices[deviceId].isActive;
    }
    
    /**
     * @notice Get device guardian address
     * @param deviceId Device identifier
     * @return Guardian wallet address
     */
    function getDeviceGuardian(
        string memory deviceId
    ) external view returns (address) {
        return devices[deviceId].guardian;
    }
    
    /**
     * @notice Get device patient address
     * @param deviceId Device identifier
     * @return Patient wallet address
     */
    function getDevicePatient(
        string memory deviceId
    ) external view returns (address) {
        return devices[deviceId].patient;
    }
    
    /**
     * @dev Reject direct ETH transfers to prevent accidental loss
     */
    receive() external payable {
        revert("DeviceRegistry: ETH not accepted");
    }
}
