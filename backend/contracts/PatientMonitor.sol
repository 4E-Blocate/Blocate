// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DeviceRegistry.sol";
import "./EventLogger.sol";

/**
 * @title PatientMonitor
 * @dev Main contract that combines DeviceRegistry and EventLogger
 * @notice Single entry point for frontend - delegates to specialized contracts
 */
contract PatientMonitor {
        
    DeviceRegistry public deviceRegistry;
    EventLogger public eventLogger;
    
    address public owner;
        
    event ContractsDeployed(
        address deviceRegistry,
        address eventLogger,
        uint256 timestamp
    );
    
    
    /**
     * @notice Deploy all sub-contracts
     */
    constructor() {
        owner = msg.sender;
        
        // Deploy DeviceRegistry
        deviceRegistry = new DeviceRegistry();
        
        // Deploy EventLogger with reference to DeviceRegistry
        eventLogger = new EventLogger(address(deviceRegistry));
        
        emit ContractsDeployed(
            address(deviceRegistry),
            address(eventLogger),
            block.timestamp
        );
    }
    
    
    function registerDevice(
        string memory deviceId,
        address guardian
    ) external {
        deviceRegistry.registerDevice(deviceId, guardian);
    }
    
    function changeGuardian(
        string memory deviceId,
        address newGuardian
    ) external {
        deviceRegistry.changeGuardian(deviceId, newGuardian);
    }
    
    function deactivateDevice(string memory deviceId) external {
        deviceRegistry.deactivateDevice(deviceId);
    }
    
    function getDevice(
        string memory deviceId
    ) external view returns (IDeviceRegistry.Device memory) {
        return deviceRegistry.getDevice(deviceId);
    }
    
    function getGuardianDevices(
        address guardian
    ) external view returns (string[] memory) {
        return deviceRegistry.getGuardianDevices(guardian);
    }
    
    function getPatientDevices(
        address patient
    ) external view returns (string[] memory) {
        return deviceRegistry.getPatientDevices(patient);
    }
    
    function isDeviceRegistered(
        string memory deviceId
    ) external view returns (bool) {
        return deviceRegistry.isDeviceRegistered(deviceId);
    }
    
    function isDeviceActive(
        string memory deviceId
    ) external view returns (bool) {
        return deviceRegistry.isDeviceActive(deviceId);
    }
    
    
    function logEvent(
        string memory deviceId,
        bytes32 dataHash,
        string memory eventType
    ) external {
        eventLogger.logEvent(deviceId, dataHash, eventType);
    }
    
    function getEvent(
        uint256 index
    ) external view returns (IEventLogger.EventLog memory) {
        return eventLogger.getEvent(index);
    }
    
    function getDeviceEvents(
        string memory deviceId,
        uint256 limit
    ) external view returns (IEventLogger.EventLog[] memory) {
        return eventLogger.getDeviceEvents(deviceId, limit);
    }
    
    function getDeviceEventCount(
        string memory deviceId
    ) external view returns (uint256) {
        return eventLogger.getDeviceEventCount(deviceId);
    }
    
    function getAllEvents(
        uint256 offset,
        uint256 limit
    ) external view returns (IEventLogger.EventLog[] memory) {
        return eventLogger.getAllEvents(offset, limit);
    }
        
    function getTotalDevices() external view returns (uint256) {
        return deviceRegistry.totalDevices();
    }
    
    function getTotalEvents() external view returns (uint256) {
        return eventLogger.totalEvents();
    }
    
    /**
     * @notice Get contract addresses for direct access
     * @return Addresses of DeviceRegistry and EventLogger
     */
    function getContractAddresses() 
        external 
        view 
        returns (address, address) 
    {
        return (address(deviceRegistry), address(eventLogger));
    }
}
