const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const EventIdea = require('../models/EventIdea');
const User = require('../models/User');

const getAllEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter object
    let filter = { status: 'Published' };
    
    if (req.query.type && req.query.type !== 'all') {
      filter.type = req.query.type;
    }
    
    if (req.query.category && req.query.category !== 'all') {
      filter.category = req.query.category;
    }
    
    if (req.query.upcoming === 'true') {
      filter.date = { $gte: new Date() };
    }
    
    if (req.query.past === 'true') {
      filter.date = { $lt: new Date() };
    }
    
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const events = await Event.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .skip(skip)
      .limit(limit)
      .sort({ date: req.query.past === 'true' ? -1 : 1 });

    const total = await Event.countDocuments(filter);

    res.json({
      success: true,
      data: events,
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

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email phone currentPosition')
      .populate('feedback.user', 'firstName lastName');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.user.id
    };

    const event = await Event.create(eventData);
    await event.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user owns the event or is admin
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user owns the event or is admin
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if registration is still open
    if (!event.isRegistrationOpen) {
      return res.status(400).json({
        success: false,
        message: 'Registration is closed for this event'
      });
    }

    // Check if user already registered
    const existingRegistration = await EventRegistration.findOne({
      eventId: req.params.id,
      userId: req.user.id
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    const registration = await EventRegistration.create({
      eventId: req.params.id,
      userId: req.user.id,
      name: `${req.user.firstName} ${req.user.lastName}`,
      email: req.user.email,
      ...req.body
    });

    // Update event registered count
    await Event.findByIdAndUpdate(req.params.id, {
      $inc: { registeredCount: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Event registration successful',
      data: registration
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const submitEventIdea = async (req, res) => {
  try {
    const eventIdea = await EventIdea.create({
      ...req.body,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Event idea submitted successfully',
      data: eventIdea
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ userId: req.user.id })
      .populate('eventId', 'title date location type status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: registrations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getMyEventIdeas = async (req, res) => {
  try {
    const eventIdeas = await EventIdea.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: eventIdeas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const addEventFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is completed
    if (!event.isPast) {
      return res.status(400).json({
        success: false,
        message: 'Cannot provide feedback for upcoming events'
      });
    }

    // Check if user already provided feedback
    const existingFeedback = event.feedback.find(
      f => f.user.toString() === req.user.id
    );

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'You have already provided feedback for this event'
      });
    }

    // Add feedback
    event.feedback.push({
      user: req.user.id,
      rating,
      comment
    });

    // Recalculate average rating
    const totalRating = event.feedback.reduce((sum, f) => sum + f.rating, 0);
    event.averageRating = totalRating / event.feedback.length;
    event.totalFeedback = event.feedback.length;

    await event.save();

    res.json({
      success: true,
      message: 'Feedback added successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getEventStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments({ status: 'Published' });
    const upcomingEvents = await Event.countDocuments({
      status: 'Published',
      date: { $gte: new Date() }
    });
    const completedEvents = await Event.countDocuments({
      status: 'Completed'
    });

    const eventsByType = await Event.aggregate([
      { $match: { status: 'Published' } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const eventsByMonth = await Event.aggregate([
      { $match: { status: 'Published' } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const totalRegistrations = await EventRegistration.countDocuments();

    res.json({
      success: true,
      data: {
        totalEvents,
        upcomingEvents,
        completedEvents,
        totalRegistrations,
        eventsByType,
        eventsByMonth
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const uploadEventImages = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user owns the event or is admin
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload images for this event'
      });
    }

    // In a real implementation, you would handle file uploads here
    // For now, we'll just accept image URLs from the request body
    const { images } = req.body;

    if (images && Array.isArray(images)) {
      event.gallery.push(...images.map(img => ({
        url: img.url,
        caption: img.caption || '',
        uploadedAt: new Date()
      })));
      
      await event.save();
    }

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  submitEventIdea,
  getMyRegistrations,
  getMyEventIdeas,
  addEventFeedback,
  getEventStats,
  uploadEventImages
};