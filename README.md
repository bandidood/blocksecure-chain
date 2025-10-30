# 🛡️ BlockSecure Chain

> **Advanced Blockchain Security Platform with Smart Contract Auditing and Real-Time Monitoring**

BlockSecure Chain is a comprehensive security solution that combines automated vulnerability detection, on-chain monitoring, and real-time threat prevention for smart contracts on Ethereum, Polygon, and other EVM-compatible chains.

[![CI/CD Pipeline](https://github.com/bandidood/blocksecure-chain/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/bandidood/blocksecure-chain/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 Features

### 🔍 Smart Contract Analysis
- **Automated Vulnerability Detection** using Slither and Mythril
- Detection of common vulnerabilities:
  - Reentrancy attacks
  - Integer overflow/underflow
  - Access control issues
  - Front-running vulnerabilities
  - Timestamp dependencies
  - Unchecked low-level calls
  - And more...

### ⛓️ On-Chain Security Oracle
- Real-time vulnerability tracking on-chain
- Contract blacklisting/whitelisting system
- Comprehensive audit report storage
- Multi-role access control (Auditors, Reporters, Admins)

### 📊 Real-Time Monitoring
- The Graph integration for event indexing
- Live vulnerability feed
- Historical audit data tracking
- Security metrics dashboard

### 🎨 Modern Web Interface
- React + TypeScript frontend
- RainbowKit wallet integration
- Real-time audit results visualization
- Interactive vulnerability dashboard

## 🏗️ Architecture

```
blocksecure-chain/
├── packages/
│   ├── contracts/          # Smart contracts (SecurityOracle)
│   ├── analyzer/           # Vulnerability analysis engine
│   ├── backend/            # REST API with Web3 integration
│   ├── frontend/           # React dashboard
│   └── subgraph/           # The Graph indexing
├── .github/                # CI/CD workflows
└── docker-compose.yml      # Local development setup
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Python 3.11+ (for Slither)
- Docker & Docker Compose (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bandidood/blocksecure-chain.git
   cd blocksecure-chain
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Install Slither (for vulnerability analysis)**
   ```bash
   pip3 install slither-analyzer
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Quick Test

Run the integration test to verify everything works:
```bash
bash scripts/integration-test.sh
```

### Development

#### Using Docker (Recommended)

```bash
# Start all services
docker-compose up

# Access services:
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:3001
# - Hardhat Node: http://localhost:8545
# - The Graph: http://localhost:8000
```

#### Manual Setup

1. **Start local blockchain**
   ```bash
   npm run contracts:compile
   npx hardhat node
   ```

2. **Deploy contracts**
   ```bash
   npm run deploy:localhost
   ```

3. **Start backend API**
   ```bash
   cd packages/backend
   npm run dev
   ```

4. **Start frontend**
   ```bash
   cd packages/frontend
   npm run dev
   ```

## 📦 Packages

### Smart Contracts (`@blocksecure/contracts`)

Solidity smart contracts including the SecurityOracle for on-chain vulnerability tracking.

```bash
cd packages/contracts
npm run compile      # Compile contracts
npm run test         # Run tests
npm run deploy       # Deploy to network
```

### Analyzer (`@blocksecure/analyzer`)

TypeScript vulnerability analysis engine with Slither integration.

```bash
cd packages/analyzer
npm run build        # Build analyzer
npm run scan         # Run analysis
```

### Backend API (`@blocksecure/backend`)

Express REST API with Web3 integration for blockchain interactions.

**Endpoints:**
- `POST /api/audits/scan` - Scan a contract for vulnerabilities
- `GET /api/audits/:id` - Get audit results
- `GET /api/contracts/:address/safe` - Check contract safety
- `GET /api/contracts/:address/vulnerabilities` - Get vulnerabilities

### Frontend (`@blocksecure/frontend`)

React dashboard with RainbowKit for wallet connections.

### Subgraph (`@blocksecure/subgraph`)

The Graph protocol configuration for indexing security events.

## 🧪 Testing

```bash
# Run all tests
npm test

# Test specific packages
npm run contracts:test    # Smart contract tests
npm run backend:test      # API tests
npm run frontend:test     # Frontend tests

# Coverage reports
npm run coverage
```

## 🔐 Security

BlockSecure Chain is designed to detect vulnerabilities in smart contracts. Key security features:

- **Automated Security Scanning** in CI/CD pipeline
- **Multi-layer Analysis** with Slither and Mythril
- **On-chain Verification** through SecurityOracle
- **Role-based Access Control** for audit submissions

### Vulnerability Types Detected

| Vulnerability | Severity | Description |
|--------------|----------|-------------|
| Reentrancy | Critical | Recursive call exploitation |
| Integer Overflow/Underflow | High | Arithmetic errors |
| Access Control | High | Unauthorized access |
| Front-running | Medium | Transaction ordering attacks |
| Timestamp Dependency | Medium | Block.timestamp manipulation |
| Unchecked Calls | Medium | Unhandled return values |
| Delegatecall | High | Malicious delegate calls |
| tx.origin | Medium | Authentication bypass |

## 📖 Documentation

- [Smart Contract Documentation](./packages/contracts/README.md)
- [API Documentation](./packages/backend/README.md)
- [Frontend Guide](./packages/frontend/README.md)
- [Security Audit Guidelines](./docs/SECURITY_AUDIT.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

## 🛠️ Tech Stack

**Smart Contracts:**
- Solidity 0.8.20
- Hardhat
- OpenZeppelin Contracts
- Slither & Mythril

**Backend:**
- Node.js + Express
- TypeScript
- Ethers.js / Web3.js
- MongoDB

**Frontend:**
- React 18 + TypeScript
- Vite
- RainbowKit + Wagmi
- TailwindCSS
- Recharts

**Infrastructure:**
- The Graph Protocol
- Docker & Docker Compose
- GitHub Actions

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- OpenZeppelin for secure contract libraries
- Trail of Bits for Slither
- ConsenSys for Mythril
- The Graph Protocol team
- RainbowKit & Wagmi contributors

## 📬 Contact

- **Website:** https://blocksecure.chain
- **Twitter:** [@BlockSecureChain](https://twitter.com/BlockSecureChain)
- **Discord:** [Join our community](https://discord.gg/blocksecure)

---

**⚠️ Disclaimer:** BlockSecure Chain is an automated security analysis tool. Always conduct professional security audits before deploying contracts to production.
