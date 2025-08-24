const express = require('express');
const { body } = require('express-validator');
const {
  createInspectionReport,
  getInspectionReports,
  getInspectionReport,
  updateInspectionReport,
  publishReport,
  getPublicReport,
  getPublicReportByLink,
  deleteInspectionReport,
  downloadReportPDF
} = require('../controllers/inspection.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth.middleware');

const router = express.Router();

const inspectionValidation = [
  body('car').isMongoId().withMessage('Valid car ID is required'),
  body('overallRating').isNumeric().withMessage('Overall rating is required'),
  body('overallCondition').isString().withMessage('Overall condition is required'),
  body('inspectionDate').optional().isISO8601().withMessage('Valid inspection date is required')
];

// Public routes (no auth required)
router.get('/public/:shareableLink', getPublicReport);
router.get('/report/:link', getPublicReportByLink);
router.get('/download/:shareableLink', downloadReportPDF);

router.use(protect);

router.route('/')
  .post(authorize('admin', 'inspector'), inspectionValidation, createInspectionReport)
  .get(getInspectionReports);

router.route('/:id')
  .get(getInspectionReport)
  .put(authorize('admin', 'inspector'), inspectionValidation, updateInspectionReport)
  .delete(authorize('admin', 'inspector'), deleteInspectionReport);

router.put('/:id/publish', authorize('admin', 'inspector'), publishReport);

module.exports = router;