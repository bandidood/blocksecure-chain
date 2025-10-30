# ⚡ BlockSecure Chain - Quickstart Guide

Get BlockSecure Chain up and running in 5 minutes!

## Prerequisites

- Node.js 18+ and npm 9+
- Git
- Python 3.11+ (optional, for Slither analyzer)

## One-Command Setup

```bash
# Clone, install, and test
git clone https://github.com/bandidood/blocksecure-chain.git && \
cd blocksecure-chain && \
npm install --legacy-peer-deps && \
bash scripts/integration-test.sh
```

## Local Development (3 steps)

### Step 1: Start Blockchain

```bash
cd packages/contracts
npx hardhat node
```

Keep this terminal running. You'll see test accounts with private keys.

### Step 2: Deploy Contracts

In a new terminal:

```bash
cd packages/contracts
npm run deploy:localhost
```

Copy the deployed contract address. It will look like:
```
SecurityOracle deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

Update your `.env` file:
```env
SECURITY_ORACLE_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
RPC_URL=http://127.0.0.1:8545
PORT=3001
```

### Step 3: Start Services

#### Terminal 3 - Backend:
```bash
cd packages/backend
npm run dev
```

Backend will start on http://localhost:3001

#### Terminal 4 - Frontend:
```bash
cd packages/frontend
npm run dev
```

Frontend will start on http://localhost:5173

## Using Docker (Alternative)

If you prefer Docker:

```bash
docker-compose up
```

This starts everything at once:
- Hardhat node: http://localhost:8545
- Backend API: http://localhost:3001
- Frontend: http://localhost:5173
- The Graph node: http://localhost:8000

## Quick Test

### Test the Backend API

```bash
# Check health
curl http://localhost:3001/health

# Check a contract (replace with your deployed contract address)
curl http://localhost:3001/api/contracts/0x5FbDB2315678afecb367f032d93F642f64180aa3/safe
```

### Test the Frontend

1. Open http://localhost:5173 in your browser
2. Click "Connect Wallet"
3. Connect MetaMask to "Localhost 8545"
4. Enter a contract address in the scanner
5. Click "Scan" to see results

### Test the Analyzer (Optional)

If you have Slither installed:

```bash
cd packages/analyzer
npm run scan -- check  # Check if Slither is available
```

## MetaMask Setup for Local Testing

1. **Add Local Network**:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency: ETH

2. **Import Test Account**:
   - Copy a private key from the Hardhat node terminal
   - Import it into MetaMask
   - You'll have 10,000 ETH for testing

## Common Operations

### Deploy a Test Contract

Create a vulnerable contract to test:

```solidity
// packages/contracts/contracts/VulnerableTest.sol
pragma solidity ^0.8.20;

contract VulnerableTest {
    mapping(address => uint256) public balances;
    
    // Vulnerable to reentrancy
    function withdraw() public {
        uint256 amount = balances[msg.sender];
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
        balances[msg.sender] = 0;  // State update AFTER external call
    }
    
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }
}
```

Deploy it:
```bash
cd packages/contracts
npx hardhat run scripts/deploy-test.js --network localhost
```

### Scan the Contract

Use the analyzer:
```bash
cd packages/analyzer
npm run scan -- ../contracts/contracts/VulnerableTest.sol
```

### Report Vulnerability On-Chain

Through the frontend or using the backend API:

```bash
curl -X POST http://localhost:3001/api/audits/scan \
  -H "Content-Type: application/json" \
  -d '{
    "contractPath": "./contracts/VulnerableTest.sol",
    "contractAddress": "0x..."
  }'
```

## Troubleshooting

### Port Already in Use

```bash
# Find and kill process using port 3001
lsof -ti:3001 | xargs kill -9

# Or use a different port
PORT=3002 npm run dev
```

### Hardhat Node Crashed

Just restart it:
```bash
cd packages/contracts
npx hardhat node
```

Remember to redeploy contracts after restarting the node.

### Frontend Can't Connect to Backend

Check:
1. Backend is running on port 3001
2. CORS is enabled (it should be by default)
3. Check `.env` file has correct `VITE_API_URL`

### Contracts Not Found

After restarting Hardhat node, you need to:
1. Redeploy contracts
2. Update `.env` with new contract address
3. Restart backend

## Next Steps

1. **Read the Documentation**
   - [Development Guide](./docs/DEVELOPMENT.md)
   - [User Guide](./docs/USER_GUIDE.md)

2. **Explore the API**
   - http://localhost:3001/health
   - http://localhost:3001/api/contracts/:address/safe
   - http://localhost:3001/api/contracts/:address/vulnerabilities

3. **Deploy to Testnet**
   - See [Deployment Guide](./docs/DEPLOYMENT.md)
   - Try Polygon Mumbai or Sepolia first

4. **Join the Community**
   - Discord: https://discord.gg/blocksecure
   - Twitter: @BlockSecureChain

## Quick Commands Reference

```bash
# Root commands
npm install                      # Install all dependencies
npm test                         # Run all tests
npm run build                    # Build all packages

# Contracts
cd packages/contracts
npm run compile                  # Compile contracts
npm test                         # Run contract tests
npm run deploy:localhost         # Deploy locally
npm run deploy:polygon          # Deploy to Polygon

# Backend
cd packages/backend
npm run dev                      # Start with hot reload
npm run build                    # Build for production
npm start                        # Start production server

# Frontend
cd packages/frontend
npm run dev                      # Start dev server
npm run build                    # Build for production
npm run preview                  # Preview production build

# Analyzer
cd packages/analyzer
npm run build                    # Build analyzer
npm run scan -- <file.sol>      # Scan a contract
npm run scan -- check            # Check availability
```

## Support

Having issues? Check:
1. [Troubleshooting Guide](./docs/DEVELOPMENT.md#troubleshooting)
2. [GitHub Issues](https://github.com/bandidood/blocksecure-chain/issues)
3. [Discord Community](https://discord.gg/blocksecure)

---

**Ready to start?** Run the commands above and you'll have BlockSecure Chain running in minutes! 🚀
