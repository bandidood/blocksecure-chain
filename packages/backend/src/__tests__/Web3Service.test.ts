import { Web3Service } from "../services/Web3Service";

// Mock ethers
jest.mock("ethers", () => ({
  JsonRpcProvider: jest.fn().mockImplementation(() => ({
    getNetwork: jest.fn().mockResolvedValue({ chainId: 1n }),
    getBlockNumber: jest.fn().mockResolvedValue(100),
    getBalance: jest.fn().mockResolvedValue(1000000000000000000n),
  })),
  Contract: jest.fn().mockImplementation(() => ({
    isContractSafe: jest.fn().mockResolvedValue(true),
    getContractVulnerabilities: jest.fn().mockResolvedValue([]),
    getLatestAuditReport: jest.fn().mockResolvedValue({
      contractAddress: "0xABC123",
      totalVulnerabilities: 0n,
      criticalCount: 0n,
      highCount: 0n,
      mediumCount: 0n,
      lowCount: 0n,
      isSecure: true,
      timestamp: 0n,
      auditor: "0x0000000000000000000000000000000000000000"
    }),
    vulnerabilities: jest.fn().mockResolvedValue({
      contractAddress: "0xABC123",
      vulnType: 0,
      severity: 0,
      description: "Test vulnerability",
      timestamp: 0n,
      reporter: "0x0000000000000000000000000000000000000000",
      verified: false,
      resolved: false
    }),
  })),
  formatEther: jest.fn().mockReturnValue("1.0"),
}));

describe("Web3Service", () => {
  let service: Web3Service;

  beforeEach(() => {
    process.env.RPC_URL = "http://localhost:8545";
    process.env.SECURITY_ORACLE_ADDRESS = "0x1234567890123456789012345678901234567890";
    service = new Web3Service();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("isContractSafe", () => {
    it("should check if contract is safe", async () => {
      const address = "0xABC123";
      const result = await service.isContractSafe(address);

      expect(result).toBeDefined();
      expect(typeof result).toBe("boolean");
    });

    it("should handle errors gracefully", async () => {
      const service = new Web3Service();
      const invalidAddress = "invalid-address";

      await expect(service.isContractSafe(invalidAddress)).rejects.toThrow();
    });
  });

  describe("getContractVulnerabilities", () => {
    it("should return contract vulnerabilities", async () => {
      const address = "0xABC123";
      const vulnerabilities = await service.getContractVulnerabilities(address);

      expect(Array.isArray(vulnerabilities)).toBe(true);
    });
  });

  describe("getLatestAuditReport", () => {
    it("should return audit report", async () => {
      const address = "0xABC123";
      const report = await service.getLatestAuditReport(address);

      expect(report).toBeDefined();
      expect(report).toHaveProperty("contractAddress");
      expect(report).toHaveProperty("totalVulnerabilities");
      expect(report).toHaveProperty("isSecure");
      expect(report).toHaveProperty("timestamp");
    });
  });

  describe("getBlockNumber", () => {
    it("should return current block number", async () => {
      const blockNumber = await service.getBlockNumber();
      expect(typeof blockNumber).toBe("number");
      expect(blockNumber).toBeGreaterThanOrEqual(0);
    });
  });
});
