const CarPartTemplate = require('../models/CarPartTemplate.model');

// @desc    Get all car part templates
// @route   GET /api/car-part-templates
// @access  Public
exports.getCarPartTemplates = async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = { isActive: true };
    if (category) {
      query.category = category;
    }

    const templates = await CarPartTemplate.find(query)
      .sort({ category: 1, sortOrder: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get car part templates by category
// @route   GET /api/car-part-templates/category/:category
// @access  Public
exports.getTemplatesByCategory = async (req, res) => {
  try {
    const templates = await CarPartTemplate.find({
      category: req.params.category,
      isActive: true
    }).sort({ sortOrder: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create car part template
// @route   POST /api/car-part-templates
// @access  Private (Admin only)
exports.createTemplate = async (req, res) => {
  try {
    const template = await CarPartTemplate.create(req.body);

    res.status(201).json({
      success: true,
      data: template
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update car part template
// @route   PUT /api/car-part-templates/:id
// @access  Private (Admin only)
exports.updateTemplate = async (req, res) => {
  try {
    const template = await CarPartTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete car part template
// @route   DELETE /api/car-part-templates/:id
// @access  Private (Admin only)
exports.deleteTemplate = async (req, res) => {
  try {
    const template = await CarPartTemplate.findByIdAndDelete(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Seed default car part templates
// @route   POST /api/car-part-templates/seed
// @access  Private (Admin only)
exports.seedTemplates = async (req, res) => {
  try {
    // Delete existing templates
    await CarPartTemplate.deleteMany({});

    const defaultTemplates = [
      // Exterior Parts
      { name: 'Front Bumper', category: 'exterior', subCategory: 'body', sortOrder: 1 },
      { name: 'Rear Bumper', category: 'exterior', subCategory: 'body', sortOrder: 2 },
      { name: 'Hood', category: 'exterior', subCategory: 'body', sortOrder: 3 },
      { name: 'Roof', category: 'exterior', subCategory: 'body', sortOrder: 4 },
      { name: 'Trunk/Boot', category: 'exterior', subCategory: 'body', sortOrder: 5 },
      { name: 'Front Left Door', category: 'exterior', subCategory: 'doors', sortOrder: 6 },
      { name: 'Front Right Door', category: 'exterior', subCategory: 'doors', sortOrder: 7 },
      { name: 'Rear Left Door', category: 'exterior', subCategory: 'doors', sortOrder: 8 },
      { name: 'Rear Right Door', category: 'exterior', subCategory: 'doors', sortOrder: 9 },
      { name: 'Left Side Mirror', category: 'exterior', subCategory: 'mirrors', sortOrder: 10 },
      { name: 'Right Side Mirror', category: 'exterior', subCategory: 'mirrors', sortOrder: 11 },
      { name: 'Front Left Fender', category: 'exterior', subCategory: 'body', sortOrder: 12 },
      { name: 'Front Right Fender', category: 'exterior', subCategory: 'body', sortOrder: 13 },
      { name: 'Rear Left Fender', category: 'exterior', subCategory: 'body', sortOrder: 14 },
      { name: 'Rear Right Fender', category: 'exterior', subCategory: 'body', sortOrder: 15 },
      { name: 'Windshield', category: 'exterior', subCategory: 'glass', sortOrder: 16 },
      { name: 'Rear Window', category: 'exterior', subCategory: 'glass', sortOrder: 17 },
      { name: 'Front Left Window', category: 'exterior', subCategory: 'glass', sortOrder: 18 },
      { name: 'Front Right Window', category: 'exterior', subCategory: 'glass', sortOrder: 19 },
      { name: 'Rear Left Window', category: 'exterior', subCategory: 'glass', sortOrder: 20 },
      { name: 'Rear Right Window', category: 'exterior', subCategory: 'glass', sortOrder: 21 },
      { name: 'Front Left Headlight', category: 'exterior', subCategory: 'lights', sortOrder: 22 },
      { name: 'Front Right Headlight', category: 'exterior', subCategory: 'lights', sortOrder: 23 },
      { name: 'Rear Left Taillight', category: 'exterior', subCategory: 'lights', sortOrder: 24 },
      { name: 'Rear Right Taillight', category: 'exterior', subCategory: 'lights', sortOrder: 25 },

      // Interior Parts
      { name: 'Driver Seat', category: 'interior', subCategory: 'seats', sortOrder: 1 },
      { name: 'Passenger Seat', category: 'interior', subCategory: 'seats', sortOrder: 2 },
      { name: 'Rear Left Seat', category: 'interior', subCategory: 'seats', sortOrder: 3 },
      { name: 'Rear Right Seat', category: 'interior', subCategory: 'seats', sortOrder: 4 },
      { name: 'Dashboard', category: 'interior', subCategory: 'dashboard', sortOrder: 5 },
      { name: 'Steering Wheel', category: 'interior', subCategory: 'controls', sortOrder: 6 },
      { name: 'Gear Shifter', category: 'interior', subCategory: 'controls', sortOrder: 7 },
      { name: 'Handbrake', category: 'interior', subCategory: 'controls', sortOrder: 8 },
      { name: 'Center Console', category: 'interior', subCategory: 'dashboard', sortOrder: 9 },
      { name: 'Glove Box', category: 'interior', subCategory: 'storage', sortOrder: 10 },
      { name: 'Air Conditioning System', category: 'interior', subCategory: 'hvac', sortOrder: 11 },
      { name: 'Infotainment System', category: 'interior', subCategory: 'electronics', sortOrder: 12 },
      { name: 'Interior Lights', category: 'interior', subCategory: 'lights', sortOrder: 13 },
      { name: 'Floor Carpets', category: 'interior', subCategory: 'flooring', sortOrder: 14 },
      { name: 'Door Panels', category: 'interior', subCategory: 'doors', sortOrder: 15 },

      // Engine Parts
      { name: 'Engine Block', category: 'engine', subCategory: 'core', sortOrder: 1 },
      { name: 'Engine Oil', category: 'engine', subCategory: 'fluids', sortOrder: 2 },
      { name: 'Coolant System', category: 'engine', subCategory: 'cooling', sortOrder: 3 },
      { name: 'Radiator', category: 'engine', subCategory: 'cooling', sortOrder: 4 },
      { name: 'Air Filter', category: 'engine', subCategory: 'intake', sortOrder: 5 },
      { name: 'Fuel System', category: 'engine', subCategory: 'fuel', sortOrder: 6 },
      { name: 'Exhaust System', category: 'engine', subCategory: 'exhaust', sortOrder: 7 },
      { name: 'Timing Belt', category: 'engine', subCategory: 'belts', sortOrder: 8 },
      { name: 'Serpentine Belt', category: 'engine', subCategory: 'belts', sortOrder: 9 },
      { name: 'Spark Plugs', category: 'engine', subCategory: 'ignition', sortOrder: 10 },

      // Transmission Parts
      { name: 'Transmission Fluid', category: 'transmission', subCategory: 'fluids', sortOrder: 1 },
      { name: 'Clutch System', category: 'transmission', subCategory: 'clutch', sortOrder: 2 },
      { name: 'Drive Shafts', category: 'transmission', subCategory: 'drivetrain', sortOrder: 3 },
      { name: 'CV Joints', category: 'transmission', subCategory: 'drivetrain', sortOrder: 4 },

      // Suspension Parts
      { name: 'Front Left Shock Absorber', category: 'suspension', subCategory: 'shocks', sortOrder: 1 },
      { name: 'Front Right Shock Absorber', category: 'suspension', subCategory: 'shocks', sortOrder: 2 },
      { name: 'Rear Left Shock Absorber', category: 'suspension', subCategory: 'shocks', sortOrder: 3 },
      { name: 'Rear Right Shock Absorber', category: 'suspension', subCategory: 'shocks', sortOrder: 4 },
      { name: 'Front Springs', category: 'suspension', subCategory: 'springs', sortOrder: 5 },
      { name: 'Rear Springs', category: 'suspension', subCategory: 'springs', sortOrder: 6 },
      { name: 'Control Arms', category: 'suspension', subCategory: 'arms', sortOrder: 7 },
      { name: 'Ball Joints', category: 'suspension', subCategory: 'joints', sortOrder: 8 },

      // Brake Parts
      { name: 'Front Brake Pads', category: 'brakes', subCategory: 'pads', sortOrder: 1 },
      { name: 'Rear Brake Pads', category: 'brakes', subCategory: 'pads', sortOrder: 2 },
      { name: 'Front Brake Discs', category: 'brakes', subCategory: 'discs', sortOrder: 3 },
      { name: 'Rear Brake Discs', category: 'brakes', subCategory: 'discs', sortOrder: 4 },
      { name: 'Brake Fluid', category: 'brakes', subCategory: 'fluids', sortOrder: 5 },
      { name: 'Brake Lines', category: 'brakes', subCategory: 'lines', sortOrder: 6 },
      { name: 'Parking Brake', category: 'brakes', subCategory: 'parking', sortOrder: 7 },

      // Wheels & Tires
      { name: 'Front Left Tire', category: 'wheels', subCategory: 'tires', sortOrder: 1 },
      { name: 'Front Right Tire', category: 'wheels', subCategory: 'tires', sortOrder: 2 },
      { name: 'Rear Left Tire', category: 'wheels', subCategory: 'tires', sortOrder: 3 },
      { name: 'Rear Right Tire', category: 'wheels', subCategory: 'tires', sortOrder: 4 },
      { name: 'Spare Tire', category: 'wheels', subCategory: 'tires', sortOrder: 5 },
      { name: 'Front Left Wheel Rim', category: 'wheels', subCategory: 'rims', sortOrder: 6 },
      { name: 'Front Right Wheel Rim', category: 'wheels', subCategory: 'rims', sortOrder: 7 },
      { name: 'Rear Left Wheel Rim', category: 'wheels', subCategory: 'rims', sortOrder: 8 },
      { name: 'Rear Right Wheel Rim', category: 'wheels', subCategory: 'rims', sortOrder: 9 },

      // Electrical Parts
      { name: 'Battery', category: 'electrical', subCategory: 'power', sortOrder: 1 },
      { name: 'Alternator', category: 'electrical', subCategory: 'charging', sortOrder: 2 },
      { name: 'Starter Motor', category: 'electrical', subCategory: 'starting', sortOrder: 3 },
      { name: 'Wiring Harness', category: 'electrical', subCategory: 'wiring', sortOrder: 4 },
      { name: 'Fuses', category: 'electrical', subCategory: 'protection', sortOrder: 5 },

      // Safety Parts
      { name: 'Driver Airbag', category: 'safety', subCategory: 'airbags', sortOrder: 1 },
      { name: 'Passenger Airbag', category: 'safety', subCategory: 'airbags', sortOrder: 2 },
      { name: 'Side Airbags', category: 'safety', subCategory: 'airbags', sortOrder: 3 },
      { name: 'Seat Belts', category: 'safety', subCategory: 'restraints', sortOrder: 4 },
      { name: 'ABS System', category: 'safety', subCategory: 'braking', sortOrder: 5 },
      { name: 'Stability Control', category: 'safety', subCategory: 'control', sortOrder: 6 }
    ];

    const templates = await CarPartTemplate.insertMany(defaultTemplates);

    res.status(201).json({
      success: true,
      message: `${templates.length} templates created successfully`,
      data: templates
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};