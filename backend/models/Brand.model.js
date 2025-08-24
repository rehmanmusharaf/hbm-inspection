const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Brand name is required'],
    unique: true,
    trim: true
  },
  logo: {
    type: String,
    default: null
  },
  country: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
brandSchema.index({ name: 1 });
brandSchema.index({ isActive: 1, order: 1 });

// Virtual for models count
brandSchema.virtual('modelsCount', {
  ref: 'CarModel',
  localField: '_id',
  foreignField: 'brand',
  count: true
});

// Ensure virtuals are included in JSON
brandSchema.set('toJSON', { virtuals: true });
brandSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Brand', brandSchema);