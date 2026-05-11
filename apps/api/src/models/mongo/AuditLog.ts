import mongoose, { Schema } from 'mongoose';

const AuditLogSchema = new Schema(
  {
    actorId: { type: String, index: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    ip: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ createdAt: -1 });

export const AuditLogModel =
  mongoose.models.AuditLog ?? mongoose.model('AuditLog', AuditLogSchema, 'auditlogs');
