const mongoose = require('mongoose');

const carPartTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'exterior', 'interior', 'engine', 'transmission', 
      'suspension', 'brakes', 'wheels', 'electrical', 'safety'
    ]
  },
  subCategory: {
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
  sortOrder: {
    type: Number,
    default: 0
  },
  commonIssues: [{
    type: String,
    description: String
  }],
  inspectionPoints: [String] // What to check for this part
}, {
  timestamps: true
});

// Index for faster queries
carPartTemplateSchema.index({ category: 1, sortOrder: 1 });
carPartTemplateSchema.index({ name: 1 });
carPartTemplateSchema.index({ isActive: 1 });

module.exports = mongoose.model('CarPartTemplate', carPartTemplateSchema);