const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth.middleware');
const {
  addCarPart,
  uploadPartImages,
  updateCarPart,
  deleteCarPart,
  getInspectionParts,
  getCarPart,
  deletePartImage
} = require('../controllers/carPart.controller');

// Configure multer for image uploads using memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// All routes require authentication
router.use(protect);

// Car part routes
router.post('/', upload.array('images', 10), addCarPart);
router.post('/:id/images', upload.array('images', 10), uploadPartImages);
router.put('/:id', upload.array('images', 10), updateCarPart);
router.delete('/:id', deleteCarPart);
router.get('/inspection/:inspectionId', getInspectionParts);
router.get('/:id', getCarPart);
router.delete('/:id/images/:imageId', deletePartImage);

module.exports = router;