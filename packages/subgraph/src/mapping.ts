import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  VulnerabilityReported,
  VulnerabilityVerified,
  VulnerabilityResolved,
  AuditReportSubmitted,
  ContractBlacklisted,
  ContractWhitelisted,
} from "../generated/SecurityOracle/SecurityOracle";
import { Vulnerability, AuditReport, Contract } from "../generated/schema";

export function handleVulnerabilityReported(
  event: VulnerabilityReported
): void {
  let vulnerability = new Vulnerability(
    event.params.vulnerabilityId.toString()
  );

  vulnerability.vulnerabilityId = event.params.vulnerabilityId;
  vulnerability.contractAddress = event.params.contractAddress;
  vulnerability.vulnType = event.params.vulnType;
  vulnerability.severity = event.params.severity;
  vulnerability.reporter = event.params.reporter;
  vulnerability.timestamp = event.block.timestamp;
  vulnerability.verified = false;
  vulnerability.resolved = false;

  // Create or update contract entity
  let contract = Contract.load(event.params.contractAddress.toHexString());
  if (contract == null) {
    contract = new Contract(event.params.contractAddress.toHexString());
    contract.address = event.params.contractAddress;
    contract.isBlacklisted = false;
    contract.save();
  }

  vulnerability.contract = contract.id;
  vulnerability.save();
}

export function handleVulnerabilityVerified(
  event: VulnerabilityVerified
): void {
  let vulnerability = Vulnerability.load(
    event.params.vulnerabilityId.toString()
  );

  if (vulnerability != null) {
    vulnerability.verified = true;
    vulnerability.verifier = event.params.verifier;
    vulnerability.save();
  }
}

export function handleVulnerabilityResolved(
  event: VulnerabilityResolved
): void {
  let vulnerability = Vulnerability.load(
    event.params.vulnerabilityId.toString()
  );

  if (vulnerability != null) {
    vulnerability.resolved = true;
    vulnerability.resolver = event.params.resolver;
    vulnerability.save();
  }
}

export function handleAuditReportSubmitted(
  event: AuditReportSubmitted
): void {
  // Create unique ID using contract address and timestamp
  let reportId =
    event.params.contractAddress.toHexString() +
    "-" +
    event.block.timestamp.toString();

  let auditReport = new AuditReport(reportId);

  auditReport.contractAddress = event.params.contractAddress;
  auditReport.auditor = event.params.auditor;
  auditReport.isSecure = event.params.isSecure;
  auditReport.timestamp = event.block.timestamp;

  // Note: The event doesn't contain vulnerability counts,
  // so we'd need to call the contract to get them
  // For now, we set them to 0 and they can be updated separately
  auditReport.totalVulnerabilities = BigInt.fromI32(0);
  auditReport.criticalCount = BigInt.fromI32(0);
  auditReport.highCount = BigInt.fromI32(0);
  auditReport.mediumCount = BigInt.fromI32(0);
  auditReport.lowCount = BigInt.fromI32(0);

  // Create or update contract entity
  let contract = Contract.load(event.params.contractAddress.toHexString());
  if (contract == null) {
    contract = new Contract(event.params.contractAddress.toHexString());
    contract.address = event.params.contractAddress;
    contract.isBlacklisted = false;
    contract.save();
  }

  auditReport.contract = contract.id;
  auditReport.save();
}

export function handleContractBlacklisted(event: ContractBlacklisted): void {
  let contract = Contract.load(event.params.contractAddress.toHexString());

  if (contract == null) {
    contract = new Contract(event.params.contractAddress.toHexString());
    contract.address = event.params.contractAddress;
  }

  contract.isBlacklisted = true;
  contract.blacklistReason = event.params.reason;
  contract.blacklistedAt = event.block.timestamp;
  contract.save();
}

export function handleContractWhitelisted(event: ContractWhitelisted): void {
  let contract = Contract.load(event.params.contractAddress.toHexString());

  if (contract == null) {
    contract = new Contract(event.params.contractAddress.toHexString());
    contract.address = event.params.contractAddress;
  }

  contract.isBlacklisted = false;
  contract.whitelistedAt = event.block.timestamp;
  contract.save();
}
