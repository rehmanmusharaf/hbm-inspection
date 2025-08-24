const Booking = require('../models/Booking.model');
const Car = require('../models/Car.model');
const User = require('../models/User.model');
const { validationResult } = require('express-validator');
const sendEmail = require('../utils/sendEmail');

exports.createBooking = async (req, res, next) => {
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

    if (req.user.role === 'user' && car.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to book inspection for this car'
      });
    }

    const bookingData = {
      ...req.body,
      user: req.user.id
    };

    const booking = await Booking.create(bookingData);
    
    await booking.populate([
      { path: 'user', select: 'name email phone' },
      { path: 'car' },
      { path: 'inspector', select: 'name email phone' }
    ]);

    try {
      await sendEmail({
        email: booking.user.email,
        subject: 'Booking Confirmation - Car Inspection',
        message: `
          Dear ${booking.user.name},
          
          Your car inspection has been booked successfully.
          
          Booking Details:
          - Booking Number: ${booking.bookingNumber}
          - Car: ${booking.car.make} ${booking.car.model} (${booking.car.registrationNo})
          - Date: ${new Date(booking.scheduledDate).toLocaleDateString()}
          - Time: ${booking.scheduledTime}
          - Amount: $${booking.amount}
          
          We will contact you shortly to confirm the details.
          
          Thank you for choosing our service!
        `
      });
    } catch (emailError) {
      console.error('Booking confirmation email failed:', emailError);
    }

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

exports.getBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (req.user.role === 'user') {
      query.user = req.user.id;
    } else if (req.user.role === 'inspector') {
      query.inspector = req.user.id;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.date) {
      const startDate = new Date(req.query.date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      query.scheduledDate = {
        $gte: startDate,
        $lt: endDate
      };
    }

    const bookings = await Booking.find(query)
      .populate([
        { path: 'user', select: 'name email phone' },
        { path: 'car' },
        { path: 'inspector', select: 'name email phone' },
        { path: 'inspectionReport' }
      ])
      .sort({ scheduledDate: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      data: bookings,
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

exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate([
        { path: 'user', select: 'name email phone' },
        { path: 'car' },
        { path: 'inspector', select: 'name email phone' },
        { path: 'inspectionReport' }
      ]);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (req.user.role === 'user' && booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    } else if (req.user.role === 'inspector' && booking.inspector?._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

exports.updateBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (req.user.role === 'user' && booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'user', select: 'name email phone' },
      { path: 'car' },
      { path: 'inspector', select: 'name email phone' },
      { path: 'inspectionReport' }
    ]);

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

exports.assignInspector = async (req, res, next) => {
  try {
    const { inspectorId } = req.body;
    
    const inspector = await User.findOne({ 
      _id: inspectorId, 
      role: { $in: ['inspector', 'admin'] } 
    });
    
    if (!inspector) {
      return res.status(404).json({
        success: false,
        message: 'Inspector not found'
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        inspector: inspectorId,
        status: 'confirmed'
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'user', select: 'name email phone' },
      { path: 'car' },
      { path: 'inspector', select: 'name email phone' }
    ]);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    try {
      await sendEmail({
        email: booking.user.email,
        subject: 'Inspector Assigned - Car Inspection',
        message: `
          Dear ${booking.user.name},
          
          An inspector has been assigned to your booking.
          
          Inspector Details:
          - Name: ${booking.inspector.name}
          - Email: ${booking.inspector.email}
          - Phone: ${booking.inspector.phone}
          
          Booking Details:
          - Booking Number: ${booking.bookingNumber}
          - Date: ${new Date(booking.scheduledDate).toLocaleDateString()}
          - Time: ${booking.scheduledTime}
          
          The inspector will contact you soon to coordinate the inspection.
        `
      });
    } catch (emailError) {
      console.error('Inspector assignment email failed:', emailError);
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (req.user.role === 'user' && booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed booking'
      });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date();
    booking.cancelledBy = req.user.id;
    
    await booking.save();
    
    await booking.populate([
      { path: 'user', select: 'name email phone' },
      { path: 'car' },
      { path: 'inspector', select: 'name email phone' }
    ]);

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};