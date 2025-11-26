// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IEventLogger.sol";
import "./IDeviceRegistry.sol";

/**
 * @title EventLogger
 * @dev Logs health event hashes on-chain for immutable verification
 * @notice Stores only SHA-256 hashes; full data lives in GunDB (P2P storage)
 */
contract EventLogger is IEventLogger {
    
    // ============ State Variables ============
    
    /// @dev Array of all event logs
    EventLog[] private eventLogs;
    
    /// @dev Mapping from deviceId to array of event indices
    mapping(string => uint256[]) private deviceEventIndices;
    
    /// @dev Reference to DeviceRegistry contract
    IDeviceRegistry public deviceRegistry;
    
    /// @dev Total number of events logged
    uint256 public totalEvents;
    
    // ============ Constructor ============
    
    /**
     * @notice Initialize with DeviceRegistry contract address
     * @param _deviceRegistry Address of the DeviceRegistry contract
     */
    constructor(address _deviceRegistry) {
        require(
            _deviceRegistry != address(0),
            "EventLogger: Invalid registry address"
        );
        deviceRegistry = IDeviceRegistry(_deviceRegistry);
    }
    
    // ============ Modifiers ============
    
    modifier deviceRegistered(string memory deviceId) {
        require(
            deviceRegistry.isDeviceRegistered(deviceId),
            "EventLogger: Device not registered"
        );
        _;
    }
    
    modifier deviceActive(string memory deviceId) {
        require(
            deviceRegistry.isDeviceActive(deviceId),
            "EventLogger: Device is not active"
        );
        _;
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice Log a health event on-chain
     * @dev Stores only the hash; full data is in GunDB. Only patient/guardian can log.
     * @param deviceId Device that generated the event
     * @param dataHash SHA-256 hash of full event data
     * @param eventType Event severity: "normal", "alert", or "critical"
     */
    function logEvent(
        string memory deviceId,
        bytes32 dataHash,
        string memory eventType
    ) external override deviceRegistered(deviceId) deviceActive(deviceId) {
        
        // Get device info from registry
        IDeviceRegistry.Device memory device = deviceRegistry.getDevice(deviceId);
        
        // ACCESS CONTROL: Only patient or guardian can log events
        require(
            msg.sender == device.patient || msg.sender == device.guardian,
            "EventLogger: Only patient or guardian can log events"
        );
        
        // Validate event type using enum-like comparison
        bytes32 typeHash = keccak256(bytes(eventType));
        require(
            typeHash == keccak256(bytes("normal")) ||
            typeHash == keccak256(bytes("alert")) ||
            typeHash == keccak256(bytes("critical")),
            "EventLogger: Invalid event type"
        );
        
        // Create event log
        EventLog memory newEvent = EventLog({
            deviceId: deviceId,
            dataHash: dataHash,
            guardian: device.guardian,
            eventType: eventType,
            timestamp: block.timestamp
        });
        
        // Store event
        eventLogs.push(newEvent);
        uint256 eventIndex = eventLogs.length - 1;
        deviceEventIndices[deviceId].push(eventIndex);
        
        totalEvents++;
        
        emit EventLogged(
            deviceId,
            device.guardian,
            dataHash,
            eventType,
            block.timestamp
        );
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get event by index
     * @param index Event index in the logs array
     * @return EventLog struct
     */
    function getEvent(
        uint256 index
    ) external view override returns (EventLog memory) {
        require(
            index < eventLogs.length,
            "EventLogger: Event index out of bounds"
        );
        return eventLogs[index];
    }
    
    /**
     * @notice Get latest N events for a device (paginated)
     * @param deviceId Device identifier
     * @param limit Maximum number of events to return (max 100)
     * @return Array of EventLog structs (most recent first)
     */
    function getDeviceEvents(
        string memory deviceId,
        uint256 limit
    ) external view override returns (EventLog[] memory) {
        // PAGINATION: Enforce maximum limit to prevent gas issues
        require(limit > 0 && limit <= 100, "EventLogger: Limit must be 1-100");
        
        uint256[] memory indices = deviceEventIndices[deviceId];
        uint256 count = indices.length > limit ? limit : indices.length;
        
        EventLog[] memory events = new EventLog[](count);
        
        // Return in reverse order (most recent first)
        for (uint256 i = 0; i < count; i++) {
            uint256 index = indices[indices.length - 1 - i];
            events[i] = eventLogs[index];
        }
        
        return events;
    }
    
    /**
     * @notice Get all event indices for a device
     * @param deviceId Device identifier
     * @return Array of event indices
     */
    function getDeviceEventIndices(
        string memory deviceId
    ) external view returns (uint256[] memory) {
        return deviceEventIndices[deviceId];
    }
    
    /**
     * @notice Get total event count for a device
     * @param deviceId Device identifier
     * @return Number of events
     */
    function getDeviceEventCount(
        string memory deviceId
    ) external view override returns (uint256) {
        return deviceEventIndices[deviceId].length;
    }
    
    /**
     * @notice Get all events (paginated)
     * @param offset Starting index
     * @param limit Number of events to return (max 100)
     * @return Array of EventLog structs
     */
    function getAllEvents(
        uint256 offset,
        uint256 limit
    ) external view returns (EventLog[] memory) {
        require(
            offset < eventLogs.length,
            "EventLogger: Offset out of bounds"
        );
        require(limit > 0 && limit <= 100, "EventLogger: Limit must be 1-100");
        
        uint256 end = offset + limit;
        if (end > eventLogs.length) {
            end = eventLogs.length;
        }
        
        uint256 count = end - offset;
        EventLog[] memory events = new EventLog[](count);
        
        for (uint256 i = 0; i < count; i++) {
            events[i] = eventLogs[offset + i];
        }
        
        return events;
    }
    
    /**
     * @notice Verify event data matches stored hash
     * @param index Event index
     * @param dataHash Hash to verify
     * @return True if hash matches
     */
    function verifyEventHash(
        uint256 index,
        bytes32 dataHash
    ) external view returns (bool) {
        require(
            index < eventLogs.length,
            "EventLogger: Event index out of bounds"
        );
        return eventLogs[index].dataHash == dataHash;
    }
    
    /**
     * @dev Reject direct ETH transfers to prevent accidental loss
     */
    receive() external payable {
        revert("EventLogger: ETH not accepted");
    }
}
