const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  phone: {
    type: String,
    trim: true
  },
  graduationYear: {
    type: Number,
    min: [2010, 'Graduation year must be 2010 or later'],
    max: [new Date().getFullYear() + 4, 'Invalid graduation year']
  },
  degreeProgram: {
    type: String,
    enum: [
      'BS Computer Science',
      'BS Electrical Engineering', 
      'BS Mechanical Engineering',
      'BBA',
      'MBA',
      'MS Computer Science',
      'MS Electrical Engineering',
      'Other'
    ]
  },
  currentPosition: {
    type: String,
    trim: true
  },
  currentLocation: {
    type: String,
    trim: true
  },
  membershipType: {
    type: String,
    enum: ['Basic', 'Premium', 'Lifetime'],
    default: 'Basic'
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  profilePicture: {
    type: String
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  socialLinks: {
    linkedin: String,
    twitter: String,
    github: String,
    website: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better search performance
userSchema.index({ email: 1 });
userSchema.index({ graduationYear: 1 });
userSchema.index({ degreeProgram: 1 });
userSchema.index({ currentLocation: 1 });
userSchema.index({ firstName: 'text', lastName: 'text', currentPosition: 'text' });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);