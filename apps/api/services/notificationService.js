const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Create a notification for a user
 */
async function createNotification(userId, message, type, link = null) {
  return prisma.notification.create({
    data: { userId, message, type, link },
  });
}

/**
 * Notify a manager when an employee submits goals
 */
async function notifyGoalSubmission(employee) {
  if (employee.managerId) {
    await createNotification(
      employee.managerId,
      `${employee.name} has submitted their goals for review`,
      'GOAL_SUBMITTED',
      '/manager/approvals'
    );
  }
}

/**
 * Notify an employee when their goals are approved
 */
async function notifyGoalApproval(employeeId) {
  await createNotification(
    employeeId,
    'Your goals have been approved and locked ✓',
    'GOAL_APPROVED',
    '/employee/goals'
  );
}

/**
 * Notify an employee when goals are returned for rework
 */
async function notifyGoalRework(employeeId, comment) {
  await createNotification(
    employeeId,
    `Manager has returned your goals with comments: "${comment.substring(0, 50)}..."`,
    'GOAL_REWORK',
    '/employee/goals'
  );
}

/**
 * Notify all users when a quarter opens
 */
async function notifyQuarterOpen(quarter, label) {
  const users = await prisma.user.findMany({ select: { id: true } });
  const notifications = users.map(u => ({
    userId: u.id,
    message: `${label} window is now open — log your progress`,
    type: 'QUARTER_OPEN',
    link: '/employee/achievements',
    isRead: false,
  }));
  await prisma.notification.createMany({ data: notifications });
}

/**
 * Notify about approaching check-in deadlines
 */
async function notifyDeadlineApproaching(daysLeft) {
  const users = await prisma.user.findMany({ select: { id: true } });
  const notifications = users.map(u => ({
    userId: u.id,
    message: `${daysLeft} days left to complete your check-in`,
    type: 'DEADLINE_APPROACHING',
    link: '/employee/achievements',
    isRead: false,
  }));
  await prisma.notification.createMany({ data: notifications });
}

module.exports = {
  createNotification,
  notifyGoalSubmission,
  notifyGoalApproval,
  notifyGoalRework,
  notifyQuarterOpen,
  notifyDeadlineApproaching,
};
