const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authGuard, roleGuard } = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/checkins/:employeeId — get all check-ins for an employee
router.get('/:employeeId', authGuard, roleGuard('MANAGER', 'ADMIN'), async (req, res) => {
  try {
    const quarter = req.query.quarter;
    const where = { employeeId: req.params.employeeId };
    if (quarter) where.quarter = quarter;

    const checkIns = await prisma.checkIn.findMany({
      where,
      include: { manager: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(checkIns);
  } catch (err) {
    console.error('Get check-ins error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/checkins — create a check-in
router.post('/', authGuard, roleGuard('MANAGER', 'ADMIN'), async (req, res) => {
  try {
    const { employeeId, quarter, comment } = req.body;
    if (!employeeId || !quarter || !comment) {
      return res.status(400).json({ error: 'Employee ID, quarter, and comment are required.' });
    }

    const checkIn = await prisma.checkIn.create({
      data: {
        managerId: req.user.id,
        employeeId,
        quarter,
        comment,
      },
      include: { manager: { select: { id: true, name: true } } },
    });

    res.status(201).json(checkIn);
  } catch (err) {
    console.error('Create check-in error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
