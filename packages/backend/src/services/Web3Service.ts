import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const SECURITY_ORACLE_ABI = [
  "function isContractSafe(address _contractAddress) external view returns (bool)",
  "function getContractVulnerabilities(address _contractAddress) external view returns (uint256[] memory)",
  "function getLatestAuditReport(address _contractAddress) external view returns (tuple(address contractAddress, uint256 totalVulnerabilities, uint256 criticalCount, uint256 highCount, uint256 mediumCount, uint256 lowCount, bool isSecure, uint256 timestamp, address auditor))",
  "function vulnerabilities(uint256) external view returns (address contractAddress, uint8 vulnType, uint8 severity, string description, uint256 timestamp, address reporter, bool verified, bool resolved)",
];

export class Web3Service {
  private provider: ethers.Provider;
  private securityOracle: ethers.Contract | null = null;

  constructor() {
    const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    const oracleAddress = process.env.SECURITY_ORACLE_ADDRESS;
    if (oracleAddress) {
      this.securityOracle = new ethers.Contract(
        oracleAddress,
        SECURITY_ORACLE_ABI,
        this.provider
      );
    }
  }

  async isContractSafe(contractAddress: string): Promise<boolean> {
    if (!this.securityOracle) {
      throw new Error("Security Oracle contract not configured");
    }

    try {
      const isSafe = await this.securityOracle.isContractSafe(contractAddress);
      return isSafe;
    } catch (error: any) {
      throw new Error(`Failed to check contract safety: ${error.message}`);
    }
  }

  async getContractVulnerabilities(contractAddress: string): Promise<any[]> {
    if (!this.securityOracle) {
      throw new Error("Security Oracle contract not configured");
    }

    try {
      const vulnIds = await this.securityOracle.getContractVulnerabilities(
        contractAddress
      );

      const vulnerabilities = await Promise.all(
        vulnIds.map(async (id: bigint) => {
          const vuln = await this.securityOracle!.vulnerabilities(id);
          return {
            id: id.toString(),
            contractAddress: vuln.contractAddress,
            type: vuln.vulnType,
            severity: vuln.severity,
            description: vuln.description,
            timestamp: new Date(Number(vuln.timestamp) * 1000).toISOString(),
            reporter: vuln.reporter,
            verified: vuln.verified,
            resolved: vuln.resolved,
          };
        })
      );

      return vulnerabilities;
    } catch (error: any) {
      throw new Error(
        `Failed to get contract vulnerabilities: ${error.message}`
      );
    }
  }

  async getLatestAuditReport(contractAddress: string): Promise<any> {
    if (!this.securityOracle) {
      throw new Error("Security Oracle contract not configured");
    }

    try {
      const report = await this.securityOracle.getLatestAuditReport(
        contractAddress
      );

      return {
        contractAddress: report.contractAddress,
        totalVulnerabilities: report.totalVulnerabilities.toString(),
        criticalCount: report.criticalCount.toString(),
        highCount: report.highCount.toString(),
        mediumCount: report.mediumCount.toString(),
        lowCount: report.lowCount.toString(),
        isSecure: report.isSecure,
        timestamp: new Date(Number(report.timestamp) * 1000).toISOString(),
        auditor: report.auditor,
      };
    } catch (error: any) {
      throw new Error(`Failed to get audit report: ${error.message}`);
    }
  }

  async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  async getBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }
}
