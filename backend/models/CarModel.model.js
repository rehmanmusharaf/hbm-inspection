const mongoose = require('mongoose');

const carModelSchema = new mongoose.Schema({
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: [true, 'Brand is required']
  },
  name: {
    type: String,
    required: [true, 'Model name is required'],
    trim: true
  },
  year: {
    start: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear() + 1
    },
    end: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear() + 1
    }
  },
  category: {
    type: String,
    enum: ['Hatchback', 'Sedan', 'SUV', 'Crossover', 'Pickup', 'Van', 'Coupe', 'Convertible', 'Wagon', 'Minivan', 'Truck', 'Other'],
    required: true
  },
  fuelType: [{
    type: String,
    enum: ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'CNG', 'LPG']
  }],
  transmission: [{
    type: String,
    enum: ['Manual', 'Automatic', 'CVT', 'DCT', 'AMT']
  }],
  engineCapacity: [{
    type: String // e.g., "1.0L", "1.3L", "1.5L", "2.0L"
  }],
  variants: [{
    name: String,
    features: [String]
  }],
  image: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  popularityScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for unique model per brand
carModelSchema.index({ brand: 1, name: 1 }, { unique: true });
carModelSchema.index({ brand: 1, isActive: 1 });
carModelSchema.index({ category: 1 });

// Pre-populate brand on find
carModelSchema.pre(/^find/, function() {
  this.populate({
    path: 'brand',
    select: 'name logo'
  });
});

module.exports = mongoose.model('CarModel', carModelSchema);