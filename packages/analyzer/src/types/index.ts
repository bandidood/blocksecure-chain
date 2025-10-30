export enum VulnerabilityType {
  REENTRANCY = "REENTRANCY",
  INTEGER_OVERFLOW = "INTEGER_OVERFLOW",
  INTEGER_UNDERFLOW = "INTEGER_UNDERFLOW",
  ACCESS_CONTROL = "ACCESS_CONTROL",
  FRONT_RUNNING = "FRONT_RUNNING",
  TIMESTAMP_DEPENDENCY = "TIMESTAMP_DEPENDENCY",
  UNCHECKED_CALL = "UNCHECKED_CALL",
  DELEGATECALL = "DELEGATECALL",
  TX_ORIGIN = "TX_ORIGIN",
  UNINITIALIZED_STORAGE = "UNINITIALIZED_STORAGE",
  DENIAL_OF_SERVICE = "DENIAL_OF_SERVICE",
  WEAK_RANDOMNESS = "WEAK_RANDOMNESS",
}

export enum Severity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
  INFORMATIONAL = "INFORMATIONAL",
}

export interface Vulnerability {
  type: VulnerabilityType;
  severity: Severity;
  title: string;
  description: string;
  file?: string;
  line?: number;
  column?: number;
  code?: string;
  recommendation?: string;
  references?: string[];
}

export interface AnalysisResult {
  contractPath: string;
  contractName: string;
  analyzer: string;
  timestamp: Date;
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

export interface AnalyzerConfig {
  slitherPath?: string;
  mythrilPath?: string;
  timeout?: number;
  excludeInformational?: boolean;
  detectors?: string[];
}

export interface IAnalyzer {
  name: string;
  analyze(contractPath: string, config?: AnalyzerConfig): Promise<AnalysisResult>;
  isAvailable(): Promise<boolean>;
}
