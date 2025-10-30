# 🎨 BlockSecure Chain - Frontend Dashboard

> Modern React dashboard with Web3 wallet integration for blockchain security analysis

## Overview

The `@blocksecure/frontend` package provides an intuitive, responsive web interface for BlockSecure Chain. Built with React 18, TypeScript, and Vite, it offers seamless wallet connectivity via RainbowKit and real-time contract security analysis.

## 🏗️ Architecture

```
packages/frontend/
├── src/
│   ├── components/         # React components
│   │   ├── Dashboard.tsx   # Main layout component
│   │   ├── ContractScanner.tsx
│   │   ├── VulnerabilityList.tsx
│   │   └── Web3Provider.tsx
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── public/                 # Static assets
├── index.html
└── package.json
```

## 🛠️ Tech Stack

- **React**: 18.3+ with hooks and functional components
- **TypeScript**: 5.6+ for type safety
- **Build Tool**: Vite 6.0+ for fast development and optimized builds
- **Styling**: TailwindCSS 3.4+ for utility-first CSS
- **Web3 Integration**:
  - RainbowKit 2.0+ for wallet connection UI
  - Wagmi 2.0+ for Ethereum interactions
  - Viem 2.0+ for Ethereum utilities
- **HTTP Client**: Axios 1.6+ for API requests
- **Charts**: Recharts 2.10+ for data visualization
- **Icons**: Lucide React 0.303+ for modern icons
- **State Management**: React Query (TanStack Query) 5.17+

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Backend API running (see [Backend README](../backend/README.md))

### Installation

```bash
# Navigate to frontend directory
cd packages/frontend

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Environment Variables

Create a `.env` file in `packages/frontend/`:

```env
# API Configuration
VITE_API_URL=http://localhost:3001
VITE_API_TIMEOUT=30000

# Blockchain Configuration
VITE_CHAIN_ID=80001
VITE_SECURITY_ORACLE_ADDRESS=0x...

# WalletConnect Project ID (required for RainbowKit)
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Optional: Analytics
VITE_GA_TRACKING_ID=
```

> **Note**: Get your WalletConnect Project ID at [WalletConnect Cloud](https://cloud.walletconnect.com/)

### Development

```bash
# Start development server with hot reload
npm run dev

# Access the app at http://localhost:5173
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# The build output will be in the `dist/` directory
```

## 🎯 Key Features

### 1. Wallet Connection

- **Multi-Wallet Support**: MetaMask, WalletConnect, Coinbase Wallet, and more
- **Chain Switching**: Automatic prompts for network switching
- **Account Management**: Easy account switching and disconnection
- **Mobile Friendly**: QR code scanning for mobile wallets

### 2. Contract Scanner

- **Address Input**: Ethereum address validation
- **Real-Time Scanning**: Live vulnerability detection
- **Results Display**: Detailed vulnerability breakdown
- **Export Options**: Download audit reports

### 3. Vulnerability Dashboard

- **Severity Categorization**: Critical, High, Medium, Low
- **Interactive Charts**: Visual representation of security metrics
- **Historical Data**: Track audit history over time
- **Filtering**: Filter by type, severity, and status

### 4. Security Metrics

- **Safety Score**: Overall contract security rating
- **Risk Assessment**: Detailed risk analysis
- **Statistics**: Real-time platform statistics
- **Trending Issues**: Most common vulnerabilities

## 📦 Component Structure

### Main Components

#### Dashboard

The main layout component that provides the application structure.

```tsx
import { Dashboard } from './components/Dashboard';

<Dashboard>
  {/* Child components */}
</Dashboard>
```

**Features**:
- Responsive header with wallet connection
- Navigation menu
- Footer with links
- Mobile-friendly sidebar

#### ContractScanner

Component for scanning smart contract addresses.

```tsx
import { ContractScanner } from './components/ContractScanner';

<ContractScanner 
  onScanComplete={(results) => console.log(results)}
/>
```

**Props**:
- `onScanComplete`: Callback function when scan finishes
- `defaultAddress`: Pre-populate address field

**Features**:
- Address validation
- Loading states
- Error handling
- ENS name resolution (future)

#### VulnerabilityList

Display list of vulnerabilities with details.

```tsx
import { VulnerabilityList } from './components/VulnerabilityList';

<VulnerabilityList 
  vulnerabilities={vulnerabilities}
  onVulnerabilityClick={(vuln) => console.log(vuln)}
/>
```

**Props**:
- `vulnerabilities`: Array of vulnerability objects
- `onVulnerabilityClick`: Handle vulnerability selection
- `showFilters`: Toggle filter UI

#### Web3Provider

Wrapper component for Web3 configuration.

```tsx
import { Web3Provider } from './components/Web3Provider';

<Web3Provider>
  <App />
</Web3Provider>
```

Configures:
- RainbowKit theme and chains
- Wagmi client
- React Query client

## 🎨 Styling & Theming

### TailwindCSS Configuration

The project uses TailwindCSS with custom configuration in `tailwind.config.js`:

```javascript
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          // ... custom color palette
        },
      },
    },
  },
  plugins: [],
};
```

### Custom Theme

You can customize the theme by editing the Tailwind configuration or creating custom CSS:

```css
/* src/index.css */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #8b5cf6;
  --danger-color: #ef4444;
  --success-color: #10b981;
}
```

### Dark Mode

Dark mode is supported via TailwindCSS:

```tsx
// Toggle dark mode
<html className="dark">
  {/* App content */}
</html>
```

## 🔌 API Integration

### Axios Configuration

API calls are centralized using Axios:

```typescript
// src/utils/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

### API Usage Example

```typescript
import api from './utils/api';

// Scan contract
const scanContract = async (address: string) => {
  const response = await api.post('/api/audits/scan', {
    contractAddress: address,
  });
  return response.data;
};

// Get vulnerabilities
const getVulnerabilities = async (address: string) => {
  const response = await api.get(`/api/contracts/${address}/vulnerabilities`);
  return response.data;
};
```

## 🪝 Custom Hooks

### useContractScan

Hook for scanning contracts:

```typescript
import { useContractScan } from './hooks/useContractScan';

function Component() {
  const { scan, loading, error, results } = useContractScan();

  const handleScan = async () => {
    await scan('0x1234...');
  };

  return (
    <div>
      {loading && <p>Scanning...</p>}
      {error && <p>Error: {error}</p>}
      {results && <VulnerabilityList vulnerabilities={results} />}
    </div>
  );
}
```

### useSecurityOracle

Hook for interacting with SecurityOracle contract:

```typescript
import { useSecurityOracle } from './hooks/useSecurityOracle';

function Component() {
  const { isContractSafe, getVulnerabilities } = useSecurityOracle();

  const checkSafety = async (address: string) => {
    const safe = await isContractSafe(address);
    console.log('Is safe:', safe);
  };

  return <button onClick={() => checkSafety('0x...')}>Check Safety</button>;
}
```

## 🔐 Web3 Integration

### Wallet Connection

RainbowKit provides easy wallet connection:

```tsx
import { ConnectButton } from '@rainbow-me/rainbowkit';

function Header() {
  return (
    <header>
      <ConnectButton />
    </header>
  );
}
```

### Using Wagmi Hooks

```typescript
import { useAccount, useBalance, useContractRead } from 'wagmi';

function WalletInfo() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });

  if (!isConnected) return <p>Please connect wallet</p>;

  return (
    <div>
      <p>Address: {address}</p>
      <p>Balance: {balance?.formatted} {balance?.symbol}</p>
    </div>
  );
}
```

### Contract Interactions

```typescript
import { useContractWrite, useWaitForTransaction } from 'wagmi';
import SecurityOracleABI from './abis/SecurityOracle.json';

function ReportVulnerability() {
  const { write, data } = useContractWrite({
    address: '0x...',
    abi: SecurityOracleABI,
    functionName: 'reportVulnerability',
  });

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
  });

  return (
    <button 
      onClick={() => write({
        args: [contractAddress, type, severity, description]
      })}
      disabled={isLoading}
    >
      {isLoading ? 'Reporting...' : 'Report Vulnerability'}
    </button>
  );
}
```

## 📊 State Management

React Query is used for server state management:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch data
const { data, isLoading, error } = useQuery({
  queryKey: ['contract', address],
  queryFn: () => fetchContractData(address),
});

// Mutate data
const mutation = useMutation({
  mutationFn: scanContract,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['audits'] });
  },
});
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Test Example

```typescript
import { render, screen } from '@testing-library/react';
import { ContractScanner } from './ContractScanner';

describe('ContractScanner', () => {
  it('renders input field', () => {
    render(<ContractScanner />);
    const input = screen.getByPlaceholderText(/contract address/i);
    expect(input).toBeInTheDocument();
  });
});
```

## 🚢 Deployment

### Static Hosting (Recommended)

Deploy to Vercel, Netlify, or similar:

```bash
# Build
npm run build

# Deploy dist/ directory
```

### Docker

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Variables (Production)

Ensure production environment variables are set:

```env
VITE_API_URL=https://api.blocksecure.chain
VITE_WALLETCONNECT_PROJECT_ID=your_prod_project_id
```

## 🎯 Best Practices

1. **Code Organization**: Keep components small and focused
2. **Type Safety**: Use TypeScript for all components
3. **Error Handling**: Implement proper error boundaries
4. **Loading States**: Show loading indicators for async operations
5. **Accessibility**: Use semantic HTML and ARIA labels
6. **Performance**: Lazy load components and optimize images
7. **Security**: Never expose private keys or sensitive data

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [RainbowKit Documentation](https://www.rainbowkit.com/)
- [Wagmi Documentation](https://wagmi.sh/)
- [TailwindCSS Documentation](https://tailwindcss.com/)

## 📄 License

MIT License - See [LICENSE](../../LICENSE) for details.
