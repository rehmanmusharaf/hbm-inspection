const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getCarPartTemplates,
  getTemplatesByCategory,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  seedTemplates
} = require('../controllers/carPartTemplate.controller');

// Public routes
router.get('/', getCarPartTemplates);
router.get('/category/:category', getTemplatesByCategory);

// Admin only routes
router.post('/', protect, authorize('admin'), createTemplate);
router.post('/seed', protect, authorize('admin'), seedTemplates);
router.put('/:id', protect, authorize('admin'), updateTemplate);
router.delete('/:id', protect, authorize('admin'), deleteTemplate);

module.exports = router;