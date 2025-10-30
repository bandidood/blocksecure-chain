const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("SecurityOracle", function () {
  // Fixture for deploying the contract
  async function deploySecurityOracleFixture() {
    const [owner, auditor, reporter, addr1, addr2] = await ethers.getSigners();

    const SecurityOracle = await ethers.getContractFactory("SecurityOracle");
    const securityOracle = await SecurityOracle.deploy();

    // Grant roles
    const AUDITOR_ROLE = await securityOracle.AUDITOR_ROLE();
    const REPORTER_ROLE = await securityOracle.REPORTER_ROLE();
    
    await securityOracle.grantRole(AUDITOR_ROLE, auditor.address);
    await securityOracle.grantRole(REPORTER_ROLE, reporter.address);

    return { securityOracle, owner, auditor, reporter, addr1, addr2, AUDITOR_ROLE, REPORTER_ROLE };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { securityOracle, owner } = await loadFixture(deploySecurityOracleFixture);
      const DEFAULT_ADMIN_ROLE = await securityOracle.DEFAULT_ADMIN_ROLE();
      expect(await securityOracle.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("Should grant initial roles to deployer", async function () {
      const { securityOracle, owner, AUDITOR_ROLE, REPORTER_ROLE } = await loadFixture(deploySecurityOracleFixture);
      expect(await securityOracle.hasRole(AUDITOR_ROLE, owner.address)).to.be.true;
      expect(await securityOracle.hasRole(REPORTER_ROLE, owner.address)).to.be.true;
    });

    it("Should initialize with zero vulnerabilities", async function () {
      const { securityOracle } = await loadFixture(deploySecurityOracleFixture);
      expect(await securityOracle.vulnerabilityCount()).to.equal(0);
    });
  });

  describe("Vulnerability Reporting", function () {
    it("Should allow reporter to report a vulnerability", async function () {
      const { securityOracle, reporter, addr1 } = await loadFixture(deploySecurityOracleFixture);
      
      const tx = await securityOracle.connect(reporter).reportVulnerability(
        addr1.address,
        0, // REENTRANCY
        2, // HIGH
        "Reentrancy vulnerability found"
      );

      await expect(tx)
        .to.emit(securityOracle, "VulnerabilityReported")
        .withArgs(0, addr1.address, 0, 2, reporter.address);

      const vuln = await securityOracle.vulnerabilities(0);
      expect(vuln.contractAddress).to.equal(addr1.address);
      expect(vuln.vulnType).to.equal(0);
      expect(vuln.severity).to.equal(2);
      expect(vuln.description).to.equal("Reentrancy vulnerability found");
      expect(vuln.verified).to.be.false;
      expect(vuln.resolved).to.be.false;
    });

    it("Should auto-blacklist contract with critical vulnerability", async function () {
      const { securityOracle, reporter, addr1 } = await loadFixture(deploySecurityOracleFixture);
      
      await securityOracle.connect(reporter).reportVulnerability(
        addr1.address,
        0, // REENTRANCY
        3, // CRITICAL
        "Critical reentrancy vulnerability"
      );

      expect(await securityOracle.blacklistedContracts(addr1.address)).to.be.true;
    });

    it("Should revert if non-reporter tries to report", async function () {
      const { securityOracle, addr1, addr2 } = await loadFixture(deploySecurityOracleFixture);
      
      await expect(
        securityOracle.connect(addr1).reportVulnerability(
          addr2.address,
          0,
          2,
          "Test vulnerability"
        )
      ).to.be.reverted;
    });

    it("Should revert with invalid contract address", async function () {
      const { securityOracle, reporter } = await loadFixture(deploySecurityOracleFixture);
      
      await expect(
        securityOracle.connect(reporter).reportVulnerability(
          ethers.ZeroAddress,
          0,
          2,
          "Test vulnerability"
        )
      ).to.be.revertedWith("Invalid contract address");
    });

    it("Should revert with empty description", async function () {
      const { securityOracle, reporter, addr1 } = await loadFixture(deploySecurityOracleFixture);
      
      await expect(
        securityOracle.connect(reporter).reportVulnerability(
          addr1.address,
          0,
          2,
          ""
        )
      ).to.be.revertedWith("Description required");
    });
  });

  describe("Vulnerability Verification", function () {
    it("Should allow auditor to verify vulnerability", async function () {
      const { securityOracle, reporter, auditor, addr1 } = await loadFixture(deploySecurityOracleFixture);
      
      await securityOracle.connect(reporter).reportVulnerability(
        addr1.address,
        0,
        2,
        "Test vulnerability"
      );

      const tx = await securityOracle.connect(auditor).verifyVulnerability(0);
      
      await expect(tx)
        .to.emit(securityOracle, "VulnerabilityVerified")
        .withArgs(0, auditor.address);

      const vuln = await securityOracle.vulnerabilities(0);
      expect(vuln.verified).to.be.true;
    });

    it("Should revert if non-auditor tries to verify", async function () {
      const { securityOracle, reporter, addr1, addr2 } = await loadFixture(deploySecurityOracleFixture);
      
      await securityOracle.connect(reporter).reportVulnerability(
        addr1.address,
        0,
        2,
        "Test vulnerability"
      );

      await expect(
        securityOracle.connect(addr2).verifyVulnerability(0)
      ).to.be.reverted;
    });

    it("Should revert if vulnerability already verified", async function () {
      const { securityOracle, reporter, auditor, addr1 } = await loadFixture(deploySecurityOracleFixture);
      
      await securityOracle.connect(reporter).reportVulnerability(
        addr1.address,
        0,
        2,
        "Test vulnerability"
      );

      await securityOracle.connect(auditor).verifyVulnerability(0);

      await expect(
        securityOracle.connect(auditor).verifyVulnerability(0)
      ).to.be.revertedWith("Already verified");
    });
  });

  describe("Vulnerability Resolution", function () {
    it("Should allow auditor to resolve verified vulnerability", async function () {
      const { securityOracle, reporter, auditor, addr1 } = await loadFixture(deploySecurityOracleFixture);
      
      await securityOracle.connect(reporter).reportVulnerability(
        addr1.address,
        0,
        2,
        "Test vulnerability"
      );

      await securityOracle.connect(auditor).verifyVulnerability(0);
      
      const tx = await securityOracle.connect(auditor).resolveVulnerability(0);
      
      await expect(tx)
        .to.emit(securityOracle, "VulnerabilityResolved")
        .withArgs(0, auditor.address);

      const vuln = await securityOracle.vulnerabilities(0);
      expect(vuln.resolved).to.be.true;
    });

    it("Should revert if vulnerability not verified", async function () {
      const { securityOracle, reporter, auditor, addr1 } = await loadFixture(deploySecurityOracleFixture);
      
      await securityOracle.connect(reporter).reportVulnerability(
        addr1.address,
        0,
        2,
        "Test vulnerability"
      );

      await expect(
        securityOracle.connect(auditor).resolveVulnerability(0)
      ).to.be.revertedWith("Not verified");
    });

    it("Should revert if already resolved", async function () {
      const { securityOracle, reporter, auditor, addr1 } = await loadFixture(deploySecurityOracleFixture);
      
      await securityOracle.connect(reporter).reportVulnerability(
        addr1.address,
        0,
        2,
        "Test vulnerability"
      );

      await securityOracle.connect(auditor).verifyVulnerability(0);
      await securityOracle.connect(auditor).resolveVulnerability(0);

      await expect(
        securityOracle.connect(auditor).resolveVulnerability(0)
      ).to.be.revertedWith("Already resolved");
    });
  });

  describe("Audit Reports", function () {
    it("Should allow auditor to submit audit report", async function () {
      const { securityOracle, auditor, addr1 } = await loadFixture(deploySecurityOracleFixture);
      
      const tx = await securityOracle.connect(auditor).submitAuditReport(
        addr1.address,
        1, // critical
        2, // high
        3, // medium
        4  // low
      );

      await expect(tx)
        .to.emit(securityOracle, "AuditReportSubmitted")
        .withArgs(addr1.address, auditor.address, false);

      const report = await securityOracle.getLatestAuditReport(addr1.address);
      expect(report.contractAddress).to.equal(addr1.address);
      expect(report.totalVulnerabilities).to.equal(10);
      expect(report.criticalCount).to.equal(1);
      expect(report.highCount).to.equal(2);
      expect(report.mediumCount).to.equal(3);
      expect(report.lowCount).to.equal(4);
      expect(report.isSecure).to.be.false;
    });

    it("Should mark contract as secure with no critical/high vulnerabilities", async function () {
      const { securityOracle, auditor, addr1 } = await loadFixture(deploySecurityOracleFixture);
      
      await securityOracle.connect(auditor).submitAuditReport(
        addr1.address,
        0, // critical
        0, // high
        2, // medium
        3  // low
      );

      const report = await securityOracle.getLatestAuditReport(addr1.address);
      expect(report.isSecure).to.be.true;
    });

    it("Should auto-blacklist on critical vulnerability in audit", async function () {
      const { securityOracle, auditor, addr1 } = await loadFixture(deploySecurityOracleFixture);
      
      await securityOracle.connect(auditor).submitAuditReport(
        addr1.address,
        1, // critical
        0,
        0,
        0
      );

      expect(await securityOracle.blacklistedContracts(addr1.address)).to.be.true;
    });

    it("Should revert if non-auditor tries to submit report", async function () {
      const { securityOracle, addr1, addr2 } = await loadFixture(deploySecurityOracleFixture);
      
      await expect(
        securityOracle.connect(addr2).submitAuditReport(addr1.address, 0, 0, 0, 0)
      ).to.be.reverted;
    });
  });

  describe("Contract Safety Checks", function () {
    it("Should return false for blacklisted contract", async function () {
      const { securityOracle, auditor, addr1 } = await loadFixture(deploySecurityOracleFixture);
      
      await securityOracle.connect(auditor).blacklistContract(addr1.address, "Test reason");
      
      expect(await securityOracle.isContractSafe(addr1.address)).to.be.false;
    });

    it("Should return false for contract with no audits", async function () {
      const { securityOracle, addr1 } = await loadFixture(deploySecurityOracleFixture);
      
      expect(await securityOracle.isContractSafe(addr1.address)).to.be.false;
    });

    it("Should return true for secure audited contract", async function () {
      const { securityOracle, auditor, addr1 } = await loadFixture(deploySecurityOracleFixture);
      
      await securityOracle.connect(auditor).submitAuditReport(
        addr1.address,
        0, 0, 1, 2
      );
      
      expect(await securityOracle.isContractSafe(addr1.address)).to.be.true;
    });
  });

  describe("Blacklist Management", function () {
    it("Should allow auditor to blacklist contract", async function () {
      const { securityOracle, auditor, addr1 } = await loadFixture(deploySecurityOracleFixture);
      
      const tx = await securityOracle.connect(auditor).blacklistContract(
        addr1.address,
        "Security concern"
      );

      await expect(tx)
        .to.emit(securityOracle, "ContractBlacklisted")
        .withArgs(addr1.address, "Security concern");

      expect(await securityOracle.blacklistedContracts(addr1.address)).to.be.true;
    });

    it("Should allow admin to whitelist contract", async function () {
      const { securityOracle, owner, auditor, addr1 } = await loadFixture(deploySecurityOracleFixture);
      
      await securityOracle.connect(auditor).blacklistContract(addr1.address, "Test");
      
      const tx = await securityOracle.connect(owner).whitelistContract(addr1.address);

      await expect(tx)
        .to.emit(securityOracle, "ContractWhitelisted")
        .withArgs(addr1.address);

      expect(await securityOracle.blacklistedContracts(addr1.address)).to.be.false;
    });

    it("Should revert if non-admin tries to whitelist", async function () {
      const { securityOracle, auditor, addr1 } = await loadFixture(deploySecurityOracleFixture);
      
      await securityOracle.connect(auditor).blacklistContract(addr1.address, "Test");

      await expect(
        securityOracle.connect(auditor).whitelistContract(addr1.address)
      ).to.be.reverted;
    });
  });

  describe("Vulnerability Queries", function () {
    it("Should return all vulnerabilities for a contract", async function () {
      const { securityOracle, reporter, addr1 } = await loadFixture(deploySecurityOracleFixture);
      
      await securityOracle.connect(reporter).reportVulnerability(addr1.address, 0, 2, "Vuln 1");
      await securityOracle.connect(reporter).reportVulnerability(addr1.address, 1, 1, "Vuln 2");
      
      const vulnIds = await securityOracle.getContractVulnerabilities(addr1.address);
      expect(vulnIds.length).to.equal(2);
    });

    it("Should return empty array for contract with no vulnerabilities", async function () {
      const { securityOracle, addr1 } = await loadFixture(deploySecurityOracleFixture);
      
      const vulnIds = await securityOracle.getContractVulnerabilities(addr1.address);
      expect(vulnIds.length).to.equal(0);
    });
  });

  describe("Pause Functionality", function () {
    it("Should allow admin to pause contract", async function () {
      const { securityOracle, owner } = await loadFixture(deploySecurityOracleFixture);
      
      await securityOracle.connect(owner).pause();
      expect(await securityOracle.paused()).to.be.true;
    });

    it("Should prevent reporting when paused", async function () {
      const { securityOracle, owner, reporter, addr1 } = await loadFixture(deploySecurityOracleFixture);
      
      await securityOracle.connect(owner).pause();

      await expect(
        securityOracle.connect(reporter).reportVulnerability(addr1.address, 0, 2, "Test")
      ).to.be.revertedWithCustomError(securityOracle, "EnforcedPause");
    });

    it("Should allow admin to unpause contract", async function () {
      const { securityOracle, owner } = await loadFixture(deploySecurityOracleFixture);
      
      await securityOracle.connect(owner).pause();
      await securityOracle.connect(owner).unpause();
      
      expect(await securityOracle.paused()).to.be.false;
    });
  });
});
