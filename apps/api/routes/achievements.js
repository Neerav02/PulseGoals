const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authGuard } = require('../middleware/auth');
const { createAuditLog } = require('../middleware/audit');
const { computeProgressScore } = require('../services/formulae');

const prisma = new PrismaClient();

// GET /api/achievements/:goalId — get achievements for a goal
router.get('/:goalId', authGuard, async (req, res) => {
  try {
    const achievements = await prisma.achievement.findMany({
      where: { goalId: req.params.goalId },
      orderBy: { quarter: 'asc' },
    });
    res.json(achievements);
  } catch (err) {
    console.error('Get achievements error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/achievements/user/:userId — get all achievements for a user in a quarter
router.get('/user/:userId', authGuard, async (req, res) => {
  try {
    const quarter = req.query.quarter;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const sheet = await prisma.goalSheet.findUnique({
      where: { userId_cycleYear: { userId: req.params.userId, cycleYear: year } },
      include: {
        goals: {
          include: {
            achievements: quarter ? { where: { quarter } } : true,
          },
          orderBy: { createdAt: 'asc' },
        },
        user: { select: { id: true, name: true, department: true, designation: true } },
      },
    });

    if (!sheet) return res.status(404).json({ error: 'No goal sheet found.' });
    res.json(sheet);
  } catch (err) {
    console.error('Get user achievements error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/achievements — create/update achievement entry
router.post('/', authGuard, async (req, res) => {
  try {
    const { goalId, quarter, actualValue, status } = req.body;

    // Check if quarter window is open
    const cycleConfig = await prisma.cycleConfig.findUnique({ where: { phase: quarter } });
    if (cycleConfig && !cycleConfig.isOpen) {
      return res.status(400).json({ error: `${quarter} check-in window is not currently open.` });
    }

    // Get goal details for score computation
    const goal = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) return res.status(404).json({ error: 'Goal not found.' });

    // Compute progress score
    const progressScore = computeProgressScore(goal.uomType, goal.target, actualValue);

    // Upsert achievement
    const achievement = await prisma.achievement.upsert({
      where: { goalId_quarter: { goalId, quarter } },
      create: {
        goalId,
        quarter,
        actualValue: String(actualValue),
        status: status || 'ON_TRACK',
        progressScore,
      },
      update: {
        actualValue: String(actualValue),
        status: status || 'ON_TRACK',
        progressScore,
        updatedAt: new Date(),
      },
    });

    // BRD CONSTRAINT: Sync Shared Goal Achievements
    if (goal.isShared && goal.sharedFromId) {
      const linkedGoals = await prisma.goal.findMany({
        where: { sharedFromId: goal.sharedFromId, id: { not: goalId } }
      });
      for (const linked of linkedGoals) {
        await prisma.achievement.upsert({
          where: { goalId_quarter: { goalId: linked.id, quarter } },
          create: { goalId: linked.id, quarter, actualValue: String(actualValue), status: status || 'ON_TRACK', progressScore },
          update: { actualValue: String(actualValue), status: status || 'ON_TRACK', progressScore, updatedAt: new Date() },
        });
      }
    }

    await createAuditLog(req.user.id, req.user.name, 'UPDATE_ACHIEVEMENT', 'Achievement', achievement.id, null, achievement);
    res.json(achievement);
  } catch (err) {
    console.error('Save achievement error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/achievements/submit — submit all achievements for a quarter
router.post('/submit', authGuard, async (req, res) => {
  try {
    const { quarter, year } = req.body;
    const cycleYear = parseInt(year) || new Date().getFullYear();

    const sheet = await prisma.goalSheet.findUnique({
      where: { userId_cycleYear: { userId: req.user.id, cycleYear } },
      include: { goals: { include: { achievements: { where: { quarter } } } } },
    });

    if (!sheet) return res.status(404).json({ error: 'No goal sheet found.' });

    // Verify all goals have achievements
    const goalsWithoutAchievements = sheet.goals.filter(g => g.achievements.length === 0);
    if (goalsWithoutAchievements.length > 0) {
      return res.status(400).json({
        error: `${goalsWithoutAchievements.length} goal(s) still need achievement entries.`,
      });
    }

    res.json({ message: 'Achievements submitted successfully.', sheet });
  } catch (err) {
    console.error('Submit achievements error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
