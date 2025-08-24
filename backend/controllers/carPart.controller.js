const CarPart = require('../models/CarPart.model');
const InspectionReport = require('../models/InspectionReport.model');
const { cloudinary } = require('../config/cloudinary');

// @desc    Add car part to inspection
// @route   POST /api/car-parts
// @access  Private
exports.addCarPart = async (req, res) => {
  try {
    const { inspectionReportId, ...partData } = req.body;

    // Parse issues if it's a JSON string
    if (partData.issues && typeof partData.issues === 'string') {
      try {
        partData.issues = JSON.parse(partData.issues);
      } catch (e) {
        console.error('Error parsing issues:', e);
        partData.issues = [];
      }
    }

    // Verify inspection report exists and user has access
    const inspectionReport = await InspectionReport.findById(inspectionReportId).populate({
      path: 'car',
      populate: { path: 'owner', select: '_id' }
    });
    if (!inspectionReport) {
      return res.status(404).json({
        success: false,
        message: 'Inspection report not found'
      });
    }

    // Check if user is authorized (inspector who created it, car owner, or admin)
    const isInspector = inspectionReport.inspector.toString() === req.user._id.toString();
    const isCarOwner = inspectionReport.car?.owner?._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isInspector && !isCarOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add parts to this inspection'
      });
    }

    // Create car part
    const carPart = await CarPart.create({
      inspectionReport: inspectionReportId,
      ...partData,
      inspectedBy: req.user._id
    });

    // Handle image uploads if files are present
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => 
        new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: `inspections/${inspectionReportId}/parts/${carPart._id}`,
              transformation: [
                { width: 1200, height: 800, crop: 'limit' },
                { quality: 'auto:good' }
              ]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(file.buffer);
        })
      );

      const results = await Promise.all(uploadPromises);

      const images = results.map((result, index) => ({
        url: result.secure_url,
        publicId: result.public_id,
        caption: req.body.captions ? req.body.captions[index] : '',
        angle: req.body.angles ? req.body.angles[index] : 'overview'
      }));

      carPart.images = images;
      await carPart.save();
    }

    // Add part reference to inspection report
    inspectionReport.carParts.push(carPart._id);
    await inspectionReport.save();

    res.status(201).json({
      success: true,
      data: carPart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload images for car part
// @route   POST /api/car-parts/:id/images
// @access  Private
exports.uploadPartImages = async (req, res) => {
  try {
    const carPart = await CarPart.findById(req.params.id);
    
    if (!carPart) {
      return res.status(404).json({
        success: false,
        message: 'Car part not found'
      });
    }

    // Check authorization
    const inspectionReport = await InspectionReport.findById(carPart.inspectionReport).populate({
      path: 'car',
      populate: { path: 'owner', select: '_id' }
    });
    
    const isInspector = inspectionReport.inspector.toString() === req.user._id.toString();
    const isCarOwner = inspectionReport.car?.owner?._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isInspector && !isCarOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload images for this part'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one image'
      });
    }

    const uploadPromises = req.files.map(file => 
      new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `inspections/${carPart.inspectionReport}/parts/${carPart._id}`,
            transformation: [
              { width: 1200, height: 800, crop: 'limit' },
              { quality: 'auto:good' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      })
    );

    const results = await Promise.all(uploadPromises);

    const images = results.map((result, index) => ({
      url: result.secure_url,
      publicId: result.public_id,
      caption: req.body.captions ? req.body.captions[index] : '',
      angle: req.body.angles ? req.body.angles[index] : 'overview'
    }));

    carPart.images.push(...images);
    await carPart.save();

    res.status(200).json({
      success: true,
      data: carPart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update car part
// @route   PUT /api/car-parts/:id
// @access  Private
exports.updateCarPart = async (req, res) => {
  try {
    let carPart = await CarPart.findById(req.params.id);
    
    if (!carPart) {
      return res.status(404).json({
        success: false,
        message: 'Car part not found'
      });
    }

    // Check authorization
    const inspectionReport = await InspectionReport.findById(carPart.inspectionReport).populate({
      path: 'car',
      populate: { path: 'owner', select: '_id' }
    });
    
    const isInspector = inspectionReport.inspector.toString() === req.user._id.toString();
    const isCarOwner = inspectionReport.car?.owner?._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isInspector && !isCarOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this part'
      });
    }

    // Parse issues if it's a JSON string
    const updateData = { ...req.body };
    if (updateData.issues && typeof updateData.issues === 'string') {
      try {
        updateData.issues = JSON.parse(updateData.issues);
      } catch (e) {
        console.error('Error parsing issues:', e);
        updateData.issues = [];
      }
    }

    // Handle image uploads if files are present
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => 
        new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: `inspections/${carPart.inspectionReport}/parts/${carPart._id}`,
              transformation: [
                { width: 1200, height: 800, crop: 'limit' },
                { quality: 'auto:good' }
              ]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(file.buffer);
        })
      );

      const results = await Promise.all(uploadPromises);

      const newImages = results.map((result, index) => ({
        url: result.secure_url,
        publicId: result.public_id,
        caption: req.body.captions ? req.body.captions[index] : '',
        angle: req.body.angles ? req.body.angles[index] : 'overview'
      }));

      // Add new images to existing ones
      updateData.images = [...(carPart.images || []), ...newImages];
    }

    carPart = await CarPart.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: carPart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete car part
// @route   DELETE /api/car-parts/:id
// @access  Private
exports.deleteCarPart = async (req, res) => {
  try {
    const carPart = await CarPart.findById(req.params.id);
    
    if (!carPart) {
      return res.status(404).json({
        success: false,
        message: 'Car part not found'
      });
    }

    // Check authorization
    const inspectionReport = await InspectionReport.findById(carPart.inspectionReport).populate({
      path: 'car',
      populate: { path: 'owner', select: '_id' }
    });
    
    const isInspector = inspectionReport.inspector.toString() === req.user._id.toString();
    const isCarOwner = inspectionReport.car?.owner?._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isInspector && !isCarOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this part'
      });
    }

    // Delete images from cloudinary
    if (carPart.images && carPart.images.length > 0) {
      const deletePromises = carPart.images
        .filter(img => img.publicId)
        .map(img => cloudinary.uploader.destroy(img.publicId));
      await Promise.all(deletePromises);
    }

    // Remove part reference from inspection report
    inspectionReport.carParts = inspectionReport.carParts.filter(
      partId => partId.toString() !== req.params.id
    );
    await inspectionReport.save();

    // Delete the part
    await carPart.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Car part deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get car parts for inspection
// @route   GET /api/car-parts/inspection/:inspectionId
// @access  Private
exports.getInspectionParts = async (req, res) => {
  try {
    const carParts = await CarPart.find({ 
      inspectionReport: req.params.inspectionId 
    }).sort('category partName');

    res.status(200).json({
      success: true,
      count: carParts.length,
      data: carParts
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single car part
// @route   GET /api/car-parts/:id
// @access  Private
exports.getCarPart = async (req, res) => {
  try {
    const carPart = await CarPart.findById(req.params.id)
      .populate('inspectedBy', 'name email');

    if (!carPart) {
      return res.status(404).json({
        success: false,
        message: 'Car part not found'
      });
    }

    res.status(200).json({
      success: true,
      data: carPart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete image from car part
// @route   DELETE /api/car-parts/:id/images/:imageId
// @access  Private
exports.deletePartImage = async (req, res) => {
  try {
    const carPart = await CarPart.findById(req.params.id);
    
    if (!carPart) {
      return res.status(404).json({
        success: false,
        message: 'Car part not found'
      });
    }

    // Check authorization
    const inspectionReport = await InspectionReport.findById(carPart.inspectionReport).populate({
      path: 'car',
      populate: { path: 'owner', select: '_id' }
    });
    
    const isInspector = inspectionReport.inspector.toString() === req.user._id.toString();
    const isCarOwner = inspectionReport.car?.owner?._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isInspector && !isCarOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete images for this part'
      });
    }

    const image = carPart.images.id(req.params.imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Delete from cloudinary
    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId);
    }

    // Remove from database
    image.remove();
    await carPart.save();

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};