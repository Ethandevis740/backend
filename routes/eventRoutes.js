const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticate } = require('../middleware/auth');
const { validateEventRegistration, validateEventIdea } = require('../middleware/validation');

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/stats', eventController.getEventStats);
router.get('/:id', eventController.getEventById);

// Protected routes
router.post('/', authenticate, eventController.createEvent);
router.put('/:id', authenticate, eventController.updateEvent);
router.delete('/:id', authenticate, eventController.deleteEvent);
router.post('/:id/register', authenticate, validateEventRegistration, eventController.registerForEvent);
router.post('/:id/feedback', authenticate, eventController.addEventFeedback);
router.post('/:id/images', authenticate, eventController.uploadEventImages);
router.post('/ideas', authenticate, validateEventIdea, eventController.submitEventIdea);

// User-specific routes
router.get('/my/registrations', authenticate, eventController.getMyRegistrations);
router.get('/my/ideas', authenticate, eventController.getMyEventIdeas);

module.exports = router;