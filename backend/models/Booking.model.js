const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  inspector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  inspectionType: {
    type: String,
    enum: ['basic', 'comprehensive', 'pre-purchase', 'insurance', 'warranty'],
    default: 'comprehensive'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['customer_location', 'inspection_center'],
      default: 'inspection_center'
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'online'],
    default: 'cash'
  },
  paymentDetails: {
    transactionId: String,
    paidAt: Date,
    receiptUrl: String
  },
  inspectionReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InspectionReport'
  },
  notes: String,
  customerRequests: [String],
  cancellationReason: String,
  cancelledAt: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rescheduledFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  rescheduledTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  completedAt: Date,
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  },
  remindersSent: [{
    type: {
      type: String,
      enum: ['email', 'sms']
    },
    sentAt: Date
  }],
  metadata: {
    source: {
      type: String,
      enum: ['website', 'mobile_app', 'phone', 'walk_in'],
      default: 'website'
    },
    referralCode: String,
    couponCode: String,
    discount: Number
  }
}, {
  timestamps: true
});

bookingSchema.pre('save', function(next) {
  if (!this.bookingNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000);
    this.bookingNumber = `BK-${year}${month}-${random.toString().padStart(4, '0')}`;
  }
  next();
});

bookingSchema.index({ user: 1, scheduledDate: -1 });
bookingSchema.index({ inspector: 1, scheduledDate: 1 });
bookingSchema.index({ status: 1, scheduledDate: 1 });
bookingSchema.index({ bookingNumber: 1 });

module.exports = mongoose.model('Booking', bookingSchema);