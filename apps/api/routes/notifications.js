const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authGuard } = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/notifications — get current user's notifications
router.get('/', authGuard, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(notifications);
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/notifications/unread-count
router.get('/unread-count', authGuard, async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false },
    });
    res.json({ count });
  } catch (err) {
    console.error('Unread count error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/notifications/:id/read — mark as read
router.put('/:id/read', authGuard, async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json(notification);
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/notifications/mark-all-read
router.put('/mark-all-read', authGuard, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('Mark all read error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
