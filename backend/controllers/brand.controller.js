const Brand = require('../models/Brand.model');
const CarModel = require('../models/CarModel.model');
const { validationResult } = require('express-validator');

// Create a new brand
exports.createBrand = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const existingBrand = await Brand.findOne({ name: req.body.name });
    if (existingBrand) {
      return res.status(400).json({
        success: false,
        message: 'Brand already exists'
      });
    }

    const brand = new Brand(req.body);
    await brand.save();

    res.status(201).json({
      success: true,
      data: brand,
      message: 'Brand created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get all brands
exports.getBrands = async (req, res, next) => {
  try {
    const { active, search, withCount } = req.query;
    
    let query = {};
    
    if (active !== undefined) {
      query.isActive = active === 'true';
    }
    
    if (search) {
      query.name = new RegExp(search, 'i');
    }

    let brandsQuery = Brand.find(query).sort({ order: 1, name: 1 });
    
    if (withCount === 'true') {
      brandsQuery = brandsQuery.populate('modelsCount');
    }

    const brands = await brandsQuery;

    res.status(200).json({
      success: true,
      data: brands,
      count: brands.length
    });
  } catch (error) {
    next(error);
  }
};

// Get single brand
exports.getBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id);
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    // Get models count
    const modelsCount = await CarModel.countDocuments({ brand: brand._id });

    res.status(200).json({
      success: true,
      data: {
        ...brand.toObject(),
        modelsCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update brand
exports.updateBrand = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    res.status(200).json({
      success: true,
      data: brand,
      message: 'Brand updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete brand
exports.deleteBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id);
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    // Check if brand has models
    const modelsCount = await CarModel.countDocuments({ brand: brand._id });
    
    if (modelsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete brand. ${modelsCount} model(s) are associated with this brand.`
      });
    }

    await brand.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Brand deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get brands with their models
exports.getBrandsWithModels = async (req, res, next) => {
  try {
    const brands = await Brand.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();

    const brandsWithModels = await Promise.all(
      brands.map(async (brand) => {
        const models = await CarModel.find({ 
          brand: brand._id, 
          isActive: true 
        })
        .select('name category year engineCapacity fuelType transmission')
        .sort({ name: 1 })
        .lean();

        return {
          ...brand,
          models
        };
      })
    );

    res.status(200).json({
      success: true,
      data: brandsWithModels
    });
  } catch (error) {
    next(error);
  }
};