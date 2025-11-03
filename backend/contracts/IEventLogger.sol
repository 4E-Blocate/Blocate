// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IEventLogger
 * @dev Interface for logging patient health events
 */
interface IEventLogger {
    
    struct EventLog {
        string deviceId;
        bytes32 dataHash;
        address guardian;
        string eventType;
        uint256 timestamp;
    }
    
    event EventLogged(
        string indexed deviceId,
        address indexed guardian,
        bytes32 dataHash,
        string eventType,
        uint256 timestamp
    );
    
    function logEvent(
        string memory deviceId,
        bytes32 dataHash,
        string memory eventType
    ) external;
    
    function getEvent(uint256 index) external view returns (EventLog memory);
    function getDeviceEvents(string memory deviceId, uint256 limit) external view returns (EventLog[] memory);
    function getDeviceEventCount(string memory deviceId) external view returns (uint256);
}
