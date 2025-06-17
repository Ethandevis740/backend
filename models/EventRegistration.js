const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  requirements: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Registered', 'Attended', 'Cancelled', 'No-show'],
    default: 'Registered'
  },
  registrationDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate registrations
eventRegistrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);