const InspectionReport = require('../models/InspectionReport.model');
const Car = require('../models/Car.model');
const Booking = require('../models/Booking.model');
const { validationResult } = require('express-validator');
const { generateInspectionPDF } = require('../utils/pdfGenerator');

exports.createInspectionReport = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const car = await Car.findById(req.body.car);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    const reportData = {
      ...req.body,
      inspector: req.user.id,
      inspectionDate: new Date()
    };

    // Ensure overallRating is a valid number
    if (reportData.overallRating) {
      const rating = parseFloat(reportData.overallRating);
      if (isNaN(rating) || rating < 0 || rating > 10) {
        return res.status(400).json({
          success: false,
          message: 'Overall rating must be a number between 0 and 10'
        });
      }
      reportData.overallRating = rating;
    }

    const report = new InspectionReport(reportData);
    if (report.calculateOverallRating) {
      report.calculateOverallRating();
    }
    await report.save();

    await report.populate([
      { path: 'car', populate: { path: 'owner', select: 'name email phone' } },
      { path: 'inspector', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

exports.getInspectionReports = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (req.user.role === 'user') {
      const userCars = await Car.find({ owner: req.user.id }).select('_id');
      query.car = { $in: userCars.map(car => car._id) };
    } else if (req.user.role === 'inspector') {
      query.inspector = req.user.id;
    }

    if (req.query.status) {
      if (req.query.status === 'published') {
        query.isPublished = true;
      } else if (req.query.status === 'draft') {
        query.isPublished = false;
      }
    }

    if (req.query.search) {
      const cars = await Car.find({
        $or: [
          { registrationNo: new RegExp(req.query.search, 'i') },
          { make: new RegExp(req.query.search, 'i') },
          { model: new RegExp(req.query.search, 'i') }
        ]
      }).select('_id');
      
      query.car = { $in: cars.map(car => car._id) };
    }

    const reports = await InspectionReport.find(query)
      .populate([
        { path: 'car', populate: { path: 'owner', select: 'name email phone' } },
        { path: 'inspector', select: 'name email' }
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await InspectionReport.countDocuments(query);

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getInspectionReport = async (req, res, next) => {
  try {
    const report = await InspectionReport.findById(req.params.id)
      .populate([
        { 
          path: 'car', 
          populate: [
            { path: 'owner', select: 'name email phone' },
            { path: 'brand', select: 'name logo' },
            { path: 'carModel', select: 'name category' }
          ]
        },
        { path: 'inspector', select: 'name email' },
        { path: 'carParts' }
      ]);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Inspection report not found'
      });
    }

    // Check authorization - admins can access all reports
    if (req.user.role === 'admin') {
      // Admins can access all reports
    } else if (req.user.role === 'user') {
      // Users can only access their own car reports
      if (!report.car?.owner) {
        return res.status(403).json({
          success: false,
          message: 'Car owner information not found'
        });
      }
      const carOwnerId = report.car.owner._id || report.car.owner;
      if (carOwnerId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this report'
        });
      }
    } else if (req.user.role === 'inspector') {
      // Inspectors can only access reports they created
      if (!report.inspector) {
        return res.status(403).json({
          success: false,
          message: 'Inspector information not found'
        });
      }
      const inspectorId = report.inspector._id || report.inspector;
      if (inspectorId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this report'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

exports.updateInspectionReport = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let report = await InspectionReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Inspection report not found'
      });
    }

    if (req.user.role === 'inspector' && report.inspector.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this report'
      });
    }

    if (report.isPublished && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update published report'
      });
    }

    report = await InspectionReport.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'car', populate: { path: 'owner', select: 'name email phone' } },
      { path: 'inspector', select: 'name email' }
    ]);

    if (report.calculateOverallRating) {
      report.calculateOverallRating();
    }
    await report.save();

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

exports.publishReport = async (req, res, next) => {
  try {
    const report = await InspectionReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Inspection report not found'
      });
    }

    if (req.user.role === 'inspector' && report.inspector.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to publish this report'
      });
    }

    report.isPublished = true;
    report.publishedAt = new Date();
    await report.save();

    await report.populate([
      { path: 'car', populate: { path: 'owner', select: 'name email phone' } },
      { path: 'inspector', select: 'name email' }
    ]);

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

exports.getPublicReport = async (req, res, next) => {
  try {
    const { shareableLink } = req.params;

    const report = await InspectionReport.findOne({
      shareableLink: shareableLink,
      isPublished: true
    }).populate([
      { 
        path: 'car',
        populate: [
          { path: 'brand', select: 'name logo' },
          { path: 'carModel', select: 'name category' }
        ]
      },
      { path: 'inspector', select: 'name' },
      { path: 'carParts' }
    ]);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found or not published'
      });
    }

    report.viewCount += 1;
    report.lastViewedAt = new Date();
    await report.save();

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

exports.getPublicReportByLink = async (req, res, next) => {
  try {
    const { link } = req.params;

    const report = await InspectionReport.findOne({
      shareableLink: link,
      isPublished: true
    }).populate([
      { path: 'car' },
      { path: 'inspector', select: 'name' }
    ]);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found or not published'
      });
    }

    report.viewCount += 1;
    report.lastViewedAt = new Date();
    await report.save();

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteInspectionReport = async (req, res, next) => {
  try {
    const report = await InspectionReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Inspection report not found'
      });
    }

    if (req.user.role !== 'admin' && report.inspector.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this report'
      });
    }

    await InspectionReport.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Inspection report deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.downloadReportPDF = async (req, res, next) => {
  try {
    const { shareableLink } = req.params;

    const report = await InspectionReport.findOne({
      shareableLink: shareableLink,
      isPublished: true
    }).populate([
      { path: 'car' },
      { path: 'inspector', select: 'name' }
    ]);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found or not published. The report must be published before it can be downloaded.'
      });
    }

    const pdfBuffer = await generateInspectionPDF(report);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="inspection-report-${report.reportNumber}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};