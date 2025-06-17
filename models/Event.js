const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required']
  },
  duration: {
    type: Number, // Duration in minutes
    required: true
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true
  },
  venue: {
    name: String,
    address: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  type: {
    type: String,
    enum: ['Reunion', 'Networking', 'Workshop', 'Seminar', 'Social', 'Career', 'Conference', 'Webinar', 'Other'],
    required: true
  },
  category: {
    type: String,
    enum: ['Academic', 'Professional', 'Social', 'Cultural', 'Sports', 'Technology', 'Business', 'Other'],
    default: 'Other'
  },
  capacity: {
    type: Number,
    required: true,
    min: [1, 'Capacity must be at least 1']
  },
  registeredCount: {
    type: Number,
    default: 0
  },
  isVirtual: {
    type: Boolean,
    default: false
  },
  meetingLink: {
    type: String,
    validate: {
      validator: function(v) {
        return !this.isVirtual || (this.isVirtual && v);
      },
      message: 'Meeting link is required for virtual events'
    }
  },
  images: [{
    url: String,
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  gallery: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  organizer: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: String,
    organization: String
  },
  speakers: [{
    name: String,
    title: String,
    bio: String,
    image: String,
    linkedin: String
  }],
  agenda: [{
    time: String,
    title: String,
    description: String,
    speaker: String,
    duration: Number
  }],
  requirements: [String],
  benefits: [String],
  tags: [String],
  registrationFee: {
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'PKR'
    }
  },
  registrationDeadline: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Cancelled', 'Completed', 'Postponed'],
    default: 'Published'
  },
  visibility: {
    type: String,
    enum: ['Public', 'Alumni Only', 'Premium Members', 'Invited Only'],
    default: 'Public'
  },
  feedback: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  totalFeedback: {
    type: Number,
    default: 0
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'yearly']
    },
    interval: Number,
    endDate: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ type: 1, category: 1 });
eventSchema.index({ location: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ registrationDeadline: 1 });

// Virtual for checking if event is past
eventSchema.virtual('isPast').get(function() {
  return new Date() > this.date;
});

// Virtual for checking if registration is open
eventSchema.virtual('isRegistrationOpen').get(function() {
  return new Date() < this.registrationDeadline && this.registeredCount < this.capacity;
});

// Virtual for spots remaining
eventSchema.virtual('spotsRemaining').get(function() {
  return this.capacity - this.registeredCount;
});

// Calculate duration from start and end time
eventSchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    const start = new Date(`2000-01-01 ${this.startTime}`);
    const end = new Date(`2000-01-01 ${this.endTime}`);
    this.duration = (end - start) / (1000 * 60); // Duration in minutes
  }
  next();
});

// Ensure virtual fields are serialized
eventSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);