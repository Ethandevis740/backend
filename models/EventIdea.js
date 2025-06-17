const mongoose = require('mongoose');

const eventIdeaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  eventTitle: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  expectedDate: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  expectedAttendees: {
    type: Number,
    required: true,
    min: 1
  },
  category: {
    type: String,
    enum: ['Reunion', 'Networking', 'Workshop', 'Seminar', 'Social', 'Career', 'Other'],
    default: 'Other'
  },
  budget: {
    type: Number
  },
  additionalNotes: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Approved', 'Rejected', 'Implemented'],
    default: 'Pending'
  },
  reviewNotes: {
    type: String
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
eventIdeaSchema.index({ status: 1, createdAt: -1 });
eventIdeaSchema.index({ userId: 1 });

module.exports = mongoose.model('EventIdea', eventIdeaSchema);