import { Router } from "express";
import { param } from "express-validator";
import { ContractController } from "../controllers/ContractController";

const router = Router();
const contractController = new ContractController();

/**
 * @route   GET /api/contracts/:address/safe
 * @desc    Check if a contract is safe to interact with
 * @access  Public
 */
router.get(
  "/:address/safe",
  [param("address").isEthereumAddress()],
  contractController.isContractSafe
);

/**
 * @route   GET /api/contracts/:address/vulnerabilities
 * @desc    Get vulnerabilities for a contract address
 * @access  Public
 */
router.get(
  "/:address/vulnerabilities",
  [param("address").isEthereumAddress()],
  contractController.getContractVulnerabilities
);

/**
 * @route   GET /api/contracts/:address/audit-report
 * @desc    Get the latest audit report for a contract
 * @access  Public
 */
router.get(
  "/:address/audit-report",
  [param("address").isEthereumAddress()],
  contractController.getLatestAuditReport
);

export default router;
