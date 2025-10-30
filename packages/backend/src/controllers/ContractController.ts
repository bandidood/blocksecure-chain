import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Web3Service } from "../services/Web3Service";

export class ContractController {
  private web3Service: Web3Service;

  constructor() {
    this.web3Service = new Web3Service();
  }

  isContractSafe = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { address } = req.params;
      const isSafe = await this.web3Service.isContractSafe(address);

      res.json({
        success: true,
        data: {
          contractAddress: address,
          isSafe,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  getContractVulnerabilities = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { address } = req.params;
      const vulnerabilities = await this.web3Service.getContractVulnerabilities(
        address
      );

      res.json({
        success: true,
        data: {
          contractAddress: address,
          vulnerabilities,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  getLatestAuditReport = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { address } = req.params;
      const report = await this.web3Service.getLatestAuditReport(address);

      res.json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };
}
