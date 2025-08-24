const express = require('express');
const { getDashboardStats, getRecentActivity } = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All dashboard routes require authentication
router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/activity', getRecentActivity);

module.exports = router;