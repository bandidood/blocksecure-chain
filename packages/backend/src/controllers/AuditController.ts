import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { VulnerabilityAnalyzer } from "@blocksecure/analyzer";
import { Audit, AuditStatus, Contract, ContractSafetyStatus } from "../models";
import { v4 as uuidv4 } from "uuid";

export class AuditController {
  private analyzer: VulnerabilityAnalyzer;

  constructor() {
    this.analyzer = new VulnerabilityAnalyzer();
  }

  scanContract = async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { contractPath, contractAddress, contractName } = req.body;

      // Create audit record
      const auditId = uuidv4();
      const audit = new Audit({
        auditId,
        contractAddress: contractAddress?.toLowerCase(),
        contractPath,
        contractName,
        status: AuditStatus.IN_PROGRESS,
        analyzers: ['slither'],
        vulnerabilities: [],
        summary: {
          totalVulnerabilities: 0,
          criticalCount: 0,
          highCount: 0,
          mediumCount: 0,
          lowCount: 0,
          informationalCount: 0
        }
      });

      await audit.save();

      try {
        // Run analysis
        const result = await this.analyzer.getCombinedAnalysis(contractPath);

        // Map severity counts
        const severityCounts = {
          CRITICAL: 0,
          HIGH: 0,
          MEDIUM: 0,
          LOW: 0,
          INFORMATIONAL: 0
        };

        const mappedVulnerabilities = result.vulnerabilities.map((v: any) => {
          const severity = v.severity?.toUpperCase() || 'INFORMATIONAL';
          if (severity in severityCounts) {
            severityCounts[severity as keyof typeof severityCounts]++;
          }

          return {
            type: v.type,
            severity: severity,
            description: v.description,
            location: v.location,
            impact: v.impact,
            recommendation: v.recommendation
          };
        });

        // Update audit with results
        audit.status = AuditStatus.COMPLETED;
        audit.vulnerabilities = mappedVulnerabilities;
        audit.summary = {
          totalVulnerabilities: result.vulnerabilities.length,
          criticalCount: severityCounts.CRITICAL,
          highCount: severityCounts.HIGH,
          mediumCount: severityCounts.MEDIUM,
          lowCount: severityCounts.LOW,
          informationalCount: severityCounts.INFORMATIONAL
        };
        audit.scanDuration = Date.now() - startTime;
        audit.completedAt = new Date();

        await audit.save();

        // Update or create contract record
        if (contractAddress) {
          const address = contractAddress.toLowerCase();
          let contract = await Contract.findOne({ address });

          if (!contract) {
            contract = new Contract({
              address,
              name: contractName,
              safetyStatus: ContractSafetyStatus.UNKNOWN,
              totalAudits: 0,
              totalVulnerabilities: 0
            });
          }

          contract.totalAudits += 1;
          contract.totalVulnerabilities = audit.summary.totalVulnerabilities;
          contract.lastAuditDate = new Date();
          contract.name = contractName || contract.name;

          // Determine safety status
          if (severityCounts.CRITICAL > 0 || severityCounts.HIGH > 0) {
            contract.safetyStatus = ContractSafetyStatus.UNSAFE;
          } else if (audit.summary.totalVulnerabilities === 0) {
            contract.safetyStatus = ContractSafetyStatus.SAFE;
          }

          await contract.save();
        }

        res.json({
          success: true,
          data: {
            auditId,
            ...result,
            contractAddress: contractAddress || null,
            scanDuration: audit.scanDuration
          },
        });
      } catch (analysisError: any) {
        // Update audit to failed status
        audit.status = AuditStatus.FAILED;
        audit.scanDuration = Date.now() - startTime;
        await audit.save();

        throw analysisError;
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  getAuditById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const audit = await Audit.findOne({ auditId: id });

      if (!audit) {
        res.status(404).json({
          success: false,
          message: "Audit not found",
        });
        return;
      }

      res.json({
        success: true,
        data: audit,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  getAllAudits = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build filter
      const filter: any = {};
      if (status) {
        filter.status = status;
      }

      // Build sort
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

      const [audits, total] = await Promise.all([
        Audit.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Audit.countDocuments(filter)
      ]);

      res.json({
        success: true,
        data: {
          audits,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          }
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  getAuditsByContract = async (req: Request, res: Response): Promise<void> => {
    try {
      const { address } = req.params;
      const {
        page = 1,
        limit = 20,
        status
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build filter
      const filter: any = {
        contractAddress: address.toLowerCase()
      };
      if (status) {
        filter.status = status;
      }

      const [audits, total] = await Promise.all([
        Audit.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Audit.countDocuments(filter)
      ]);

      res.json({
        success: true,
        data: {
          contractAddress: address,
          audits,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          }
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };
}
