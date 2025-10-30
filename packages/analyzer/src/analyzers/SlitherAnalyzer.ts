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

export class SlitherAnalyzer implements IAnalyzer {
  name = "Slither";

  async isAvailable(): Promise<boolean> {
    try {
      await execAsync("slither --version");
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
      throw new Error("Slither is not installed. Install with: pip3 install slither-analyzer");
    }

    try {
      const { stdout } = await execAsync(
        `slither ${contractPath} --json -`,
        {
          timeout: config?.timeout || 120000,
        }
      );

      const slitherOutput = JSON.parse(stdout);
      const vulnerabilities = this.parseSlitherOutput(slitherOutput);

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
      throw new Error(`Slither analysis failed: ${error.message}`);
    }
  }

  private parseSlitherOutput(output: any): Vulnerability[] {
    const vulnerabilities: Vulnerability[] = [];

    if (!output.results || !output.results.detectors) {
      return vulnerabilities;
    }

    for (const detector of output.results.detectors) {
      const vulnerability: Vulnerability = {
        type: this.mapDetectorToType(detector.check),
        severity: this.mapSeverity(detector.impact),
        title: detector.check,
        description: detector.description,
        recommendation: detector.recommendation || this.getRecommendation(detector.check),
        references: detector.wiki_url ? [detector.wiki_url] : [],
      };

      // Extract location information
      if (detector.elements && detector.elements.length > 0) {
        const element = detector.elements[0];
        if (element.source_mapping) {
          vulnerability.file = element.source_mapping.filename_relative;
          vulnerability.line = element.source_mapping.lines?.[0];
        }
      }

      vulnerabilities.push(vulnerability);
    }

    return vulnerabilities;
  }

  private mapDetectorToType(detector: string): VulnerabilityType {
    const mapping: Record<string, VulnerabilityType> = {
      "reentrancy-eth": VulnerabilityType.REENTRANCY,
      "reentrancy-no-eth": VulnerabilityType.REENTRANCY,
      "reentrancy-benign": VulnerabilityType.REENTRANCY,
      "controlled-delegatecall": VulnerabilityType.DELEGATECALL,
      "tx-origin": VulnerabilityType.TX_ORIGIN,
      "timestamp": VulnerabilityType.TIMESTAMP_DEPENDENCY,
      "unchecked-lowlevel": VulnerabilityType.UNCHECKED_CALL,
      "unchecked-send": VulnerabilityType.UNCHECKED_CALL,
      "suicidal": VulnerabilityType.ACCESS_CONTROL,
      "arbitrary-send": VulnerabilityType.ACCESS_CONTROL,
      "uninitialized-storage": VulnerabilityType.UNINITIALIZED_STORAGE,
      "weak-prng": VulnerabilityType.WEAK_RANDOMNESS,
    };

    return mapping[detector] || VulnerabilityType.ACCESS_CONTROL;
  }

  private mapSeverity(impact: string): Severity {
    const mapping: Record<string, Severity> = {
      High: Severity.CRITICAL,
      Medium: Severity.HIGH,
      Low: Severity.MEDIUM,
      Informational: Severity.INFORMATIONAL,
      Optimization: Severity.INFORMATIONAL,
    };

    return mapping[impact] || Severity.LOW;
  }

  private getRecommendation(detector: string): string {
    const recommendations: Record<string, string> = {
      "reentrancy-eth": "Use the Checks-Effects-Interactions pattern or ReentrancyGuard from OpenZeppelin",
      "controlled-delegatecall": "Avoid using delegatecall with user-controlled addresses",
      "tx-origin": "Use msg.sender instead of tx.origin for authorization",
      "timestamp": "Avoid using block.timestamp for critical logic; use block.number if needed",
      "unchecked-lowlevel": "Always check the return value of low-level calls",
      "suicidal": "Implement proper access control for selfdestruct",
      "weak-prng": "Use Chainlink VRF or similar oracle for secure randomness",
    };

    return recommendations[detector] || "Review and fix the detected issue";
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
