import mongoose, { Schema, model, models } from 'mongoose';

export interface ISecurityLog {
  event: string;
  severity: 'INFO' | 'WARN' | 'CRITICAL';
  ip: string;
  userId?: string;
  metadata?: any;
  createdAt: Date;
}

const securityLogSchema = new Schema<ISecurityLog>(
  {
    event: { type: String, required: true },
    severity: { 
      type: String, 
      required: true, 
      enum: ['INFO', 'WARN', 'CRITICAL'],
      default: 'INFO' 
    },
    ip: { type: String, required: true },
    userId: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const SecurityLog = models.SecurityLog || model<ISecurityLog>('SecurityLog', securityLogSchema);
export default SecurityLog;
