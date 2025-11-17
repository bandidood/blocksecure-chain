import { Request, Response } from "express";
import { AuditController } from "../controllers/AuditController";
import { Audit, Contract } from "../models";
import { VulnerabilityAnalyzer } from "@blocksecure/analyzer";

// Mock dependencies
jest.mock("../models");
jest.mock("@blocksecure/analyzer");

describe("AuditController", () => {
  let controller: AuditController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    controller = new AuditController();
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAuditById", () => {
    it("should return audit when found", async () => {
      const mockAudit = {
        auditId: "test-audit-id",
        contractAddress: "0x123",
        status: "COMPLETED",
      };

      (Audit.findOne as jest.Mock) = jest.fn().mockResolvedValue(mockAudit);

      mockRequest.params = { id: "test-audit-id" };

      await controller.getAuditById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockAudit,
      });
    });

    it("should return 404 when audit not found", async () => {
      (Audit.findOne as jest.Mock) = jest.fn().mockResolvedValue(null);

      mockRequest.params = { id: "non-existent-id" };

      await controller.getAuditById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Audit not found",
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Database error");
      (Audit.findOne as jest.Mock) = jest.fn().mockRejectedValue(error);

      mockRequest.params = { id: "test-id" };

      await controller.getAuditById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: error.message,
      });
    });
  });

  describe("getAllAudits", () => {
    it("should return paginated audits", async () => {
      const mockAudits = [
        { auditId: "1", contractAddress: "0x123" },
        { auditId: "2", contractAddress: "0x456" },
      ];

      (Audit.find as jest.Mock) = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(mockAudits),
            }),
          }),
        }),
      });

      (Audit.countDocuments as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockAudits.length);

      mockRequest.query = { page: "1", limit: "20" };

      await controller.getAllAudits(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          audits: mockAudits,
          pagination: {
            page: 1,
            limit: 20,
            total: 2,
            pages: 1,
          },
        },
      });
    });

    it("should filter by status", async () => {
      const mockAudits = [{ auditId: "1", status: "COMPLETED" }];

      (Audit.find as jest.Mock) = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(mockAudits),
            }),
          }),
        }),
      });

      (Audit.countDocuments as jest.Mock) = jest.fn().mockResolvedValue(1);

      mockRequest.query = { status: "COMPLETED" };

      await controller.getAllAudits(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Audit.find).toHaveBeenCalledWith({ status: "COMPLETED" });
    });
  });

  describe("getAuditsByContract", () => {
    it("should return audits for specific contract", async () => {
      const contractAddress = "0xABC123";
      const mockAudits = [
        { auditId: "1", contractAddress: contractAddress.toLowerCase() },
      ];

      (Audit.find as jest.Mock) = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(mockAudits),
            }),
          }),
        }),
      });

      (Audit.countDocuments as jest.Mock) = jest.fn().mockResolvedValue(1);

      mockRequest.params = { address: contractAddress };
      mockRequest.query = {};

      await controller.getAuditsByContract(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Audit.find).toHaveBeenCalledWith({
        contractAddress: contractAddress.toLowerCase(),
      });

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          contractAddress,
          audits: mockAudits,
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            pages: 1,
          },
        },
      });
    });
  });
});
