#!/usr/bin/env node

import { program } from "commander";
import chalk from "chalk";
import ora from "ora";
import { VulnerabilityAnalyzer } from "./index";
import { AnalysisResult, Severity } from "./types";

program
  .name("blocksecure-analyze")
  .description("Smart contract vulnerability analyzer")
  .version("1.0.0");

program
  .command("scan <contractPath>")
  .description("Scan a smart contract for vulnerabilities")
  .option("-t, --timeout <ms>", "Analysis timeout in milliseconds", "120000")
  .option("-e, --exclude-informational", "Exclude informational findings")
  .option("-j, --json", "Output results as JSON")
  .action(async (contractPath, options) => {
    const spinner = ora("Initializing vulnerability scanner...").start();

    try {
      const analyzer = new VulnerabilityAnalyzer();

      // Check availability
      spinner.text = "Checking analyzer availability...";
      const availability = await analyzer.checkAvailability();

      if (!availability.slither) {
        spinner.fail("Slither not found!");
        console.log(
          chalk.yellow(
            "\nPlease install Slither: " +
              chalk.bold("pip3 install slither-analyzer")
          )
        );
        process.exit(1);
      }

      // Run analysis
      spinner.text = `Analyzing ${contractPath}...`;
      const result = await analyzer.getCombinedAnalysis(contractPath, {
        timeout: parseInt(options.timeout),
        excludeInformational: options.excludeInformational,
      });

      spinner.succeed("Analysis complete!");

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        displayResults(result);
      }

      // Exit with error code if vulnerabilities found
      process.exit(result.isSecure ? 0 : 1);
    } catch (error: any) {
      spinner.fail("Analysis failed!");
      console.error(chalk.red(`\nError: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command("check")
  .description("Check which analyzers are available")
  .action(async () => {
    const analyzer = new VulnerabilityAnalyzer();
    const availability = await analyzer.checkAvailability();

    console.log(chalk.bold("\n🔍 Analyzer Availability:\n"));
    console.log(
      `  Slither: ${availability.slither ? chalk.green("✓ Available") : chalk.red("✗ Not available")}`
    );
    console.log();
  });

function displayResults(result: AnalysisResult) {
  console.log("\n" + "=".repeat(60));
  console.log(chalk.bold.cyan(`📊 Security Analysis Report`));
  console.log("=".repeat(60));

  console.log(`\n${chalk.bold("Contract:")} ${result.contractName}`);
  console.log(`${chalk.bold("Path:")} ${result.contractPath}`);
  console.log(`${chalk.bold("Analyzer:")} ${result.analyzer}`);
  console.log(`${chalk.bold("Timestamp:")} ${result.timestamp.toISOString()}`);
  console.log(
    `${chalk.bold("Execution Time:")} ${result.executionTime}ms`
  );

  // Summary
  console.log(`\n${chalk.bold("Summary:")}`);
  console.log(`  Total Vulnerabilities: ${result.summary.total}`);
  console.log(
    `  ${chalk.red.bold("Critical:")} ${result.summary.critical}`
  );
  console.log(`  ${chalk.red("High:")} ${result.summary.high}`);
  console.log(`  ${chalk.yellow("Medium:")} ${result.summary.medium}`);
  console.log(`  ${chalk.blue("Low:")} ${result.summary.low}`);
  console.log(
    `  ${chalk.gray("Informational:")} ${result.summary.informational}`
  );

  // Security Status
  console.log(
    `\n${chalk.bold("Security Status:")} ${
      result.isSecure
        ? chalk.green.bold("✓ SECURE")
        : chalk.red.bold("✗ VULNERABLE")
    }`
  );

  // Detailed vulnerabilities
  if (result.vulnerabilities.length > 0) {
    console.log(`\n${chalk.bold("Vulnerabilities Found:")}\n`);

    result.vulnerabilities.forEach((vuln, index) => {
      const severityColor = getSeverityColor(vuln.severity);
      console.log(`${index + 1}. ${severityColor(vuln.severity)} - ${chalk.bold(vuln.title)}`);
      console.log(`   ${chalk.gray("Type:")} ${vuln.type}`);
      if (vuln.file) {
        console.log(
          `   ${chalk.gray("Location:")} ${vuln.file}${vuln.line ? `:${vuln.line}` : ""}`
        );
      }
      console.log(`   ${chalk.gray("Description:")} ${vuln.description}`);
      if (vuln.recommendation) {
        console.log(
          `   ${chalk.gray("Recommendation:")} ${vuln.recommendation}`
        );
      }
      if (vuln.references && vuln.references.length > 0) {
        console.log(
          `   ${chalk.gray("References:")} ${vuln.references.join(", ")}`
        );
      }
      console.log();
    });
  }

  console.log("=".repeat(60) + "\n");
}

function getSeverityColor(severity: Severity) {
  switch (severity) {
    case Severity.CRITICAL:
      return chalk.red.bold;
    case Severity.HIGH:
      return chalk.red;
    case Severity.MEDIUM:
      return chalk.yellow;
    case Severity.LOW:
      return chalk.blue;
    case Severity.INFORMATIONAL:
      return chalk.gray;
    default:
      return chalk.white;
  }
}

program.parse();
