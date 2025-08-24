const express = require('express');
const { body } = require('express-validator');
const {
  createCar,
  getCars,
  getCar,
  updateCar,
  deleteCar
} = require('../controllers/car.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

const carValidation = [
  body('make').trim().notEmpty().withMessage('Car make is required'),
  body('model').trim().notEmpty().withMessage('Car model is required'),
  body('year')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Please provide a valid year'),
  body('registrationNo').trim().notEmpty().withMessage('Registration number is required'),
  body('chassisNo').trim().notEmpty().withMessage('Chassis number is required'),
  body('mileage')
    .isInt({ min: 0 })
    .withMessage('Mileage must be a positive number'),
  body('fuelType')
    .isIn(['petrol', 'diesel', 'hybrid', 'electric', 'cng', 'lpg'])
    .withMessage('Please select a valid fuel type'),
  body('transmissionType')
    .isIn(['manual', 'automatic', 'cvt', 'semi-automatic'])
    .withMessage('Please select a valid transmission type')
];

router.use(protect);

router.route('/')
  .post(carValidation, createCar)
  .get(getCars);

router.route('/:id')
  .get(getCar)
  .put(carValidation, updateCar)
  .delete(authorize('admin', 'inspector'), deleteCar);

module.exports = router;