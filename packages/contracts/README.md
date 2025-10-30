# 📜 BlockSecure Chain - Smart Contracts

> Solidity smart contracts for on-chain security oracle and vulnerability tracking

## Overview

The `@blocksecure/contracts` package contains the core smart contracts that power BlockSecure Chain's on-chain security infrastructure. The primary contract, **SecurityOracle**, provides a decentralized oracle for tracking smart contract vulnerabilities, audit reports, and security status across EVM-compatible chains.

## 🏗️ Architecture

```
packages/contracts/
├── contracts/
│   └── SecurityOracle.sol       # Main security oracle contract
├── scripts/
│   └── deploy.ts                # Deployment scripts
├── test/
│   └── SecurityOracle.test.ts   # Comprehensive test suite
└── hardhat.config.ts            # Hardhat configuration
```

## 🔐 SecurityOracle Contract

### Key Features

- **Vulnerability Reporting**: On-chain tracking of smart contract vulnerabilities
- **Role-Based Access Control**: Granular permissions for auditors, reporters, and admins
- **Audit Report Storage**: Comprehensive audit reports stored on-chain
- **Blacklist/Whitelist System**: Automated contract safety management
- **Event-Driven Architecture**: Real-time notifications via events

### Contract Roles

The SecurityOracle implements three access control roles using OpenZeppelin's AccessControl:

| Role | Description | Capabilities |
|------|-------------|--------------|
| `DEFAULT_ADMIN_ROLE` | Contract administrator | Grant/revoke roles, pause contract, whitelist contracts |
| `AUDITOR_ROLE` | Security auditors | Verify vulnerabilities, resolve issues, submit audit reports, blacklist contracts |
| `REPORTER_ROLE` | Vulnerability reporters | Report new vulnerabilities |

### Vulnerability Types

```solidity
enum VulnerabilityType {
    REENTRANCY,              // Recursive call vulnerabilities
    INTEGER_OVERFLOW,        // Arithmetic overflow/underflow
    ACCESS_CONTROL,          // Unauthorized access issues
    FRONT_RUNNING,           // Transaction ordering attacks
    TIMESTAMP_DEPENDENCY,    // Block.timestamp manipulation
    UNCHECKED_CALL,          // Unhandled return values
    DELEGATECALL,            // Malicious delegatecall usage
    TX_ORIGIN                // tx.origin authentication
}
```

### Severity Levels

```solidity
enum Severity {
    LOW,        // Minor issues, best practice violations
    MEDIUM,     // Potential vulnerabilities with limited impact
    HIGH,       // Serious vulnerabilities requiring attention
    CRITICAL    // Severe vulnerabilities requiring immediate action
}
```

## 📖 Core Functions

### Reporting Vulnerabilities

```solidity
function reportVulnerability(
    address _contractAddress,
    VulnerabilityType _vulnType,
    Severity _severity,
    string memory _description
) external onlyRole(REPORTER_ROLE) whenNotPaused returns (uint256)
```

**Description**: Report a vulnerability in a smart contract.

**Parameters**:
- `_contractAddress`: Address of the vulnerable contract
- `_vulnType`: Type of vulnerability detected
- `_severity`: Severity level (LOW, MEDIUM, HIGH, CRITICAL)
- `_description`: Detailed description of the vulnerability

**Returns**: Vulnerability ID (uint256)

**Events Emitted**: `VulnerabilityReported`

**Example**:
```javascript
const tx = await securityOracle.reportVulnerability(
    "0x1234...",
    VulnerabilityType.REENTRANCY,
    Severity.CRITICAL,
    "Reentrancy vulnerability in withdraw function"
);
const receipt = await tx.wait();
const vulnId = receipt.events[0].args.vulnerabilityId;
```

### Verifying Vulnerabilities

```solidity
function verifyVulnerability(uint256 _vulnId) 
    external 
    onlyRole(AUDITOR_ROLE)
```

**Description**: Verify a reported vulnerability after audit review.

**Parameters**:
- `_vulnId`: ID of the vulnerability to verify

**Events Emitted**: `VulnerabilityVerified`

### Resolving Vulnerabilities

```solidity
function resolveVulnerability(uint256 _vulnId) 
    external 
    onlyRole(AUDITOR_ROLE)
```

**Description**: Mark a vulnerability as resolved after fix confirmation.

**Parameters**:
- `_vulnId`: ID of the vulnerability to resolve

**Events Emitted**: `VulnerabilityResolved`

### Submitting Audit Reports

```solidity
function submitAuditReport(
    address _contractAddress,
    uint256 _criticalCount,
    uint256 _highCount,
    uint256 _mediumCount,
    uint256 _lowCount
) external onlyRole(AUDITOR_ROLE) whenNotPaused
```

**Description**: Submit a comprehensive audit report for a smart contract.

**Parameters**:
- `_contractAddress`: Address of the audited contract
- `_criticalCount`: Number of critical vulnerabilities
- `_highCount`: Number of high severity issues
- `_mediumCount`: Number of medium severity issues
- `_lowCount`: Number of low severity issues

**Events Emitted**: `AuditReportSubmitted`

**Auto-Actions**: Automatically blacklists contracts with critical vulnerabilities

### Checking Contract Safety

```solidity
function isContractSafe(address _contractAddress) 
    external 
    view 
    returns (bool)
```

**Description**: Check if a contract is safe to interact with.

**Returns**: `true` if contract is safe (not blacklisted and passed most recent audit)

### Query Functions

```solidity
// Get all vulnerabilities for a specific contract
function getContractVulnerabilities(address _contractAddress) 
    external 
    view 
    returns (uint256[] memory)

// Get the latest audit report
function getLatestAuditReport(address _contractAddress) 
    external 
    view 
    returns (AuditReport memory)
```

### Blacklist Management

```solidity
// Blacklist a contract (AUDITOR_ROLE)
function blacklistContract(address _contractAddress, string memory _reason) 
    external 
    onlyRole(AUDITOR_ROLE)

// Remove from blacklist (DEFAULT_ADMIN_ROLE only)
function whitelistContract(address _contractAddress) 
    external 
    onlyRole(DEFAULT_ADMIN_ROLE)
```

## 📡 Events

```solidity
event VulnerabilityReported(
    uint256 indexed vulnerabilityId,
    address indexed contractAddress,
    VulnerabilityType vulnType,
    Severity severity,
    address reporter
);

event VulnerabilityVerified(
    uint256 indexed vulnerabilityId, 
    address indexed verifier
);

event VulnerabilityResolved(
    uint256 indexed vulnerabilityId, 
    address indexed resolver
);

event AuditReportSubmitted(
    address indexed contractAddress, 
    address indexed auditor, 
    bool isSecure
);

event ContractBlacklisted(
    address indexed contractAddress, 
    string reason
);

event ContractWhitelisted(
    address indexed contractAddress
);
```

## 🚀 Deployment

### Local Development (Hardhat)

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm test

# Start local Hardhat node
npx hardhat node

# Deploy to local network
npx hardhat run scripts/deploy.ts --network localhost
```

### Testnet Deployment

```bash
# Polygon Mumbai
npx hardhat run scripts/deploy.ts --network mumbai

# Ethereum Sepolia
npx hardhat run scripts/deploy.ts --network sepolia

# Verify contract on Etherscan
npx hardhat verify --network mumbai <CONTRACT_ADDRESS>
```

### Environment Variables

Create a `.env` file in the contracts directory:

```env
PRIVATE_KEY=your_wallet_private_key
INFURA_API_KEY=your_infura_key
POLYGONSCAN_API_KEY=your_polygonscan_key
ETHERSCAN_API_KEY=your_etherscan_key
```

## 🧪 Testing

The contract includes 29 comprehensive unit tests covering all functionality:

```bash
# Run all tests
npm test

# Run with gas reporting
REPORT_GAS=true npm test

# Run with coverage
npm run coverage
```

### Test Coverage

- ✅ Vulnerability reporting and lifecycle
- ✅ Role-based access control
- ✅ Audit report submission
- ✅ Blacklist/whitelist functionality
- ✅ Contract safety checks
- ✅ Event emissions
- ✅ Edge cases and error conditions

## 💡 Usage Examples

### Basic Integration

```javascript
import { ethers } from "hardhat";

// Get contract instance
const SecurityOracle = await ethers.getContractFactory("SecurityOracle");
const oracle = await SecurityOracle.attach("0x...");

// Check if a contract is safe
const isSafe = await oracle.isContractSafe("0x1234...");

// Get vulnerabilities for a contract
const vulnIds = await oracle.getContractVulnerabilities("0x1234...");

// Get vulnerability details
for (const id of vulnIds) {
    const vuln = await oracle.vulnerabilities(id);
    console.log(`Type: ${vuln.vulnType}, Severity: ${vuln.severity}`);
}

// Get latest audit report
const report = await oracle.getLatestAuditReport("0x1234...");
console.log(`Total Issues: ${report.totalVulnerabilities}`);
console.log(`Is Secure: ${report.isSecure}`);
```

### Role Management

```javascript
// Grant auditor role
const AUDITOR_ROLE = await oracle.AUDITOR_ROLE();
await oracle.grantRole(AUDITOR_ROLE, auditorAddress);

// Grant reporter role
const REPORTER_ROLE = await oracle.REPORTER_ROLE();
await oracle.grantRole(REPORTER_ROLE, reporterAddress);

// Check role
const hasRole = await oracle.hasRole(AUDITOR_ROLE, address);
```

## 🔒 Security Considerations

1. **Access Control**: Carefully manage role assignments
2. **Gas Optimization**: Large vulnerability lists may require pagination
3. **Event Monitoring**: Use The Graph for efficient event indexing
4. **Upgrade Strategy**: Contract is not upgradeable by design for security
5. **Pausability**: Admin can pause in case of emergencies

## 📊 Gas Costs (Approximate)

| Operation | Gas Cost |
|-----------|----------|
| Report Vulnerability | ~120,000 |
| Verify Vulnerability | ~50,000 |
| Submit Audit Report | ~150,000 |
| Check Contract Safety | ~30,000 (view) |
| Blacklist Contract | ~60,000 |

## 🛠️ Tech Stack

- **Solidity**: 0.8.20
- **Hardhat**: 2.19+
- **OpenZeppelin Contracts**: 5.0+
- **Testing**: Hardhat + Chai + Ethers.js

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)

## 📄 License

MIT License - See [LICENSE](../../LICENSE) for details.
