import { useState } from 'react';
import { Search, AlertCircle, Loader2 } from 'lucide-react';
import { contractAPI } from '../../services/api';

interface ContractScannerProps {
  onScanComplete?: (address: string) => void;
}

export function ContractScanner({ onScanComplete }: ContractScannerProps) {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleScan = async () => {
    if (!address || !address.startsWith('0x')) {
      setError('Please enter a valid contract address');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const safetyResponse = await contractAPI.isContractSafe(address);
      const reportResponse = await contractAPI.getAuditReport(address);
      
      setResult({
        safety: safetyResponse.data,
        report: reportResponse.data,
      });

      if (onScanComplete) {
        onScanComplete(address);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to scan contract');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <Search className="w-6 h-6 text-cyan-400" />
        Contract Scanner
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Contract Address
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x..."
              className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              disabled={loading}
            />
            <button
              onClick={handleScan}
              disabled={loading || !address}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Scan
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-4 bg-red-900/20 border border-red-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4 pt-4 border-t border-slate-700">
            {/* Safety Status */}
            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg">
              <span className="text-slate-300 font-medium">Safety Status:</span>
              <span
                className={clsx(
                  'px-3 py-1 rounded-full text-sm font-bold',
                  result.safety.isSafe
                    ? 'bg-green-900/30 text-green-400 border border-green-800'
                    : 'bg-red-900/30 text-red-400 border border-red-800'
                )}
              >
                {result.safety.isSafe ? '✓ SAFE' : '✗ UNSAFE'}
              </span>
            </div>

            {/* Audit Report Summary */}
            {result.report && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  label="Total Vulnerabilities"
                  value={result.report.totalVulnerabilities}
                  color="slate"
                />
                <StatCard
                  label="Critical"
                  value={result.report.criticalCount}
                  color="red"
                />
                <StatCard
                  label="High"
                  value={result.report.highCount}
                  color="orange"
                />
                <StatCard
                  label="Medium"
                  value={result.report.mediumCount}
                  color="yellow"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  color: 'slate' | 'red' | 'orange' | 'yellow';
}

function StatCard({ label, value, color }: StatCardProps) {
  const colorClasses = {
    slate: 'bg-slate-900 border-slate-700',
    red: 'bg-red-900/20 border-red-800',
    orange: 'bg-orange-900/20 border-orange-800',
    yellow: 'bg-yellow-900/20 border-yellow-800',
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <p className="text-slate-400 text-sm mb-1">{label}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
    </div>
  );
}

function clsx(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
