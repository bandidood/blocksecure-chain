import mongoose, { Document, Schema } from 'mongoose';

export enum ContractSafetyStatus {
  SAFE = 'SAFE',
  UNSAFE = 'UNSAFE',
  UNKNOWN = 'UNKNOWN',
  BLACKLISTED = 'BLACKLISTED',
  WHITELISTED = 'WHITELISTED'
}

export interface IContract extends Document {
  address: string;
  name?: string;
  safetyStatus: ContractSafetyStatus;
  isBlacklisted: boolean;
  isWhitelisted: boolean;
  totalAudits: number;
  totalVulnerabilities: number;
  lastAuditDate?: Date;
  firstSeenDate: Date;
  deployer?: string;
  bytecodeHash?: string;
  sourceCodeVerified: boolean;
  chainId?: number;
  metadata?: {
    compiler?: string;
    optimizations?: boolean;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema = new Schema<IContract>(
  {
    address: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },
    name: String,
    safetyStatus: {
      type: String,
      enum: Object.values(ContractSafetyStatus),
      default: ContractSafetyStatus.UNKNOWN,
      index: true
    },
    isBlacklisted: {
      type: Boolean,
      default: false,
      index: true
    },
    isWhitelisted: {
      type: Boolean,
      default: false,
      index: true
    },
    totalAudits: {
      type: Number,
      default: 0
    },
    totalVulnerabilities: {
      type: Number,
      default: 0
    },
    lastAuditDate: Date,
    firstSeenDate: {
      type: Date,
      default: Date.now
    },
    deployer: {
      type: String,
      lowercase: true
    },
    bytecodeHash: String,
    sourceCodeVerified: {
      type: Boolean,
      default: false
    },
    chainId: Number,
    metadata: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

// Indexes
ContractSchema.index({ safetyStatus: 1 });
ContractSchema.index({ isBlacklisted: 1 });
ContractSchema.index({ isWhitelisted: 1 });
ContractSchema.index({ lastAuditDate: -1 });
ContractSchema.index({ totalVulnerabilities: -1 });

export const Contract = mongoose.model<IContract>('Contract', ContractSchema);
