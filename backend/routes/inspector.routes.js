const express = require('express');
const { body } = require('express-validator');
const {
  createInspector,
  getInspectors,
  updateInspector,
  toggleInspectorStatus,
  resetInspectorPassword,
  getInspectorStats
} = require('../controllers/inspector.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Admin only routes
router.post('/',
  authorize('admin'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').notEmpty().withMessage('Phone number is required')
  ],
  createInspector
);

router.get('/', authorize('admin'), getInspectors);
router.put('/:id', authorize('admin'), updateInspector);
router.patch('/:id/toggle-status', authorize('admin'), toggleInspectorStatus);
router.post('/:id/reset-password', 
  authorize('admin'),
  [
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  resetInspectorPassword
);

// Admin or own inspector stats
router.get('/:id/stats', getInspectorStats);

module.exports = router;