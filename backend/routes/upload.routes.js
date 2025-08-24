const express = require('express');
const { upload } = require('../config/cloudinary');
const { uploadSingle, uploadMultiple, deleteFile } = require('../controllers/upload.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/single', 
  protect, 
  authorize('admin', 'inspector'), 
  upload.single('image'), 
  uploadSingle
);

router.post('/multiple', 
  protect, 
  authorize('admin', 'inspector'), 
  upload.array('images', 10), 
  uploadMultiple
);

router.delete('/:publicId', 
  protect, 
  authorize('admin', 'inspector'), 
  deleteFile
);

module.exports = router;