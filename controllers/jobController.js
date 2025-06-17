const Job = require('../models/Job');
const User = require('../models/User');

const getAllJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    let filter = { isActive: true };
    
    if (req.query.category && req.query.category !== 'all') {
      filter.category = req.query.category;
    }
    
    if (req.query.jobType && req.query.jobType !== 'all') {
      filter.jobType = req.query.jobType;
    }
    
    if (req.query.location) {
      filter.location = { $regex: req.query.location, $options: 'i' };
    }
    
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const jobs = await Job.find(filter)
      .populate('postedBy', 'firstName lastName email')
      .skip(skip)
      .limit(limit)
      .sort({ featured: -1, createdAt: -1 });

    const total = await Job.countDocuments(filter);

    res.json({
      success: true,
      data: jobs,
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

const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'firstName lastName email phone currentPosition');
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Increment view count
    job.views += 1;
    await job.save();

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createJob = async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: req.user.id
    };

    const job = await Job.create(jobData);
    await job.populate('postedBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      data: job
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user owns the job or is admin
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('postedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: updatedJob
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user owns the job or is admin
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user already applied
    const existingApplication = job.applications.find(
      app => app.applicant.toString() === req.user.id
    );

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Add application
    job.applications.push({
      applicant: req.user.id,
      appliedAt: new Date()
    });

    await job.save();

    res.json({
      success: true,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id })
      .populate('applications.applicant', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const jobs = await Job.find({
      'applications.applicant': req.user.id
    }).populate('postedBy', 'firstName lastName email company');

    const applications = jobs.map(job => {
      const application = job.applications.find(
        app => app.applicant.toString() === req.user.id
      );
      return {
        job: {
          id: job._id,
          title: job.title,
          company: job.company,
          location: job.location,
          postedBy: job.postedBy
        },
        application
      };
    });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getJobStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments({ isActive: true });
    const totalApplications = await Job.aggregate([
      { $match: { isActive: true } },
      { $project: { applicationCount: { $size: '$applications' } } },
      { $group: { _id: null, total: { $sum: '$applicationCount' } } }
    ]);

    const jobsByCategory = await Job.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const jobsByType = await Job.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$jobType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalJobs,
        totalApplications: totalApplications[0]?.total || 0,
        jobsByCategory,
        jobsByType
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  applyForJob,
  getMyJobs,
  getMyApplications,
  getJobStats
};