const express = require('express');
const { body } = require('express-validator');
const {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  assignInspector,
  cancelBooking
} = require('../controllers/booking.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

const bookingValidation = [
  body('car').isMongoId().withMessage('Valid car ID is required'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
  body('scheduledTime').notEmpty().withMessage('Scheduled time is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Valid amount is required'),
  body('inspectionType')
    .optional()
    .isIn(['basic', 'comprehensive', 'pre-purchase', 'insurance', 'warranty'])
    .withMessage('Invalid inspection type')
];

router.use(protect);

router.route('/')
  .post(bookingValidation, createBooking)
  .get(getBookings);

router.route('/:id')
  .get(getBooking)
  .put(bookingValidation, updateBooking);

router.put('/:id/assign-inspector', 
  authorize('admin', 'inspector'), 
  [body('inspectorId').isMongoId().withMessage('Valid inspector ID is required')],
  assignInspector
);

router.put('/:id/cancel', 
  [body('reason').optional().trim()],
  cancelBooking
);

module.exports = router;