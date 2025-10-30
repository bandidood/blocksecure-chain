import { Router } from "express";
import { body } from "express-validator";
import { AuditController } from "../controllers/AuditController";

const router = Router();
const auditController = new AuditController();

/**
 * @route   POST /api/audits/scan
 * @desc    Scan a smart contract for vulnerabilities
 * @access  Public
 */
router.post(
  "/scan",
  [
    body("contractPath").notEmpty().withMessage("Contract path is required"),
    body("contractAddress").optional().isEthereumAddress(),
  ],
  auditController.scanContract
);

/**
 * @route   GET /api/audits/:id
 * @desc    Get audit results by ID
 * @access  Public
 */
router.get("/:id", auditController.getAuditById);

/**
 * @route   GET /api/audits
 * @desc    Get all audits
 * @access  Public
 */
router.get("/", auditController.getAllAudits);

/**
 * @route   GET /api/audits/contract/:address
 * @desc    Get audits for a specific contract address
 * @access  Public
 */
router.get("/contract/:address", auditController.getAuditsByContract);

export default router;
