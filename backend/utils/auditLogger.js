import AuditLog from "../model/auditLogModel.js";

export async function logAudit({
  userId,
  passwordId,
  action,
  metadata = {},
}) {
  try {
    await AuditLog.create({
      userId,
      passwordId,
      action,
      metadata,
    });
  } catch (err) {
    console.error("Audit log failed:", err.message);
    // Never block main action because of audit failure
  }
}
