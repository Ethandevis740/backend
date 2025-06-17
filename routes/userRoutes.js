const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

// GET /api/users - Get all users (protected)
router.get('/', authenticate, userController.getAllUsers);

// GET /api/users/:id - Get user by ID (protected)
router.get('/:id', authenticate, userController.getUserById);

// GET /api/users/profile - Get current user profile (protected)
router.get('/profile', authenticate, userController.getProfile);

// PUT /api/users/:id - Update user (protected)
router.put('/:id', authenticate, userController.updateUser);

// PUT /api/users/profile - Update current user profile (protected)
router.put('/profile', authenticate, userController.updateProfile);

// DELETE /api/users/:id - Delete user (protected)
router.delete('/:id', authenticate, userController.deleteUser);

module.exports = router;