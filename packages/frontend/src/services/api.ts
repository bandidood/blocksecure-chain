import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ScanRequest {
  contractPath: string;
  contractAddress?: string;
}

export interface Vulnerability {
  type: string;
  severity: string;
  title: string;
  description: string;
  file?: string;
  line?: number;
  recommendation?: string;
  references?: string[];
}

export interface AnalysisResult {
  contractPath: string;
  contractName: string;
  analyzer: string;
  timestamp: string;
  vulnerabilities: Vulnerability[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
  };
  isSecure: boolean;
  executionTime: number;
}

export interface ContractSafetyResponse {
  success: boolean;
  data: {
    contractAddress: string;
    isSafe: boolean;
    timestamp: string;
  };
}

export interface AuditReportResponse {
  success: boolean;
  data: {
    contractAddress: string;
    totalVulnerabilities: string;
    criticalCount: string;
    highCount: string;
    mediumCount: string;
    lowCount: string;
    isSecure: boolean;
    timestamp: string;
    auditor: string;
  };
}

export const auditAPI = {
  scanContract: async (data: ScanRequest) => {
    const response = await api.post<{ success: boolean; data: AnalysisResult }>(
      '/audits/scan',
      data
    );
    return response.data;
  },

  getAuditById: async (id: string) => {
    const response = await api.get(`/audits/${id}`);
    return response.data;
  },

  getAllAudits: async () => {
    const response = await api.get('/audits');
    return response.data;
  },

  getAuditsByContract: async (address: string) => {
    const response = await api.get(`/audits/contract/${address}`);
    return response.data;
  },
};

export const contractAPI = {
  isContractSafe: async (address: string) => {
    const response = await api.get<ContractSafetyResponse>(
      `/contracts/${address}/safe`
    );
    return response.data;
  },

  getVulnerabilities: async (address: string) => {
    const response = await api.get(`/contracts/${address}/vulnerabilities`);
    return response.data;
  },

  getAuditReport: async (address: string) => {
    const response = await api.get<AuditReportResponse>(
      `/contracts/${address}/audit-report`
    );
    return response.data;
  },
};

export default api;
