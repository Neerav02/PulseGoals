const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Audit Logger Middleware
 * Logs state-changing operations to the audit_logs table
 */
function createAuditLog(actorId, actorName, action, entityType, entityId, beforeValue = null, afterValue = null) {
  return prisma.auditLog.create({
    data: {
      actorId,
      actorName,
      action,
      entityType,
      entityId,
      beforeValue,
      afterValue,
    },
  });
}

module.exports = { createAuditLog };
