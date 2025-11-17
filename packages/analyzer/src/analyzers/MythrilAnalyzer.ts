import { exec } from "child_process";
import { promisify } from "util";
import {
  IAnalyzer,
  AnalysisResult,
  AnalyzerConfig,
  Vulnerability,
  VulnerabilityType,
  Severity,
} from "../types";

const execAsync = promisify(exec);

export class MythrilAnalyzer implements IAnalyzer {
  name = "Mythril";

  async isAvailable(): Promise<boolean> {
    try {
      await execAsync("myth --version");
      return true;
    } catch {
      return false;
    }
  }

  async analyze(
    contractPath: string,
    config?: AnalyzerConfig
  ): Promise<AnalysisResult> {
    const startTime = Date.now();

    if (!(await this.isAvailable())) {
      throw new Error("Mythril is not installed. Install with: pip3 install mythril");
    }

    try {
      const { stdout } = await execAsync(
        `myth analyze ${contractPath} --solv 0.8.0 -o json`,
        {
          timeout: config?.timeout || 300000, // Mythril can be slow, 5min timeout
        }
      );

      const mythrilOutput = JSON.parse(stdout);
      const vulnerabilities = this.parseMythrilOutput(mythrilOutput, contractPath);

      const executionTime = Date.now() - startTime;
      const summary = this.calculateSummary(vulnerabilities);

      return {
        contractPath,
        contractName: this.extractContractName(contractPath),
        analyzer: this.name,
        timestamp: new Date(),
        vulnerabilities: config?.excludeInformational
          ? vulnerabilities.filter((v) => v.severity !== Severity.INFORMATIONAL)
          : vulnerabilities,
        summary,
        isSecure: summary.critical === 0 && summary.high === 0,
        executionTime,
      };
    } catch (error: any) {
      // Mythril might return non-zero exit code even with valid output
      if (error.stdout) {
        try {
          const mythrilOutput = JSON.parse(error.stdout);
          const vulnerabilities = this.parseMythrilOutput(mythrilOutput, contractPath);
          const executionTime = Date.now() - startTime;
          const summary = this.calculateSummary(vulnerabilities);

          return {
            contractPath,
            contractName: this.extractContractName(contractPath),
            analyzer: this.name,
            timestamp: new Date(),
            vulnerabilities: config?.excludeInformational
              ? vulnerabilities.filter((v) => v.severity !== Severity.INFORMATIONAL)
              : vulnerabilities,
            summary,
            isSecure: summary.critical === 0 && summary.high === 0,
            executionTime,
          };
        } catch {
          throw new Error(`Mythril analysis failed: ${error.message}`);
        }
      }
      throw new Error(`Mythril analysis failed: ${error.message}`);
    }
  }

  private parseMythrilOutput(output: any, contractPath: string): Vulnerability[] {
    const vulnerabilities: Vulnerability[] = [];

    if (!output.issues || !Array.isArray(output.issues)) {
      return vulnerabilities;
    }

    for (const issue of output.issues) {
      const vulnerability: Vulnerability = {
        type: this.mapIssueToType(issue.swcID, issue.title),
        severity: this.mapSeverity(issue.severity),
        title: issue.title,
        description: issue.description.head || issue.description,
        recommendation: this.getRecommendation(issue.swcID),
        references: issue.swcID ? [`https://swcregistry.io/docs/SWC-${issue.swcID}`] : [],
      };

      // Extract location information
      if (issue.sourceMap) {
        const sourceMap = issue.sourceMap;
        vulnerability.file = sourceMap.file || contractPath;
        vulnerability.line = sourceMap.start ? parseInt(sourceMap.start) : undefined;
      }

      vulnerabilities.push(vulnerability);
    }

    return vulnerabilities;
  }

  private mapIssueToType(swcID: string, title: string): VulnerabilityType {
    // Map based on SWC ID first
    const swcMapping: Record<string, VulnerabilityType> = {
      "107": VulnerabilityType.REENTRANCY, // Reentrancy
      "116": VulnerabilityType.TIMESTAMP_DEPENDENCY, // Timestamp Dependence
      "115": VulnerabilityType.TX_ORIGIN, // Authorization through tx.origin
      "112": VulnerabilityType.DELEGATECALL, // Delegatecall to Untrusted Callee
      "105": VulnerabilityType.ACCESS_CONTROL, // Unprotected Ether Withdrawal
      "106": VulnerabilityType.ACCESS_CONTROL, // Unprotected SELFDESTRUCT
      "101": VulnerabilityType.INTEGER_OVERFLOW, // Integer Overflow
      "113": VulnerabilityType.DOS, // DoS with Failed Call
      "114": VulnerabilityType.TX_ORIGIN, // Transaction Order Dependence
      "120": VulnerabilityType.WEAK_RANDOMNESS, // Weak Sources of Randomness
      "104": VulnerabilityType.UNCHECKED_CALL, // Unchecked Call Return Value
    };

    if (swcID && swcMapping[swcID]) {
      return swcMapping[swcID];
    }

    // Fallback to title-based mapping
    const titleLower = title.toLowerCase();
    if (titleLower.includes("reentrancy")) return VulnerabilityType.REENTRANCY;
    if (titleLower.includes("timestamp")) return VulnerabilityType.TIMESTAMP_DEPENDENCY;
    if (titleLower.includes("tx.origin")) return VulnerabilityType.TX_ORIGIN;
    if (titleLower.includes("delegatecall")) return VulnerabilityType.DELEGATECALL;
    if (titleLower.includes("overflow") || titleLower.includes("underflow"))
      return VulnerabilityType.INTEGER_OVERFLOW;
    if (titleLower.includes("access control")) return VulnerabilityType.ACCESS_CONTROL;
    if (titleLower.includes("randomness")) return VulnerabilityType.WEAK_RANDOMNESS;

    return VulnerabilityType.ACCESS_CONTROL;
  }

  private mapSeverity(severity: string): Severity {
    const severityLower = severity.toLowerCase();

    const mapping: Record<string, Severity> = {
      "high": Severity.CRITICAL,
      "medium": Severity.HIGH,
      "low": Severity.MEDIUM,
      "informational": Severity.INFORMATIONAL,
    };

    return mapping[severityLower] || Severity.LOW;
  }

  private getRecommendation(swcID: string): string {
    const recommendations: Record<string, string> = {
      "107": "Use the Checks-Effects-Interactions pattern and consider using ReentrancyGuard",
      "116": "Avoid using block.timestamp for critical logic. Use block.number where appropriate",
      "115": "Use msg.sender instead of tx.origin for authorization checks",
      "112": "Avoid delegatecall to untrusted contracts. Implement strict access controls",
      "105": "Implement proper access control mechanisms for withdrawal functions",
      "106": "Restrict access to selfdestruct using access control modifiers",
      "101": "Use SafeMath library or Solidity 0.8+ built-in overflow protection",
      "113": "Handle failed calls properly and avoid state changes after external calls",
      "114": "Minimize reliance on transaction ordering. Consider commit-reveal schemes",
      "120": "Use Chainlink VRF or similar oracle for secure on-chain randomness",
      "104": "Always check return values of low-level calls (call, delegatecall, staticcall)",
    };

    return recommendations[swcID] || "Review the vulnerability and apply appropriate security measures";
  }

  private calculateSummary(vulnerabilities: Vulnerability[]) {
    return {
      total: vulnerabilities.length,
      critical: vulnerabilities.filter((v) => v.severity === Severity.CRITICAL).length,
      high: vulnerabilities.filter((v) => v.severity === Severity.HIGH).length,
      medium: vulnerabilities.filter((v) => v.severity === Severity.MEDIUM).length,
      low: vulnerabilities.filter((v) => v.severity === Severity.LOW).length,
      informational: vulnerabilities.filter((v) => v.severity === Severity.INFORMATIONAL).length,
    };
  }

  private extractContractName(path: string): string {
    const parts = path.split(/[/\\]/);
    const filename = parts[parts.length - 1];
    return filename.replace(".sol", "");
  }
}
