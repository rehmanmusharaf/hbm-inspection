const Car = require('../models/Car.model');
const { validationResult } = require('express-validator');

exports.createCar = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const carData = { ...req.body, owner: req.user.id };
    const car = await Car.create(carData);

    res.status(201).json({
      success: true,
      data: car
    });
  } catch (error) {
    next(error);
  }
};

exports.getCars = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = { isDeleted: false };
    
    if (req.user.role === 'user') {
      query.owner = req.user.id;
    }

    if (req.query.search) {
      query.$or = [
        { registrationNo: new RegExp(req.query.search, 'i') },
        { make: new RegExp(req.query.search, 'i') },
        { model: new RegExp(req.query.search, 'i') }
      ];
    }

    const cars = await Car.find(query)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Car.countDocuments(query);

    res.status(200).json({
      success: true,
      data: cars,
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

exports.getCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id).populate('owner', 'name email phone');

    if (!car || car.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    if (req.user.role === 'user' && car.owner._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this car'
      });
    }

    res.status(200).json({
      success: true,
      data: car
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCar = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let car = await Car.findById(req.params.id);

    if (!car || car.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    if (req.user.role === 'user' && car.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this car'
      });
    }

    car = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('owner', 'name email phone');

    res.status(200).json({
      success: true,
      data: car
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car || car.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    if (req.user.role === 'user' && car.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this car'
      });
    }

    car.isDeleted = true;
    await car.save();

    res.status(200).json({
      success: true,
      message: 'Car deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};