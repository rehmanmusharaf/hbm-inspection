const mongoose = require('mongoose');
const User = require('../models/User.model');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

exports.createInspector = async (req, res, next) => {
  try {
    // Only admin can create inspectors
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can create inspector accounts'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Create inspector account
    const inspector = await User.create({
      name,
      email,
      password,
      phone,
      role: 'inspector',
      isEmailVerified: true, // Auto-verify inspector accounts
      isActive: true,
      address: address || {},
      createdBy: req.user.id
    });

    // Send welcome email to inspector
    try {
      const message = `
        Welcome to HBM Car Inspection System!
        
        Your inspector account has been created by the administrator.
        
        Login Credentials:
        Email: ${email}
        Password: ${password}
        
        Please login at: ${process.env.FRONTEND_URL}/login
        
        Important: Please change your password after first login for security.
        
        Best regards,
        HBM Inspection Team
      `;

      await sendEmail({
        email: inspector.email,
        subject: 'Inspector Account Created - HBM Car Inspection',
        message
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    // Don't send password in response
    const inspectorData = inspector.toObject();
    delete inspectorData.password;

    res.status(201).json({
      success: true,
      message: 'Inspector account created successfully',
      data: inspectorData
    });
  } catch (error) {
    next(error);
  }
};

exports.getInspectors = async (req, res, next) => {
  try {
    // Only admin can view all inspectors
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { role: 'inspector' };

    if (req.query.search) {
      query.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { email: new RegExp(req.query.search, 'i') },
        { phone: new RegExp(req.query.search, 'i') }
      ];
    }

    if (req.query.status === 'active') {
      query.isActive = true;
    } else if (req.query.status === 'inactive') {
      query.isActive = false;
    }

    const inspectors = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: inspectors,
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

exports.updateInspector = async (req, res, next) => {
  try {
    // Only admin can update inspector details
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.password;
    delete updateData.role;
    delete updateData.email; // Email shouldn't be changed

    const inspector = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!inspector) {
      return res.status(404).json({
        success: false,
        message: 'Inspector not found'
      });
    }

    res.status(200).json({
      success: true,
      data: inspector
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleInspectorStatus = async (req, res, next) => {
  try {
    // Only admin can activate/deactivate inspectors
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { id } = req.params;

    const inspector = await User.findById(id);

    if (!inspector || inspector.role !== 'inspector') {
      return res.status(404).json({
        success: false,
        message: 'Inspector not found'
      });
    }

    inspector.isActive = !inspector.isActive;
    await inspector.save();

    res.status(200).json({
      success: true,
      message: `Inspector ${inspector.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: inspector._id,
        isActive: inspector.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.resetInspectorPassword = async (req, res, next) => {
  try {
    // Only admin can reset inspector passwords
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const inspector = await User.findById(id);

    if (!inspector || inspector.role !== 'inspector') {
      return res.status(404).json({
        success: false,
        message: 'Inspector not found'
      });
    }

    inspector.password = newPassword;
    await inspector.save();

    // Send email notification
    try {
      const message = `
        Your password has been reset by the administrator.
        
        New Password: ${newPassword}
        
        Please login and change your password immediately for security.
        
        Login at: ${process.env.FRONTEND_URL}/login
      `;

      await sendEmail({
        email: inspector.email,
        subject: 'Password Reset - HBM Car Inspection',
        message
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Inspector password reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.getInspectorStats = async (req, res, next) => {
  try {
    // Admin can view any inspector's stats, inspector can view their own
    const { id } = req.params;
    
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const InspectionReport = require('../models/InspectionReport.model');
    const Booking = require('../models/Booking.model');

    const [
      totalInspections,
      publishedInspections,
      pendingBookings,
      completedBookings,
      averageRating
    ] = await Promise.all([
      InspectionReport.countDocuments({ inspector: id }),
      InspectionReport.countDocuments({ inspector: id, isPublished: true }),
      Booking.countDocuments({ inspector: id, status: 'confirmed' }),
      Booking.countDocuments({ inspector: id, status: 'completed' }),
      InspectionReport.aggregate([
        { $match: { inspector: mongoose.Types.ObjectId(id) } },
        { $group: { _id: null, avgRating: { $avg: '$overallRating' } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalInspections,
        publishedInspections,
        unpublishedInspections: totalInspections - publishedInspections,
        pendingBookings,
        completedBookings,
        averageRating: averageRating[0]?.avgRating || 0
      }
    });
  } catch (error) {
    next(error);
  }
};