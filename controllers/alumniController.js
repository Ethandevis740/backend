const User = require('../models/User');

const getAllAlumni = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const alumni = await User.find()
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ graduationYear: -1, lastName: 1 });

    const total = await User.countDocuments();

    res.json({
      success: true,
      data: alumni,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getAlumniById = async (req, res) => {
  try {
    const alumni = await User.findById(req.params.id).select('-password');
    
    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: 'Alumni not found'
      });
    }

    res.json({
      success: true,
      data: alumni
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const searchAlumni = async (req, res) => {
  try {
    const { q, graduationYear, degreeProgram, location } = req.query;
    let query = {};

    // Text search
    if (q) {
      query.$or = [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { currentPosition: { $regex: q, $options: 'i' } },
        { currentLocation: { $regex: q, $options: 'i' } }
      ];
    }

    // Filter by graduation year
    if (graduationYear) {
      query.graduationYear = parseInt(graduationYear);
    }

    // Filter by degree program
    if (degreeProgram) {
      query.degreeProgram = { $regex: degreeProgram, $options: 'i' };
    }

    // Filter by location
    if (location) {
      query.currentLocation = { $regex: location, $options: 'i' };
    }

    const alumni = await User.find(query)
      .select('-password')
      .limit(50)
      .sort({ lastName: 1 });

    res.json({
      success: true,
      data: alumni,
      count: alumni.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getAlumniStats = async (req, res) => {
  try {
    const totalAlumni = await User.countDocuments();
    
    const graduationYearStats = await User.aggregate([
      {
        $group: {
          _id: '$graduationYear',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    const degreeProgramStats = await User.aggregate([
      {
        $group: {
          _id: '$degreeProgram',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const membershipTypeStats = await User.aggregate([
      {
        $group: {
          _id: '$membershipType',
          count: { $sum: 1 }
        }
      }
    ]);

    const locationStats = await User.aggregate([
      {
        $group: {
          _id: '$currentLocation',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        totalAlumni,
        graduationYearStats,
        degreeProgramStats,
        membershipTypeStats,
        locationStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createAlumniProfile = async (req, res) => {
  try {
    const alumni = await User.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Alumni profile created successfully',
      data: {
        id: alumni._id,
        firstName: alumni.firstName,
        lastName: alumni.lastName,
        email: alumni.email
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const updateAlumniProfile = async (req, res) => {
  try {
    const alumni = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: 'Alumni not found'
      });
    }

    res.json({
      success: true,
      message: 'Alumni profile updated successfully',
      data: alumni
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const deleteAlumniProfile = async (req, res) => {
  try {
    const alumni = await User.findByIdAndDelete(req.params.id);
    
    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: 'Alumni not found'
      });
    }

    res.json({
      success: true,
      message: 'Alumni profile deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllAlumni,
  getAlumniById,
  searchAlumni,
  getAlumniStats,
  createAlumniProfile,
  updateAlumniProfile,
  deleteAlumniProfile
};