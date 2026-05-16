const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { authGuard, roleGuard } = require('../middleware/auth');
const { createAuditLog } = require('../middleware/audit');
const { generateAchievementReport } = require('../services/exportService');
const { notifyQuarterOpen } = require('../services/notificationService');

const prisma = new PrismaClient();

// ─── Org Stats ────────────────────────────────────────────

// GET /api/admin/stats — org-wide statistics
router.get('/stats', authGuard, roleGuard('ADMIN'), async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const totalEmployees = await prisma.user.count();
    const totalSheets = await prisma.goalSheet.count({ where: { cycleYear: year } });
    const submittedSheets = await prisma.goalSheet.count({ where: { cycleYear: year, status: { in: ['SUBMITTED', 'APPROVED'] } } });
    const approvedSheets = await prisma.goalSheet.count({ where: { cycleYear: year, status: 'APPROVED' } });
    const pendingSheets = await prisma.goalSheet.count({ where: { cycleYear: year, status: 'SUBMITTED' } });
    const draftSheets = await prisma.goalSheet.count({ where: { cycleYear: year, status: 'DRAFT' } });
    const reworkSheets = await prisma.goalSheet.count({ where: { cycleYear: year, status: 'REWORK' } });

    // Current cycle config
    const cycleConfigs = await prisma.cycleConfig.findMany({ orderBy: { phase: 'asc' } });
    const currentPhase = cycleConfigs.find(c => c.isOpen);

    // Department breakdown
    const departments = await prisma.user.groupBy({
      by: ['department'],
      _count: { id: true },
    });

    res.json({
      totalEmployees,
      totalSheets,
      submittedSheets,
      approvedSheets,
      pendingSheets,
      draftSheets,
      reworkSheets,
      submissionRate: totalEmployees > 0 ? Math.round((submittedSheets / totalEmployees) * 100) : 0,
      approvalRate: totalEmployees > 0 ? Math.round((approvedSheets / totalEmployees) * 100) : 0,
      currentPhase: currentPhase || null,
      cycleConfigs,
      departments,
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/admin/heatmap — completion heatmap data
router.get('/heatmap', authGuard, roleGuard('ADMIN'), async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const departments = await prisma.user.groupBy({ by: ['department'] });
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const heatmapData = [];

    for (const dept of departments) {
      const row = { department: dept.department };
      for (const q of quarters) {
        const users = await prisma.user.findMany({
          where: { department: dept.department },
          select: { id: true },
        });
        const userIds = users.map(u => u.id);

        const achievementCount = await prisma.achievement.count({
          where: {
            quarter: q,
            goal: {
              goalSheet: {
                userId: { in: userIds },
                cycleYear: year,
              },
            },
          },
        });

        const totalGoals = await prisma.goal.count({
          where: {
            goalSheet: {
              userId: { in: userIds },
              cycleYear: year,
            },
          },
        });

        row[q] = totalGoals > 0 ? Math.round((achievementCount / totalGoals) * 100) : 0;
      }
      heatmapData.push(row);
    }

    res.json(heatmapData);
  } catch (err) {
    console.error('Heatmap error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── Cycle Management ─────────────────────────────────────

// GET /api/admin/cycles (Visible to all authenticated users)
router.get('/cycles', authGuard, async (req, res) => {
  try {
    const cycles = await prisma.cycleConfig.findMany({ orderBy: { phase: 'asc' } });
    res.json(cycles);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/admin/cycles/:phase/toggle
router.put('/cycles/:phase/toggle', authGuard, roleGuard('ADMIN'), async (req, res) => {
  try {
    const cycle = await prisma.cycleConfig.findUnique({ where: { phase: req.params.phase } });
    if (!cycle) return res.status(404).json({ error: 'Cycle phase not found.' });

    const updated = await prisma.cycleConfig.update({
      where: { phase: req.params.phase },
      data: {
        isOpen: !cycle.isOpen,
        ...(cycle.isOpen ? { closedAt: new Date() } : { openedAt: new Date(), openedBy: req.user.id }),
      },
    });

    if (updated.isOpen) {
      await notifyQuarterOpen(updated.phase, updated.label);
    }

    await createAuditLog(req.user.id, req.user.name, 'TOGGLE_CYCLE', 'CycleConfig', cycle.id,
      { isOpen: cycle.isOpen }, { isOpen: updated.isOpen });

    res.json(updated);
  } catch (err) {
    console.error('Toggle cycle error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── User / Org Hierarchy Management ──────────────────────

// GET /api/admin/users
router.get('/users', authGuard, roleGuard('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true,
        department: true, designation: true, managerId: true,
        manager: { select: { id: true, name: true } },
        _count: { select: { reportees: true, goalSheets: true } },
      },
      orderBy: { name: 'asc' },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/admin/users/:id
router.get('/users/:id', authGuard, roleGuard('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        manager: { select: { id: true, name: true } },
        reportees: { select: { id: true, name: true, email: true, department: true, designation: true } },
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/admin/users — create new user
router.post('/users', authGuard, roleGuard('ADMIN'), async (req, res) => {
  try {
    const { name, email, password, role, department, designation, managerId } = req.body;
    const hashedPassword = await bcrypt.hash(password || 'Password@123', 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role, department, designation: designation || '', managerId },
    });

    await createAuditLog(req.user.id, req.user.name, 'CREATE_USER', 'User', user.id, null, { name, email, role, department });
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    console.error('Create user error:', err);
    if (err.code === 'P2002') return res.status(400).json({ error: 'Email already exists.' });
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/admin/users/:id — update user
router.put('/users/:id', authGuard, roleGuard('ADMIN'), async (req, res) => {
  try {
    const { name, email, role, department, designation, managerId } = req.body;
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'User not found.' });

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        name: name || existing.name,
        email: email || existing.email,
        role: role || existing.role,
        department: department || existing.department,
        designation: designation !== undefined ? designation : existing.designation,
        managerId: managerId !== undefined ? managerId : existing.managerId,
      },
    });

    await createAuditLog(req.user.id, req.user.name, 'UPDATE_USER', 'User', updated.id, existing, updated);
    res.json(updated);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── Shared Goals ─────────────────────────────────────────

// GET /api/admin/shared-goals
router.get('/shared-goals', authGuard, roleGuard('ADMIN'), async (req, res) => {
  try {
    const goals = await prisma.sharedGoal.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/admin/shared-goals — publish a shared goal
router.post('/shared-goals', authGuard, roleGuard('ADMIN'), async (req, res) => {
  try {
    const { title, description, thrustArea, uomType, target, department, assignedTo } = req.body;

    const sharedGoal = await prisma.sharedGoal.create({
      data: {
        title, description, thrustArea, uomType,
        target: String(target), department,
        createdBy: req.user.id,
        assignedTo: assignedTo || [],
      },
    });

    // Push to assigned employees' goal sheets
    for (const userId of (assignedTo || [])) {
      const year = new Date().getFullYear();
      let sheet = await prisma.goalSheet.findUnique({
        where: { userId_cycleYear: { userId, cycleYear: year } },
      });

      if (!sheet) {
        sheet = await prisma.goalSheet.create({
          data: { userId, cycleYear: year, status: 'DRAFT' },
        });
      }

      if (sheet.status !== 'APPROVED') {
        await prisma.goal.create({
          data: {
            goalSheetId: sheet.id,
            title, description, thrustArea, uomType,
            target: String(target),
            weightage: 10, // default, employee can adjust
            isShared: true,
            sharedFromId: sharedGoal.id,
          },
        });
      }
    }

    await createAuditLog(req.user.id, req.user.name, 'PUBLISH_SHARED_GOAL', 'SharedGoal', sharedGoal.id, null, sharedGoal);
    res.status(201).json(sharedGoal);
  } catch (err) {
    console.error('Create shared goal error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── Reports / Export ─────────────────────────────────────

// POST /api/admin/export — export achievement report
router.post('/export', authGuard, roleGuard('ADMIN'), async (req, res) => {
  try {
    const { userIds, quarter, year } = req.body;
    const cycleYear = parseInt(year) || new Date().getFullYear();

    const sheets = await prisma.goalSheet.findMany({
      where: {
        cycleYear,
        ...(userIds && userIds.length > 0 ? { userId: { in: userIds } } : {}),
      },
      include: {
        user: { select: { name: true } },
        goals: {
          include: {
            achievements: quarter ? { where: { quarter } } : true,
          },
        },
      },
    });

    // Flatten data
    const data = [];
    for (const sheet of sheets) {
      for (const goal of sheet.goals) {
        const achievement = quarter
          ? goal.achievements[0]
          : goal.achievements[goal.achievements.length - 1];

        // Get check-in comment
        const checkIn = await prisma.checkIn.findFirst({
          where: { employeeId: sheet.userId, ...(quarter ? { quarter } : {}) },
          orderBy: { createdAt: 'desc' },
        });

        data.push({
          employeeName: sheet.user.name,
          goalTitle: goal.title,
          thrustArea: goal.thrustArea,
          uomType: goal.uomType,
          target: goal.target,
          actualValue: achievement?.actualValue || null,
          progressScore: achievement?.progressScore || null,
          status: achievement?.status || 'NOT_STARTED',
          checkInComment: checkIn?.comment || null,
        });
      }
    }

    const buffer = generateAchievementReport(data, quarter || 'All', cycleYear);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="PulseGoals_${quarter || 'All'}_Report_${cycleYear}.xlsx"`);
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/admin/export/preview
router.get('/export/preview', authGuard, roleGuard('ADMIN'), async (req, res) => {
  try {
    const quarter = req.query.quarter;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const sheets = await prisma.goalSheet.findMany({
      where: { cycleYear: year },
      include: {
        user: { select: { name: true } },
        goals: {
          include: { achievements: quarter ? { where: { quarter } } : true },
          take: 5,
        },
      },
      take: 5,
    });

    const preview = [];
    for (const sheet of sheets) {
      for (const goal of sheet.goals) {
        const ach = goal.achievements[0];
        preview.push({
          employeeName: sheet.user.name,
          goalTitle: goal.title,
          thrustArea: goal.thrustArea,
          uomType: goal.uomType,
          target: goal.target,
          actualValue: ach?.actualValue || '—',
          progressScore: ach?.progressScore != null ? Math.round(ach.progressScore) : '—',
          status: ach?.status || 'NOT_STARTED',
        });
      }
    }

    res.json(preview);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── Audit Log ────────────────────────────────────────────

// GET /api/admin/audit-logs
router.get('/audit-logs', authGuard, roleGuard('ADMIN'), async (req, res) => {
  try {
    const { startDate, endDate, actorId, entityType } = req.query;
    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    if (actorId) where.actorId = actorId;
    if (entityType) where.entityType = entityType;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── Analytics ────────────────────────────────────────────

// GET /api/admin/analytics
router.get('/analytics', authGuard, roleGuard('ADMIN'), async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    // Thrust Area distribution
    const thrustAreas = await prisma.goal.groupBy({
      by: ['thrustArea'],
      _count: { id: true },
      where: { goalSheet: { cycleYear: year } },
    });

    // UoM breakdown
    const uomBreakdown = await prisma.goal.groupBy({
      by: ['uomType'],
      _count: { id: true },
      where: { goalSheet: { cycleYear: year } },
    });

    // Quarter-on-quarter completion
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const qoqData = [];
    for (const q of quarters) {
      const achievements = await prisma.achievement.findMany({
        where: { quarter: q, goal: { goalSheet: { cycleYear: year } } },
        select: { progressScore: true },
      });
      const avgScore = achievements.length > 0
        ? achievements.reduce((sum, a) => sum + (a.progressScore || 0), 0) / achievements.length
        : 0;
      qoqData.push({ quarter: q, avgScore: Math.round(avgScore * 10) / 10, count: achievements.length });
    }

    res.json({ thrustAreas, uomBreakdown, qoqData });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── Team Data (for managers) ─────────────────────────────

// GET /api/admin/team/:managerId
router.get('/team/:managerId', authGuard, roleGuard('MANAGER', 'ADMIN'), async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const reportees = await prisma.user.findMany({
      where: { managerId: req.params.managerId },
      select: {
        id: true, name: true, email: true, department: true, designation: true,
        goalSheets: {
          where: { cycleYear: year },
          select: { id: true, status: true, submittedAt: true, approvedAt: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json(reportees);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
