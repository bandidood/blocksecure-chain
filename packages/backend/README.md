# 🚀 BlockSecure Chain - Backend API

> Express REST API with Web3 integration for blockchain security analysis

## Overview

The `@blocksecure/backend` package provides a RESTful API that connects the BlockSecure Chain frontend to the blockchain and analysis tools. It handles smart contract scanning, vulnerability reporting, and interaction with the SecurityOracle smart contract.

## 🏗️ Architecture

```
packages/backend/
├── src/
│   ├── controllers/        # Request handlers
│   │   ├── AuditController.ts
│   │   └── ContractController.ts
│   ├── routes/             # API route definitions
│   │   ├── audit.ts
│   │   └── contract.ts
│   ├── services/           # Business logic
│   │   └── Web3Service.ts
│   ├── middleware/         # Express middleware
│   │   └── errorHandler.ts
│   └── index.ts            # Application entry point
├── dist/                   # Compiled JavaScript
└── package.json
```

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18+
- **Language**: TypeScript 5.3+
- **Web3**: Ethers.js v6
- **Validation**: Express Validator
- **Security**: Helmet, CORS
- **Utilities**: Morgan (logging), Compression

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Slither analyzer installed (`pip3 install slither-analyzer`)
- Ethereum wallet with testnet funds (for blockchain interactions)

### Installation

```bash
# Navigate to backend directory
cd packages/backend

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Environment Variables

Create a `.env` file in `packages/backend/`:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Blockchain Configuration
RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY
CHAIN_ID=80001
SECURITY_ORACLE_ADDRESS=0x...

# Optional: Private key for submitting on-chain reports
PRIVATE_KEY=your_private_key_here

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### Development

```bash
# Development mode with hot reload
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start

# Run tests
npm test
```

The API will be available at `http://localhost:3001` by default.

## 📡 API Endpoints

### Base URL

```
http://localhost:3001/api
```

### Health Check

#### GET `/health`

Check if the API is running.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-30T12:00:00.000Z"
}
```

---

## 🔍 Audit Endpoints

### Scan Contract

#### POST `/api/audits/scan`

Scan a smart contract for vulnerabilities using Slither analyzer.

**Request Body:**
```json
{
  "contractPath": "/path/to/contract.sol",
  "contractAddress": "0x1234567890123456789012345678901234567890"
}
```

**Parameters:**
- `contractPath` (required): Path to the Solidity contract file
- `contractAddress` (optional): Ethereum address of deployed contract

**Response (200 OK):**
```json
{
  "success": true,
  "auditId": "audit_abc123",
  "contractAddress": "0x1234567890123456789012345678901234567890",
  "vulnerabilities": [
    {
      "type": "REENTRANCY",
      "severity": "HIGH",
      "location": "contract.sol:45-52",
      "description": "Reentrancy vulnerability detected in withdraw function",
      "recommendation": "Use the Checks-Effects-Interactions pattern"
    }
  ],
  "summary": {
    "totalIssues": 5,
    "critical": 0,
    "high": 1,
    "medium": 2,
    "low": 2
  },
  "timestamp": "2025-01-30T12:00:00.000Z"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Contract path is required"
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/api/audits/scan \
  -H "Content-Type: application/json" \
  -d '{
    "contractPath": "./contracts/MyToken.sol",
    "contractAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }'
```

### Get Audit by ID

#### GET `/api/audits/:id`

Retrieve audit results by audit ID.

**Parameters:**
- `id` (path): Audit identifier

**Response (200 OK):**
```json
{
  "success": true,
  "audit": {
    "id": "audit_abc123",
    "contractAddress": "0x1234...",
    "vulnerabilities": [...],
    "summary": {...},
    "timestamp": "2025-01-30T12:00:00.000Z"
  }
}
```

**Example:**
```bash
curl http://localhost:3001/api/audits/audit_abc123
```

### Get All Audits

#### GET `/api/audits`

Retrieve all audit records.

**Query Parameters:**
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response (200 OK):**
```json
{
  "success": true,
  "audits": [
    {
      "id": "audit_abc123",
      "contractAddress": "0x1234...",
      "timestamp": "2025-01-30T12:00:00.000Z"
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

**Example:**
```bash
curl "http://localhost:3001/api/audits?limit=10&offset=0"
```

### Get Audits by Contract

#### GET `/api/audits/contract/:address`

Get all audits for a specific contract address.

**Parameters:**
- `address` (path): Ethereum contract address

**Response (200 OK):**
```json
{
  "success": true,
  "contractAddress": "0x1234...",
  "audits": [
    {
      "id": "audit_abc123",
      "timestamp": "2025-01-30T12:00:00.000Z",
      "summary": {...}
    }
  ]
}
```

**Example:**
```bash
curl http://localhost:3001/api/audits/contract/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

---

## 🔐 Contract Endpoints

### Check Contract Safety

#### GET `/api/contracts/:address/safe`

Check if a contract is safe to interact with based on on-chain SecurityOracle data.

**Parameters:**
- `address` (path): Ethereum contract address

**Response (200 OK):**
```json
{
  "success": true,
  "contractAddress": "0x1234...",
  "isSafe": true,
  "isBlacklisted": false,
  "hasAudit": true,
  "message": "Contract has passed security audit"
}
```

**Response (unsafe contract):**
```json
{
  "success": true,
  "contractAddress": "0x1234...",
  "isSafe": false,
  "isBlacklisted": true,
  "reason": "Critical vulnerability detected",
  "message": "⚠️ WARNING: Contract is blacklisted and unsafe"
}
```

**Example:**
```bash
curl http://localhost:3001/api/contracts/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/safe
```

### Get Contract Vulnerabilities

#### GET `/api/contracts/:address/vulnerabilities`

Retrieve all vulnerabilities reported for a contract from the SecurityOracle.

**Parameters:**
- `address` (path): Ethereum contract address

**Response (200 OK):**
```json
{
  "success": true,
  "contractAddress": "0x1234...",
  "vulnerabilities": [
    {
      "id": 0,
      "type": "REENTRANCY",
      "severity": "CRITICAL",
      "description": "Reentrancy in withdraw function",
      "reporter": "0xabcd...",
      "timestamp": 1706616000,
      "verified": true,
      "resolved": false
    }
  ],
  "total": 3
}
```

**Example:**
```bash
curl http://localhost:3001/api/contracts/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/vulnerabilities
```

### Get Latest Audit Report

#### GET `/api/contracts/:address/audit-report`

Retrieve the most recent audit report from the SecurityOracle.

**Parameters:**
- `address` (path): Ethereum contract address

**Response (200 OK):**
```json
{
  "success": true,
  "contractAddress": "0x1234...",
  "report": {
    "totalVulnerabilities": 5,
    "criticalCount": 0,
    "highCount": 1,
    "mediumCount": 2,
    "lowCount": 2,
    "isSecure": true,
    "timestamp": 1706616000,
    "auditor": "0xefgh..."
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "No audit reports available for this contract"
}
```

**Example:**
```bash
curl http://localhost:3001/api/contracts/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/audit-report
```

---

## 🔧 Web3 Integration

The backend integrates with Ethereum-compatible blockchains using ethers.js v6.

### Web3Service

Located in `src/services/Web3Service.ts`, this service handles:

- Connection to blockchain RPC providers
- Interaction with SecurityOracle smart contract
- Reading on-chain vulnerability data
- Submitting audit reports (when private key is configured)

**Example Usage:**

```typescript
import { Web3Service } from './services/Web3Service';

const web3Service = new Web3Service();

// Check if contract is safe
const isSafe = await web3Service.isContractSafe(contractAddress);

// Get vulnerabilities
const vulnerabilities = await web3Service.getContractVulnerabilities(contractAddress);

// Get latest audit report
const report = await web3Service.getLatestAuditReport(contractAddress);
```

## 🛡️ Security Middleware

### Helmet

HTTP security headers configured via Helmet:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- And more...

### CORS

Cross-Origin Resource Sharing configured to allow frontend access:
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
```

### Input Validation

All endpoints use express-validator for request validation:
- Contract addresses validated as Ethereum addresses
- Required fields checked
- Type validation

## 📊 Error Handling

The API uses a centralized error handler middleware.

**Standard Error Response:**
```json
{
  "success": false,
  "error": "Error message here",
  "details": "Additional error details (dev mode only)"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run integration tests
npm run test:integration
```

### Test Example

```typescript
import request from 'supertest';
import app from '../src/index';

describe('GET /health', () => {
  it('should return OK status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });
});
```

## 📈 Performance

### Optimization Features

- **Compression**: Response compression with gzip
- **Caching**: In-memory caching for frequently accessed data
- **Connection Pooling**: Reused Web3 connections
- **Rate Limiting**: (Recommended for production)

### Monitoring

Consider adding:
- APM tools (New Relic, DataDog)
- Log aggregation (Winston, Bunyan)
- Metrics collection (Prometheus)

## 🚢 Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### Build Script

```bash
npm run build
NODE_ENV=production node dist/index.js
```

### Environment Variables (Production)

```env
NODE_ENV=production
PORT=3001
RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
SECURITY_ORACLE_ADDRESS=0x...
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Ethers.js v6 Documentation](https://docs.ethers.org/v6/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 📄 License

MIT License - See [LICENSE](../../LICENSE) for details.
