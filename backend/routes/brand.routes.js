const express = require('express');
const { body } = require('express-validator');
const {
  createBrand,
  getBrands,
  getBrand,
  updateBrand,
  deleteBrand,
  getBrandsWithModels
} = require('../controllers/brand.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

const brandValidation = [
  body('name').trim().notEmpty().withMessage('Brand name is required'),
  body('country').optional().trim(),
  body('description').optional().trim(),
  body('logo').optional().isURL().withMessage('Logo must be a valid URL'),
  body('isActive').optional().isBoolean(),
  body('order').optional().isNumeric()
];

// Public routes
router.get('/with-models', getBrandsWithModels);

// Protected routes
router.use(protect);

router.route('/')
  .get(getBrands)
  .post(authorize('admin'), brandValidation, createBrand);

router.route('/:id')
  .get(getBrand)
  .put(authorize('admin'), brandValidation, updateBrand)
  .delete(authorize('admin'), deleteBrand);

module.exports = router;