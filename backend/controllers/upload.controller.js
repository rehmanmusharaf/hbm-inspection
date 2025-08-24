const { addWatermark, deleteImage } = require('../config/cloudinary');

exports.uploadSingle = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { addWatermark: shouldWatermark } = req.body;
    
    let imageUrl = req.file.path;
    
    if (shouldWatermark === 'true') {
      const watermarkedUrl = await addWatermark(req.file.filename);
      if (watermarkedUrl) {
        imageUrl = watermarkedUrl;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        url: imageUrl,
        publicId: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        format: req.file.format
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadMultiple = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const { addWatermark: shouldWatermark } = req.body;
    const uploadedFiles = [];

    for (const file of req.files) {
      let imageUrl = file.path;
      
      if (shouldWatermark === 'true') {
        const watermarkedUrl = await addWatermark(file.filename);
        if (watermarkedUrl) {
          imageUrl = watermarkedUrl;
        }
      }

      uploadedFiles.push({
        url: imageUrl,
        publicId: file.filename,
        originalName: file.originalname,
        size: file.size,
        format: file.format
      });
    }

    res.status(200).json({
      success: true,
      data: uploadedFiles
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteFile = async (req, res, next) => {
  try {
    const { publicId } = req.params;
    
    const result = await deleteImage(publicId);
    
    if (!result || result.result !== 'ok') {
      return res.status(400).json({
        success: false,
        message: 'Failed to delete file'
      });
    }

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};