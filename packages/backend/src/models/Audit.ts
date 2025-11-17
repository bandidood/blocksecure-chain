import mongoose, { Document, Schema } from 'mongoose';

export enum AuditStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface IAudit extends Document {
  auditId: string;
  contractAddress: string;
  contractPath?: string;
  contractName?: string;
  status: AuditStatus;
  vulnerabilities: Array<{
    type: string;
    severity: string;
    description: string;
    location?: {
      file?: string;
      line?: number;
      column?: number;
    };
    impact?: string;
    recommendation?: string;
  }>;
  summary: {
    totalVulnerabilities: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    informationalCount: number;
  };
  analyzers: string[];
  scanDuration?: number;
  onChainReportId?: number;
  requestedBy?: string;
  metadata?: {
    compiler?: string;
    optimizations?: boolean;
    chainId?: number;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

const AuditSchema = new Schema<IAudit>(
  {
    auditId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    contractAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true
    },
    contractPath: String,
    contractName: String,
    status: {
      type: String,
      enum: Object.values(AuditStatus),
      default: AuditStatus.PENDING,
      index: true
    },
    vulnerabilities: [{
      type: {
        type: String,
        required: true
      },
      severity: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      location: {
        file: String,
        line: Number,
        column: Number
      },
      impact: String,
      recommendation: String
    }],
    summary: {
      totalVulnerabilities: {
        type: Number,
        default: 0
      },
      criticalCount: {
        type: Number,
        default: 0
      },
      highCount: {
        type: Number,
        default: 0
      },
      mediumCount: {
        type: Number,
        default: 0
      },
      lowCount: {
        type: Number,
        default: 0
      },
      informationalCount: {
        type: Number,
        default: 0
      }
    },
    analyzers: [{
      type: String,
      required: true
    }],
    scanDuration: Number,
    onChainReportId: {
      type: Number,
      unique: true,
      sparse: true
    },
    requestedBy: {
      type: String,
      lowercase: true
    },
    metadata: {
      type: Schema.Types.Mixed
    },
    completedAt: Date
  },
  {
    timestamps: true
  }
);

// Indexes for efficient queries
AuditSchema.index({ contractAddress: 1, createdAt: -1 });
AuditSchema.index({ status: 1, createdAt: -1 });
AuditSchema.index({ createdAt: -1 });

export const Audit = mongoose.model<IAudit>('Audit', AuditSchema);
