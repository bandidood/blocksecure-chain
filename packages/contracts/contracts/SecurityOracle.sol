// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SecurityOracle
 * @dev On-chain security oracle for real-time vulnerability alerts and exploit prevention
 */
contract SecurityOracle is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant REPORTER_ROLE = keccak256("REPORTER_ROLE");

    enum VulnerabilityType {
        REENTRANCY,
        INTEGER_OVERFLOW,
        ACCESS_CONTROL,
        FRONT_RUNNING,
        TIMESTAMP_DEPENDENCY,
        UNCHECKED_CALL,
        DELEGATECALL,
        TX_ORIGIN
    }

    enum Severity {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    struct Vulnerability {
        address contractAddress;
        VulnerabilityType vulnType;
        Severity severity;
        string description;
        uint256 timestamp;
        address reporter;
        bool verified;
        bool resolved;
    }

    struct AuditReport {
        address contractAddress;
        uint256 totalVulnerabilities;
        uint256 criticalCount;
        uint256 highCount;
        uint256 mediumCount;
        uint256 lowCount;
        bool isSecure;
        uint256 timestamp;
        address auditor;
    }

    // Mapping from vulnerability ID to Vulnerability
    mapping(uint256 => Vulnerability) public vulnerabilities;
    uint256 public vulnerabilityCount;

    // Mapping from contract address to audit reports
    mapping(address => AuditReport[]) public auditReports;

    // Mapping from contract address to blacklist status
    mapping(address => bool) public blacklistedContracts;

    // Events
    event VulnerabilityReported(
        uint256 indexed vulnerabilityId,
        address indexed contractAddress,
        VulnerabilityType vulnType,
        Severity severity,
        address reporter
    );

    event VulnerabilityVerified(uint256 indexed vulnerabilityId, address indexed verifier);
    event VulnerabilityResolved(uint256 indexed vulnerabilityId, address indexed resolver);
    event AuditReportSubmitted(address indexed contractAddress, address indexed auditor, bool isSecure);
    event ContractBlacklisted(address indexed contractAddress, string reason);
    event ContractWhitelisted(address indexed contractAddress);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
        _grantRole(REPORTER_ROLE, msg.sender);
    }

    /**
     * @dev Report a vulnerability in a smart contract
     */
    function reportVulnerability(
        address _contractAddress,
        VulnerabilityType _vulnType,
        Severity _severity,
        string memory _description
    ) external onlyRole(REPORTER_ROLE) whenNotPaused returns (uint256) {
        require(_contractAddress != address(0), "Invalid contract address");
        require(bytes(_description).length > 0, "Description required");

        uint256 vulnId = vulnerabilityCount++;
        vulnerabilities[vulnId] = Vulnerability({
            contractAddress: _contractAddress,
            vulnType: _vulnType,
            severity: _severity,
            description: _description,
            timestamp: block.timestamp,
            reporter: msg.sender,
            verified: false,
            resolved: false
        });

        emit VulnerabilityReported(vulnId, _contractAddress, _vulnType, _severity, msg.sender);

        // Auto-blacklist contracts with critical vulnerabilities
        if (_severity == Severity.CRITICAL) {
            _blacklistContract(_contractAddress, "Critical vulnerability detected");
        }

        return vulnId;
    }

    /**
     * @dev Verify a reported vulnerability
     */
    function verifyVulnerability(uint256 _vulnId) external onlyRole(AUDITOR_ROLE) {
        require(_vulnId < vulnerabilityCount, "Invalid vulnerability ID");
        require(!vulnerabilities[_vulnId].verified, "Already verified");

        vulnerabilities[_vulnId].verified = true;
        emit VulnerabilityVerified(_vulnId, msg.sender);
    }

    /**
     * @dev Mark a vulnerability as resolved
     */
    function resolveVulnerability(uint256 _vulnId) external onlyRole(AUDITOR_ROLE) {
        require(_vulnId < vulnerabilityCount, "Invalid vulnerability ID");
        require(vulnerabilities[_vulnId].verified, "Not verified");
        require(!vulnerabilities[_vulnId].resolved, "Already resolved");

        vulnerabilities[_vulnId].resolved = true;
        emit VulnerabilityResolved(_vulnId, msg.sender);
    }

    /**
     * @dev Submit a comprehensive audit report
     */
    function submitAuditReport(
        address _contractAddress,
        uint256 _criticalCount,
        uint256 _highCount,
        uint256 _mediumCount,
        uint256 _lowCount
    ) external onlyRole(AUDITOR_ROLE) whenNotPaused {
        require(_contractAddress != address(0), "Invalid contract address");

        uint256 totalVulnerabilities = _criticalCount + _highCount + _mediumCount + _lowCount;
        bool isSecure = (_criticalCount == 0 && _highCount == 0);

        AuditReport memory report = AuditReport({
            contractAddress: _contractAddress,
            totalVulnerabilities: totalVulnerabilities,
            criticalCount: _criticalCount,
            highCount: _highCount,
            mediumCount: _mediumCount,
            lowCount: _lowCount,
            isSecure: isSecure,
            timestamp: block.timestamp,
            auditor: msg.sender
        });

        auditReports[_contractAddress].push(report);
        emit AuditReportSubmitted(_contractAddress, msg.sender, isSecure);

        if (_criticalCount > 0) {
            _blacklistContract(_contractAddress, "Critical vulnerabilities found in audit");
        }
    }

    /**
     * @dev Check if a contract is safe to interact with
     */
    function isContractSafe(address _contractAddress) external view returns (bool) {
        if (blacklistedContracts[_contractAddress]) {
            return false;
        }

        AuditReport[] memory reports = auditReports[_contractAddress];
        if (reports.length == 0) {
            return false; // No audit available
        }

        // Return the status from the most recent audit
        return reports[reports.length - 1].isSecure;
    }

    /**
     * @dev Get vulnerabilities for a specific contract
     */
    function getContractVulnerabilities(address _contractAddress) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256[] memory tempIds = new uint256[](vulnerabilityCount);
        uint256 count = 0;

        for (uint256 i = 0; i < vulnerabilityCount; i++) {
            if (vulnerabilities[i].contractAddress == _contractAddress) {
                tempIds[count] = i;
                count++;
            }
        }

        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = tempIds[i];
        }

        return result;
    }

    /**
     * @dev Get the latest audit report for a contract
     */
    function getLatestAuditReport(address _contractAddress) 
        external 
        view 
        returns (AuditReport memory) 
    {
        AuditReport[] memory reports = auditReports[_contractAddress];
        require(reports.length > 0, "No audit reports available");
        return reports[reports.length - 1];
    }

    /**
     * @dev Blacklist a contract
     */
    function blacklistContract(address _contractAddress, string memory _reason) 
        external 
        onlyRole(AUDITOR_ROLE) 
    {
        _blacklistContract(_contractAddress, _reason);
    }

    /**
     * @dev Internal function to blacklist a contract
     */
    function _blacklistContract(address _contractAddress, string memory _reason) internal {
        blacklistedContracts[_contractAddress] = true;
        emit ContractBlacklisted(_contractAddress, _reason);
    }

    /**
     * @dev Remove a contract from blacklist
     */
    function whitelistContract(address _contractAddress) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        blacklistedContracts[_contractAddress] = false;
        emit ContractWhitelisted(_contractAddress);
    }

    /**
     * @dev Pause the contract
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
