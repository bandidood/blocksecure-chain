import { useState } from 'react';
import { Web3Provider } from './providers/Web3Provider';
import { Dashboard } from './components/Layout/Dashboard';
import { ContractScanner } from './components/Scanner/ContractScanner';
import { VulnerabilityList } from './components/Vulnerabilities/VulnerabilityList';
import { contractAPI, Vulnerability } from './services/api';
import { BarChart3, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

function App() {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(false);
  const [scannedAddress, setScannedAddress] = useState<string | null>(null);

  const handleScanComplete = async (address: string) => {
    setLoading(true);
    setScannedAddress(address);

    try {
      const response = await contractAPI.getVulnerabilities(address);
      const vulns = response.data.vulnerabilities.map((v: any) => ({
        type: getVulnTypeName(v.type),
        severity: getSeverityName(v.severity),
        title: getVulnTypeName(v.type),
        description: v.description,
        recommendation: 'Please review and fix this vulnerability',
      }));
      setVulnerabilities(vulns);
    } catch (error) {
      console.error('Failed to fetch vulnerabilities:', error);
      setVulnerabilities([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Web3Provider>
      <Dashboard>
        <div className="space-y-8">
          <div className="text-center py-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-12 h-12 text-cyan-400" />
              <h1 className="text-4xl font-bold text-white">BlockSecure Chain</h1>
            </div>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Real-time smart contract security analysis with on-chain vulnerability tracking
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard icon={<Shield className="w-6 h-6" />} title="Contracts Scanned" value="1,234" color="cyan" />
            <StatsCard icon={<AlertTriangle className="w-6 h-6" />} title="Vulnerabilities Found" value="567" color="red" />
            <StatsCard icon={<CheckCircle className="w-6 h-6" />} title="Secure Contracts" value="89%" color="green" />
          </div>

          <ContractScanner onScanComplete={handleScanComplete} />

          {scannedAddress && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-cyan-400" />
                  Analysis Results
                </h2>
                <span className="text-slate-400 text-sm">
                  Contract: <span className="text-cyan-400 font-mono">{scannedAddress}</span>
                </span>
              </div>

              {loading ? (
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                  <p className="text-slate-400">Loading vulnerabilities...</p>
                </div>
              ) : (
                <VulnerabilityList vulnerabilities={vulnerabilities} />
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <FeatureCard title="Automated Scanning" description="Uses Slither and Mythril for comprehensive vulnerability detection" icon="🔍" />
            <FeatureCard title="On-Chain Security Oracle" description="Real-time vulnerability tracking with smart contract integration" icon="⛓️" />
            <FeatureCard title="Real-Time Monitoring" description="The Graph integration for live event indexing and alerts" icon="📊" />
            <FeatureCard title="Multi-Chain Support" description="Works with Ethereum, Polygon, and other EVM-compatible chains" icon="🌐" />
          </div>
        </div>
      </Dashboard>
    </Web3Provider>
  );
}

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: 'cyan' | 'red' | 'green';
}

function StatsCard({ icon, title, value, color }: StatsCardProps) {
  const colorClasses = {
    cyan: 'text-cyan-400 bg-cyan-900/20 border-cyan-800',
    red: 'text-red-400 bg-red-900/20 border-red-800',
    green: 'text-green-400 bg-green-900/20 border-green-800',
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-4`}>
        {icon}
      </div>
      <p className="text-slate-400 text-sm mb-1">{title}</p>
      <p className="text-white text-3xl font-bold">{value}</p>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:border-cyan-700 transition-colors">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  );
}

function getVulnTypeName(type: number): string {
  const types = ['REENTRANCY', 'INTEGER_OVERFLOW', 'ACCESS_CONTROL', 'FRONT_RUNNING', 'TIMESTAMP_DEPENDENCY', 'UNCHECKED_CALL', 'DELEGATECALL', 'TX_ORIGIN'];
  return types[type] || 'UNKNOWN';
}

function getSeverityName(severity: number): string {
  const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  return severities[severity] || 'UNKNOWN';
}

export default App;
