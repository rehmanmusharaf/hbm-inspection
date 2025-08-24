const mongoose = require('mongoose');

const carPartSchema = new mongoose.Schema({
  inspectionReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InspectionReport',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'exterior', 'interior', 'engine', 'transmission', 
      'suspension', 'brakes', 'wheels', 'electrical', 'safety'
    ]
  },
  partName: {
    type: String,
    required: true,
    trim: true
  },
  partCode: {
    type: String,
    trim: true
  },
  condition: {
    type: String,
    required: true,
    enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged', 'Missing', 'N/A']
  },
  conditionScore: {
    type: Number,
    min: 0,
    max: 10,
    required: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String,
    caption: String,
    angle: {
      type: String,
      enum: ['front', 'back', 'left', 'right', 'top', 'bottom', 'close-up', 'overview']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  measurements: {
    thickness: Number,
    depth: Number,
    width: Number,
    diameter: Number,
    unit: {
      type: String,
      enum: ['mm', 'cm', 'inch'],
      default: 'mm'
    }
  },
  issues: [{
    type: {
      type: String,
      enum: ['scratch', 'dent', 'rust', 'crack', 'wear', 'leak', 'noise', 'malfunction', 'missing', 'other']
    },
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'major', 'critical']
    },
    description: String,
    location: String,
    repairNeeded: Boolean,
    estimatedCost: Number
  }],
  functionality: {
    isWorking: Boolean,
    performanceLevel: {
      type: String,
      enum: ['optimal', 'acceptable', 'degraded', 'failed', 'N/A']
    },
    testResults: String
  },
  maintenanceHistory: {
    lastServiced: Date,
    lastReplaced: Date,
    serviceInterval: Number,
    nextServiceDue: Date
  },
  originalPart: {
    type: Boolean,
    default: true
  },
  aftermarketDetails: {
    brand: String,
    model: String,
    installedDate: Date,
    warranty: {
      hasWarranty: Boolean,
      expiryDate: Date
    }
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  recommendation: {
    type: String,
    enum: ['no-action', 'monitor', 'service-soon', 'repair-soon', 'replace-immediately']
  },
  inspectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  inspectionTime: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
carPartSchema.index({ inspectionReport: 1, category: 1 });
carPartSchema.index({ inspectionReport: 1, partName: 1 });
carPartSchema.index({ condition: 1 });
carPartSchema.index({ 'issues.severity': 1 });

// Virtual for repair urgency
carPartSchema.virtual('repairUrgency').get(function() {
  if (this.recommendation === 'replace-immediately') return 'critical';
  if (this.recommendation === 'repair-soon') return 'high';
  if (this.recommendation === 'service-soon') return 'medium';
  if (this.recommendation === 'monitor') return 'low';
  return 'none';
});

// Method to calculate overall part health
carPartSchema.methods.calculateHealth = function() {
  let health = 100;
  
  // Deduct based on condition
  const conditionDeduction = {
    'Excellent': 0,
    'Good': 10,
    'Fair': 30,
    'Poor': 50,
    'Damaged': 70,
    'Missing': 100
  };
  
  health -= (conditionDeduction[this.condition] || 0);
  
  // Deduct based on issues
  this.issues.forEach(issue => {
    const severityDeduction = {
      'minor': 5,
      'moderate': 15,
      'major': 25,
      'critical': 40
    };
    health -= (severityDeduction[issue.severity] || 0);
  });
  
  return Math.max(0, health);
};

module.exports = mongoose.model('CarPart', carPartSchema);