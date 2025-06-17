const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  requirements: [{
    type: String,
    trim: true
  }],
  responsibilities: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
    required: true
  },
  category: {
    type: String,
    enum: ['Technology', 'Engineering', 'Business', 'Finance', 'Marketing', 'Healthcare', 'Education', 'Other'],
    required: true
  },
  experienceLevel: {
    type: String,
    enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'],
    required: true
  },
  salaryRange: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'PKR'
    }
  },
  applicationDeadline: {
    type: Date,
    required: true
  },
  applicationMethod: {
    type: String,
    enum: ['email', 'website', 'platform'],
    required: true
  },
  applicationEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  applicationUrl: {
    type: String,
    trim: true
  },
  contactPerson: {
    name: String,
    email: String,
    phone: String
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  applications: [{
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected'],
      default: 'pending'
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
jobSchema.index({ title: 'text', company: 'text', description: 'text' });
jobSchema.index({ category: 1, jobType: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ applicationDeadline: 1 });
jobSchema.index({ isActive: 1, createdAt: -1 });

// Virtual for application count
jobSchema.virtual('applicationCount').get(function() {
  return this.applications.length;
});

// Ensure virtual fields are serialized
jobSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Job', jobSchema);