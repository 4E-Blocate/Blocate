// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IDeviceRegistry
 * @dev Interface for device registration and management
 */
interface IDeviceRegistry {
    
    struct Device {
        string deviceId;
        address patient;
        address guardian;
        bool isActive;
        uint256 registeredAt;
    }
    
    event DeviceRegistered(
        string indexed deviceId,
        address indexed patient,
        address indexed guardian,
        uint256 timestamp
    );
    
    event GuardianChanged(
        string indexed deviceId,
        address oldGuardian,
        address newGuardian,
        uint256 timestamp
    );
    
    event DeviceDeactivated(
        string indexed deviceId,
        uint256 timestamp
    );
    
    function registerDevice(string memory deviceId, address guardian) external;
    function registerDeviceFor(string memory deviceId, address patient, address guardian) external;
    function changeGuardian(string memory deviceId, address newGuardian) external;
    function deactivateDevice(string memory deviceId) external;
    function getDevice(string memory deviceId) external view returns (Device memory);
    function isDeviceRegistered(string memory deviceId) external view returns (bool);
    function isDeviceActive(string memory deviceId) external view returns (bool);
}
