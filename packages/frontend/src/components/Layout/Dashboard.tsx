import { ReactNode } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Shield } from 'lucide-react';

interface DashboardProps {
  children: ReactNode;
}

export function Dashboard({ children }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-cyan-400" />
              <div>
                <h1 className="text-xl font-bold text-white">BlockSecure Chain</h1>
                <p className="text-xs text-slate-400">Smart Contract Security Platform</p>
              </div>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-slate-400 text-sm">
            <p>BlockSecure Chain © {new Date().getFullYear()}</p>
            <p className="mt-1">Automated Smart Contract Vulnerability Detection</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
