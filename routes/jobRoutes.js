const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/', jobController.getAllJobs);
router.get('/stats', jobController.getJobStats);
router.get('/:id', jobController.getJobById);

// Protected routes
router.post('/', authenticate, jobController.createJob);
router.put('/:id', authenticate, jobController.updateJob);
router.delete('/:id', authenticate, jobController.deleteJob);
router.post('/:id/apply', authenticate, jobController.applyForJob);
router.get('/my/jobs', authenticate, jobController.getMyJobs);
router.get('/my/applications', authenticate, jobController.getMyApplications);

module.exports = router;