const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'car-inspection',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
    transformation: [
      { width: 1200, height: 800, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Please upload only images or PDF files'), false);
    }
  }
});

const addWatermark = async (publicId, watermarkText = 'Car Inspection Report') => {
  try {
    const watermarkedUrl = cloudinary.url(publicId, {
      overlay: {
        text: watermarkText,
        font_family: 'Arial',
        font_size: 40,
        font_weight: 'bold',
        color: 'white'
      },
      gravity: 'south_east',
      x: 20,
      y: 20,
      opacity: 70
    });
    
    return watermarkedUrl;
  } catch (error) {
    console.error('Watermark error:', error);
    return null;
  }
};

const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Delete image error:', error);
    return null;
  }
};

module.exports = {
  cloudinary,
  upload,
  addWatermark,
  deleteImage
};