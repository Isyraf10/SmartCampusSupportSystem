const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  getEventRegistrations,
} = require('../controllers/eventController');

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Protected routes (requires valid token from Identity Service)
router.post('/:id/register', verifyToken, registerForEvent);
router.delete('/:id/register', verifyToken, cancelRegistration);

// Admin only routes
router.post('/', verifyToken, isAdmin, createEvent);
router.put('/:id', verifyToken, isAdmin, updateEvent);
router.delete('/:id', verifyToken, isAdmin, deleteEvent);
router.get('/:id/registrations', verifyToken, isAdmin, getEventRegistrations);

module.exports = router;
