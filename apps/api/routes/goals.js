const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authGuard, roleGuard } = require('../middleware/auth');
const { createAuditLog } = require('../middleware/audit');
const { notifyGoalSubmission, notifyGoalApproval, notifyGoalRework } = require('../services/notificationService');

const prisma = new PrismaClient();

// Validation constants
const RULES = {
  TOTAL_WEIGHTAGE: 100,
  MIN_WEIGHTAGE: 10,
  MAX_GOALS: 8,
  MAX_GOAL_TITLE_LEN: 100,
  MIN_GOAL_DESC_LEN: 10,
};

// GET /api/goals/sheet — get current user's goal sheet for current year
router.get('/sheet', authGuard, async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    let sheet = await prisma.goalSheet.findUnique({
      where: { userId_cycleYear: { userId: req.user.id, cycleYear: year } },
      include: {
        goals: { include: { achievements: true }, orderBy: { createdAt: 'asc' } },
      },
    });

    if (!sheet) {
      // Auto-create a draft sheet
      sheet = await prisma.goalSheet.create({
        data: { userId: req.user.id, cycleYear: year, status: 'DRAFT' },
        include: { goals: { include: { achievements: true } } },
      });
    }

    res.json(sheet);
  } catch (err) {
    console.error('Get sheet error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/goals/sheet/:userId — get a specific user's goal sheet (manager/admin)
router.get('/sheet/:userId', authGuard, roleGuard('MANAGER', 'ADMIN'), async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const sheet = await prisma.goalSheet.findUnique({
      where: { userId_cycleYear: { userId: req.params.userId, cycleYear: year } },
      include: {
        goals: { include: { achievements: true }, orderBy: { createdAt: 'asc' } },
        user: { select: { id: true, name: true, email: true, department: true, designation: true } },
      },
    });
    if (!sheet) return res.status(404).json({ error: 'Goal sheet not found.' });
    res.json(sheet);
  } catch (err) {
    console.error('Get sheet by user error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/goals — add a goal to the current sheet
router.post('/', authGuard, async (req, res) => {
  try {
    const { title, description, thrustArea, uomType, target, weightage, isShared, sharedFromId } = req.body;
    const year = parseInt(req.body.year) || new Date().getFullYear();

    // Find or create sheet
    let sheet = await prisma.goalSheet.findUnique({
      where: { userId_cycleYear: { userId: req.user.id, cycleYear: year } },
      include: { goals: true },
    });

    if (!sheet) {
      sheet = await prisma.goalSheet.create({
        data: { userId: req.user.id, cycleYear: year, status: 'DRAFT' },
        include: { goals: true },
      });
    }

    if (sheet.status === 'APPROVED') {
      return res.status(400).json({ error: 'Goal sheet is locked. Cannot add goals.' });
    }

    // Validation
    if (sheet.goals.length >= RULES.MAX_GOALS) {
      return res.status(400).json({ error: `Maximum ${RULES.MAX_GOALS} goals allowed.` });
    }
    if (title && title.length > RULES.MAX_GOAL_TITLE_LEN) {
      return res.status(400).json({ error: `Title must be under ${RULES.MAX_GOAL_TITLE_LEN} characters.` });
    }
    if (description && description.length < RULES.MIN_GOAL_DESC_LEN) {
      return res.status(400).json({ error: `Description must be at least ${RULES.MIN_GOAL_DESC_LEN} characters.` });
    }
    if (weightage < RULES.MIN_WEIGHTAGE) {
      return res.status(400).json({ error: `Minimum weightage is ${RULES.MIN_WEIGHTAGE}%.` });
    }

    const currentTotal = sheet.goals.reduce((sum, g) => sum + g.weightage, 0);
    if (currentTotal + weightage > RULES.TOTAL_WEIGHTAGE) {
      return res.status(400).json({ error: `Total weightage would exceed ${RULES.TOTAL_WEIGHTAGE}%. Current: ${currentTotal}%` });
    }

    const goal = await prisma.goal.create({
      data: {
        goalSheetId: sheet.id,
        title,
        description,
        thrustArea,
        uomType,
        target: String(target),
        weightage,
        isShared: isShared || false,
        sharedFromId: sharedFromId || null,
      },
    });

    await createAuditLog(req.user.id, req.user.name, 'CREATE_GOAL', 'Goal', goal.id, null, goal);
    res.status(201).json(goal);
  } catch (err) {
    console.error('Create goal error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/goals/:id — update a goal
router.put('/:id', authGuard, async (req, res) => {
  try {
    const existing = await prisma.goal.findUnique({
      where: { id: req.params.id },
      include: { goalSheet: true },
    });
    if (!existing) return res.status(404).json({ error: 'Goal not found.' });
    if (existing.goalSheet.status === 'APPROVED') {
      return res.status(400).json({ error: 'Goal sheet is locked.' });
    }

    const { title, description, thrustArea, uomType, target, weightage } = req.body;

    // If shared goal, only weightage is editable
    if (existing.isShared) {
      const updated = await prisma.goal.update({
        where: { id: req.params.id },
        data: { weightage: weightage !== undefined ? weightage : existing.weightage },
      });
      return res.json(updated);
    }

    const updated = await prisma.goal.update({
      where: { id: req.params.id },
      data: {
        title: title || existing.title,
        description: description !== undefined ? description : existing.description,
        thrustArea: thrustArea || existing.thrustArea,
        uomType: uomType || existing.uomType,
        target: target !== undefined ? String(target) : existing.target,
        weightage: weightage !== undefined ? weightage : existing.weightage,
      },
    });

    await createAuditLog(req.user.id, req.user.name, 'UPDATE_GOAL', 'Goal', updated.id, existing, updated);
    res.json(updated);
  } catch (err) {
    console.error('Update goal error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/goals/:id — delete a goal
router.delete('/:id', authGuard, async (req, res) => {
  try {
    const existing = await prisma.goal.findUnique({
      where: { id: req.params.id },
      include: { goalSheet: true },
    });
    if (!existing) return res.status(404).json({ error: 'Goal not found.' });
    if (existing.goalSheet.status === 'APPROVED') {
      return res.status(400).json({ error: 'Goal sheet is locked.' });
    }

    await prisma.goal.delete({ where: { id: req.params.id } });
    await createAuditLog(req.user.id, req.user.name, 'DELETE_GOAL', 'Goal', req.params.id, existing, null);
    res.json({ message: 'Goal deleted.' });
  } catch (err) {
    console.error('Delete goal error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/goals/submit — submit goal sheet for approval
router.post('/submit', authGuard, async (req, res) => {
  try {
    const year = parseInt(req.body.year) || new Date().getFullYear();
    const sheet = await prisma.goalSheet.findUnique({
      where: { userId_cycleYear: { userId: req.user.id, cycleYear: year } },
      include: { goals: true },
    });

    if (!sheet) return res.status(404).json({ error: 'No goal sheet found.' });
    if (sheet.status === 'APPROVED') return res.status(400).json({ error: 'Already approved.' });

    // Validate total weightage
    const total = sheet.goals.reduce((sum, g) => sum + g.weightage, 0);
    if (Math.abs(total - RULES.TOTAL_WEIGHTAGE) > 0.01) {
      return res.status(400).json({ error: `Total weightage must be exactly ${RULES.TOTAL_WEIGHTAGE}%. Current: ${total}%` });
    }

    const updated = await prisma.goalSheet.update({
      where: { id: sheet.id },
      data: { status: 'SUBMITTED', submittedAt: new Date() },
      include: { goals: true, user: true },
    });

    // Notify manager
    await notifyGoalSubmission(updated.user);
    await createAuditLog(req.user.id, req.user.name, 'SUBMIT_GOALS', 'GoalSheet', sheet.id, { status: sheet.status }, { status: 'SUBMITTED' });

    res.json(updated);
  } catch (err) {
    console.error('Submit goals error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/goals/approve/:sheetId — manager approves a goal sheet
router.post('/approve/:sheetId', authGuard, roleGuard('MANAGER', 'ADMIN'), async (req, res) => {
  try {
    const sheet = await prisma.goalSheet.findUnique({
      where: { id: req.params.sheetId },
      include: { goals: true },
    });
    if (!sheet) return res.status(404).json({ error: 'Goal sheet not found.' });

    const updated = await prisma.goalSheet.update({
      where: { id: sheet.id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: req.user.id,
      },
      include: { goals: true },
    });

    await notifyGoalApproval(sheet.userId);
    await createAuditLog(req.user.id, req.user.name, 'APPROVE_GOALS', 'GoalSheet', sheet.id, { status: 'SUBMITTED' }, { status: 'APPROVED' });

    res.json(updated);
  } catch (err) {
    console.error('Approve goals error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/goals/rework/:sheetId — return for rework
router.post('/rework/:sheetId', authGuard, roleGuard('MANAGER', 'ADMIN'), async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment) return res.status(400).json({ error: 'Rework comment is required.' });

    const sheet = await prisma.goalSheet.findUnique({ where: { id: req.params.sheetId } });
    if (!sheet) return res.status(404).json({ error: 'Goal sheet not found.' });

    const updated = await prisma.goalSheet.update({
      where: { id: sheet.id },
      data: { status: 'REWORK', reworkNote: comment },
      include: { goals: true },
    });

    await notifyGoalRework(sheet.userId, comment);
    await createAuditLog(req.user.id, req.user.name, 'REWORK_GOALS', 'GoalSheet', sheet.id, { status: sheet.status }, { status: 'REWORK', reworkNote: comment });

    res.json(updated);
  } catch (err) {
    console.error('Rework goals error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/goals/manager-edit/:goalId — manager inline edit
router.put('/manager-edit/:goalId', authGuard, roleGuard('MANAGER', 'ADMIN'), async (req, res) => {
  try {
    const existing = await prisma.goal.findUnique({ where: { id: req.params.goalId } });
    if (!existing) return res.status(404).json({ error: 'Goal not found.' });

    const { target, weightage } = req.body;
    const updated = await prisma.goal.update({
      where: { id: req.params.goalId },
      data: {
        target: target !== undefined ? String(target) : existing.target,
        weightage: weightage !== undefined ? weightage : existing.weightage,
      },
    });

    await createAuditLog(req.user.id, req.user.name, 'MANAGER_EDIT_GOAL', 'Goal', updated.id, existing, updated);
    res.json(updated);
  } catch (err) {
    console.error('Manager edit error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
