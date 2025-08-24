const CarModel = require('../models/CarModel.model');
const Brand = require('../models/Brand.model');
const { validationResult } = require('express-validator');

// Create a new car model
exports.createCarModel = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if brand exists
    const brand = await Brand.findById(req.body.brand);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    // Check if model already exists for this brand
    const existingModel = await CarModel.findOne({
      brand: req.body.brand,
      name: req.body.name
    });

    if (existingModel) {
      return res.status(400).json({
        success: false,
        message: 'This model already exists for the selected brand'
      });
    }

    const carModel = new CarModel(req.body);
    await carModel.save();
    await carModel.populate('brand', 'name logo');

    res.status(201).json({
      success: true,
      data: carModel,
      message: 'Car model created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get all car models
exports.getCarModels = async (req, res, next) => {
  try {
    const { 
      brand, 
      category, 
      fuelType, 
      transmission, 
      active, 
      search 
    } = req.query;

    let query = {};

    if (brand) {
      query.brand = brand;
    }

    if (category) {
      query.category = category;
    }

    if (fuelType) {
      query.fuelType = fuelType;
    }

    if (transmission) {
      query.transmission = transmission;
    }

    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    if (search) {
      query.name = new RegExp(search, 'i');
    }

    const carModels = await CarModel.find(query)
      .populate('brand', 'name logo')
      .sort({ 'brand.name': 1, name: 1 });

    res.status(200).json({
      success: true,
      data: carModels,
      count: carModels.length
    });
  } catch (error) {
    next(error);
  }
};

// Get models by brand
exports.getModelsByBrand = async (req, res, next) => {
  try {
    const { brandId } = req.params;
    const { active } = req.query;

    // Check if brand exists
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    let query = { brand: brandId };
    
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const models = await CarModel.find(query)
      .select('-brand')
      .sort({ popularityScore: -1, name: 1 });

    res.status(200).json({
      success: true,
      data: {
        brand: {
          _id: brand._id,
          name: brand.name,
          logo: brand.logo
        },
        models
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single car model
exports.getCarModel = async (req, res, next) => {
  try {
    const carModel = await CarModel.findById(req.params.id)
      .populate('brand');

    if (!carModel) {
      return res.status(404).json({
        success: false,
        message: 'Car model not found'
      });
    }

    res.status(200).json({
      success: true,
      data: carModel
    });
  } catch (error) {
    next(error);
  }
};

// Update car model
exports.updateCarModel = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // If brand is being updated, check if it exists
    if (req.body.brand) {
      const brand = await Brand.findById(req.body.brand);
      if (!brand) {
        return res.status(404).json({
          success: false,
          message: 'Brand not found'
        });
      }
    }

    const carModel = await CarModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('brand', 'name logo');

    if (!carModel) {
      return res.status(404).json({
        success: false,
        message: 'Car model not found'
      });
    }

    res.status(200).json({
      success: true,
      data: carModel,
      message: 'Car model updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete car model
exports.deleteCarModel = async (req, res, next) => {
  try {
    const carModel = await CarModel.findById(req.params.id);

    if (!carModel) {
      return res.status(404).json({
        success: false,
        message: 'Car model not found'
      });
    }

    // Check if model is used in any cars
    const Car = require('../models/Car.model');
    const carsCount = await Car.countDocuments({ 
      make: carModel.brand.toString(),
      model: carModel.name 
    });

    if (carsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete model. ${carsCount} car(s) are using this model.`
      });
    }

    await carModel.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Car model deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get all unique categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await CarModel.distinct('category');
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// Bulk create models for a brand
exports.bulkCreateModels = async (req, res, next) => {
  try {
    const { brandId } = req.params;
    const { models } = req.body;

    if (!models || !Array.isArray(models) || models.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Models array is required'
      });
    }

    // Check if brand exists
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    // Add brand ID to each model
    const modelsWithBrand = models.map(model => ({
      ...model,
      brand: brandId
    }));

    // Create models
    const createdModels = await CarModel.insertMany(modelsWithBrand, {
      ordered: false // Continue on error
    });

    res.status(201).json({
      success: true,
      data: createdModels,
      message: `${createdModels.length} models created successfully`
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Some models already exist for this brand'
      });
    }
    next(error);
  }
};