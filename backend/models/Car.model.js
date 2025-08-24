const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: [true, 'Please select a car brand']
  },
  carModel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarModel',
    required: [true, 'Please select a car model']
  },
  make: {
    type: String,
    required: [true, 'Please provide car make'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Please provide car model'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Please provide car year'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Invalid year']
  },
  variant: {
    type: String,
    trim: true
  },
  importDate: {
    type: Date
  },
  purchaseYear: {
    type: Number,
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear(), 'Invalid year']
  },
  registrationNo: {
    type: String,
    required: [true, 'Please provide registration number'],
    unique: true,
    uppercase: true,
    trim: true
  },
  chassisNo: {
    type: String,
    required: [true, 'Please provide chassis number'],
    unique: true,
    uppercase: true,
    trim: true
  },
  engineNo: {
    type: String,
    uppercase: true,
    trim: true
  },
  mileage: {
    type: Number,
    required: [true, 'Please provide current mileage'],
    min: [0, 'Mileage cannot be negative']
  },
  color: {
    type: String,
    trim: true
  },
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'hybrid', 'electric', 'cng', 'lpg'],
    required: true
  },
  transmissionType: {
    type: String,
    enum: ['manual', 'automatic', 'cvt', 'semi-automatic'],
    required: true
  },
  engineCapacity: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownershipHistory: [{
    ownerName: String,
    ownershipDuration: String,
    transferDate: Date
  }],
  images: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  documents: [{
    type: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

carSchema.index({ registrationNo: 1, chassisNo: 1 });
carSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model('Car', carSchema);