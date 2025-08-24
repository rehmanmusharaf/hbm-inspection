const express = require('express');
const { body } = require('express-validator');
const {
  createCarModel,
  getCarModels,
  getCarModel,
  updateCarModel,
  deleteCarModel,
  getModelsByBrand,
  getCategories,
  bulkCreateModels
} = require('../controllers/carModel.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

const carModelValidation = [
  body('brand').isMongoId().withMessage('Valid brand ID is required'),
  body('name').trim().notEmpty().withMessage('Model name is required'),
  body('category').isIn(['Hatchback', 'Sedan', 'SUV', 'Crossover', 'Pickup', 'Van', 'Coupe', 'Convertible', 'Wagon', 'Minivan', 'Truck', 'Other'])
    .withMessage('Valid category is required'),
  body('fuelType').optional().isArray(),
  body('transmission').optional().isArray(),
  body('engineCapacity').optional().isArray(),
  body('year.start').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
  body('year.end').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
  body('isActive').optional().isBoolean()
];

// Public routes
router.get('/categories', getCategories);
router.get('/brand/:brandId', getModelsByBrand);

// Protected routes
router.use(protect);

router.route('/')
  .get(getCarModels)
  .post(authorize('admin'), carModelValidation, createCarModel);

router.route('/:id')
  .get(getCarModel)
  .put(authorize('admin'), carModelValidation, updateCarModel)
  .delete(authorize('admin'), deleteCarModel);

// Bulk operations
router.post('/brand/:brandId/bulk', authorize('admin'), bulkCreateModels);

module.exports = router;