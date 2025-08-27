const express = require('express');
const router = express.Router();
const NotificationController = require('../Controllers/NotificationController');
const authMiddleware = require('../Middlewares/AuthMiddleware');

router.get('/', authMiddleware, NotificationController.getNotifications);
router.patch('/:id/read', authMiddleware, NotificationController.markAsRead);

module.exports = router;
