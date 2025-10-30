# 🛠️ BlockSecure Chain - Development Guide

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development Workflow](#development-workflow)
- [Package Details](#package-details)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Python** 3.11+ (for Slither)
- **Docker & Docker Compose** (optional, for local development)

### Development Tools
```bash
# Install Slither for smart contract analysis
pip3 install slither-analyzer

# Verify installation
slither --version
```

## Installation

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/blocksecure-chain.git
cd blocksecure-chain
```

### 2. Install Dependencies
```bash
# Install all workspace dependencies
npm install --legacy-peer-deps
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
```

**Required Environment Variables:**
```env
# Blockchain RPC
RPC_URL=http://127.0.0.1:8545

# Contract Addresses
SECURITY_ORACLE_ADDRESS=0x...

# API Configuration
PORT=3001
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:3001/api
VITE_WALLETCONNECT_PROJECT_ID=your_project_id

# Optional: MongoDB (if using database)
MONGODB_URI=mongodb://localhost:27017/blocksecure
```

## Development Workflow

### Quick Start with Docker
```bash
# Start all services (blockchain, backend, frontend, graph node)
docker-compose up

# Access services:
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:3001
# - Hardhat Node: http://localhost:8545
# - The Graph: http://localhost:8000
```

### Manual Development Setup

#### 1. Start Local Blockchain
```bash
# Terminal 1: Start Hardhat node
cd packages/contracts
npx hardhat node
```

#### 2. Deploy Smart Contracts
```bash
# Terminal 2: Deploy SecurityOracle
cd packages/contracts
npm run deploy:localhost

# Copy the deployed address to .env
# SECURITY_ORACLE_ADDRESS=0x...
```

#### 3. Start Backend API
```bash
# Terminal 3: Start API server
cd packages/backend
npm run dev

# API available at http://localhost:3001
```

#### 4. Start Frontend
```bash
# Terminal 4: Start Vite dev server
cd packages/frontend
npm run dev

# Frontend available at http://localhost:5173
```

## Package Details

### 📦 Smart Contracts (`packages/contracts`)

**Key Commands:**
```bash
cd packages/contracts

# Compile contracts
npm run compile

# Run tests
npm test

# Generate coverage report
npm run coverage

# Deploy to localhost
npm run deploy:localhost

# Deploy to Polygon
npm run deploy:polygon

# Verify on Polygonscan
npm run verify -- --network polygon <CONTRACT_ADDRESS>
```

**Contract Architecture:**
- `SecurityOracle.sol`: Main on-chain security oracle
- Uses OpenZeppelin v5 (AccessControl, Pausable, ReentrancyGuard)
- Roles: DEFAULT_ADMIN_ROLE, AUDITOR_ROLE, REPORTER_ROLE

**Key Functions:**
- `reportVulnerability()`: Report a vulnerability
- `verifyVulnerability()`: Verify reported vulnerability (AUDITOR)
- `resolveVulnerability()`: Mark vulnerability as resolved (AUDITOR)
- `submitAuditReport()`: Submit comprehensive audit report (AUDITOR)
- `isContractSafe()`: Check if contract is safe
- `blacklistContract()` / `whitelistContract()`: Manage contract blacklist

### 🔍 Analyzer (`packages/analyzer`)

**Key Commands:**
```bash
cd packages/analyzer

# Build TypeScript
npm run build

# Run analyzer CLI
npm run scan -- <path/to/contract.sol>

# Check analyzer availability
npm run scan -- check

# Development mode
npm run dev
```

**Architecture:**
- `SlitherAnalyzer`: Wraps Slither Python tool
- `VulnerabilityAnalyzer`: Main analyzer orchestrator
- CLI tool for command-line usage

**Supported Vulnerability Types:**
- Reentrancy
- Integer Overflow/Underflow
- Access Control Issues
- Front-running
- Timestamp Dependency
- Unchecked Low-level Calls
- Delegatecall Vulnerabilities
- tx.origin Usage

### 🖥️ Backend API (`packages/backend`)

**Key Commands:**
```bash
cd packages/backend

# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
```

**API Endpoints:**

**Audit Endpoints:**
- `POST /api/audits/scan` - Scan a contract
- `GET /api/audits/:id` - Get audit by ID
- `GET /api/audits` - List all audits
- `GET /api/audits/contract/:address` - Get audits for contract

**Contract Endpoints:**
- `GET /api/contracts/:address/safe` - Check if contract is safe
- `GET /api/contracts/:address/vulnerabilities` - Get vulnerabilities
- `GET /api/contracts/:address/audit-report` - Get latest audit report

**Example Request:**
```bash
curl -X POST http://localhost:3001/api/audits/scan \
  -H "Content-Type: application/json" \
  -d '{
    "contractPath": "./contracts/MyContract.sol",
    "contractAddress": "0x123..."
  }'
```

### 🎨 Frontend (`packages/frontend`)

**Key Commands:**
```bash
cd packages/frontend

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

**Tech Stack:**
- React 18 + TypeScript
- Vite for blazing fast builds
- TailwindCSS for styling
- RainbowKit + Wagmi for Web3
- Lucide React for icons

**Key Components:**
- `Dashboard`: Main layout wrapper
- `ContractScanner`: Contract address scanner
- `VulnerabilityList`: Display vulnerabilities
- `Web3Provider`: Wallet connection provider

### 📊 Subgraph (`packages/subgraph`)

**Key Commands:**
```bash
cd packages/subgraph

# Generate TypeScript types from schema
npm run codegen

# Build subgraph
npm run build

# Deploy to local Graph node
npm run deploy:local

# Deploy to hosted service
npm run deploy
```

**GraphQL Entities:**
- `Vulnerability`: Individual vulnerability records
- `AuditReport`: Audit report records
- `Contract`: Contract metadata and status

**Example Query:**
```graphql
query GetContractVulnerabilities($address: Bytes!) {
  vulnerabilities(where: { contractAddress: $address }) {
    id
    vulnType
    severity
    timestamp
    verified
    resolved
  }
}
```

## Testing

### Smart Contract Tests
```bash
cd packages/contracts
npm test

# Run specific test
npx hardhat test --grep "vulnerability"

# Coverage report
npm run coverage
```

### Backend Tests
```bash
cd packages/backend
npm test

# Watch mode
npm test -- --watch
```

### Integration Tests
```bash
# From root directory
npm test
```

## Deployment

### Deploy to Polygon Mainnet

#### 1. Configure Environment
```env
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your_private_key_here
POLYGONSCAN_API_KEY=your_api_key
```

#### 2. Deploy Contract
```bash
cd packages/contracts
npm run deploy:polygon
```

#### 3. Verify Contract
```bash
npx hardhat verify --network polygon <CONTRACT_ADDRESS>
```

#### 4. Update Subgraph
```bash
cd packages/subgraph

# Update subgraph.yaml with contract address
# Then deploy
npm run deploy
```

#### 5. Deploy Backend
```bash
cd packages/backend

# Build
npm run build

# Deploy to your hosting service (Vercel, Railway, etc.)
```

#### 6. Deploy Frontend
```bash
cd packages/frontend

# Update environment variables
echo "VITE_API_URL=https://your-api.com/api" > .env.production

# Build
npm run build

# Deploy dist/ folder to Vercel, Netlify, etc.
```

## Troubleshooting

### Common Issues

#### Slither Not Found
```bash
# Install Slither
pip3 install slither-analyzer

# Or with pipx
pipx install slither-analyzer
```

#### Hardhat Compilation Errors
```bash
# Clear cache and recompile
cd packages/contracts
rm -rf cache/ artifacts/
npm run compile
```

#### Web3 Connection Issues
- Ensure MetaMask is installed and connected
- Check network configuration in frontend
- Verify RPC URL is correct

#### Subgraph Deployment Fails
- Ensure Graph node is running
- Check contract address in subgraph.yaml
- Verify ABI path is correct

### Debug Mode

#### Backend Debug
```bash
cd packages/backend
DEBUG=* npm run dev
```

#### Frontend Debug
Open browser console (F12) to see logs

### Performance Tips

1. **Use Docker for consistency**
2. **Keep dependencies updated**: `npm outdated`
3. **Run tests in parallel**: `npm test -- --maxWorkers=4`
4. **Use development network for testing**

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

## Security

Report security vulnerabilities to: security@blocksecure.chain

## License

MIT License - see [LICENSE](../LICENSE) for details.
