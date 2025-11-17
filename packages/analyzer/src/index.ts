import { SlitherAnalyzer } from "./analyzers/SlitherAnalyzer";
import { MythrilAnalyzer } from "./analyzers/MythrilAnalyzer";
import { AnalysisResult, AnalyzerConfig } from "./types";

export * from "./types";
export * from "./analyzers/SlitherAnalyzer";
export * from "./analyzers/MythrilAnalyzer";

export class VulnerabilityAnalyzer {
  private slither: SlitherAnalyzer;
  private mythril: MythrilAnalyzer;

  constructor() {
    this.slither = new SlitherAnalyzer();
    this.mythril = new MythrilAnalyzer();
  }

  /**
   * Run all available analyzers on a contract
   */
  async analyzeContract(
    contractPath: string,
    config?: AnalyzerConfig
  ): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];

    // Run Slither if available
    if (await this.slither.isAvailable()) {
      try {
        const slitherResult = await this.slither.analyze(contractPath, config);
        results.push(slitherResult);
      } catch (error: any) {
        console.error(`Slither analysis failed: ${error.message}`);
      }
    }

    // Run Mythril if available
    if (await this.mythril.isAvailable()) {
      try {
        const mythrilResult = await this.mythril.analyze(contractPath, config);
        results.push(mythrilResult);
      } catch (error: any) {
        console.error(`Mythril analysis failed: ${error.message}`);
      }
    }

    if (results.length === 0) {
      throw new Error(
        "No analyzers available. Please install Slither (pip3 install slither-analyzer) or Mythril (pip3 install mythril)"
      );
    }

    return results;
  }

  /**
   * Get combined analysis from all analyzers
   */
  async getCombinedAnalysis(
    contractPath: string,
    config?: AnalyzerConfig
  ): Promise<AnalysisResult> {
    const results = await this.analyzeContract(contractPath, config);

    // Combine results from all analyzers
    const allVulnerabilities = results.flatMap((r) => r.vulnerabilities);

    // Remove duplicates based on type and description
    const uniqueVulnerabilities = Array.from(
      new Map(
        allVulnerabilities.map((v) => [
          `${v.type}-${v.description}`,
          v,
        ])
      ).values()
    );

    const summary = {
      total: uniqueVulnerabilities.length,
      critical: uniqueVulnerabilities.filter((v) => v.severity === "CRITICAL").length,
      high: uniqueVulnerabilities.filter((v) => v.severity === "HIGH").length,
      medium: uniqueVulnerabilities.filter((v) => v.severity === "MEDIUM").length,
      low: uniqueVulnerabilities.filter((v) => v.severity === "LOW").length,
      informational: uniqueVulnerabilities.filter((v) => v.severity === "INFORMATIONAL")
        .length,
    };

    return {
      contractPath,
      contractName: results[0].contractName,
      analyzer: "Combined",
      timestamp: new Date(),
      vulnerabilities: uniqueVulnerabilities,
      summary,
      isSecure: summary.critical === 0 && summary.high === 0,
      executionTime: results.reduce((sum, r) => sum + r.executionTime, 0),
    };
  }

  /**
   * Check analyzer availability
   */
  async checkAvailability() {
    return {
      slither: await this.slither.isAvailable(),
      mythril: await this.mythril.isAvailable(),
    };
  }
}
