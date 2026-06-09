/**
 * booking.routes.js
 *
 * POST /api/v1/bookings              — create booking (any logged-in user)
 * GET  /api/v1/bookings              — list ALL bookings (admin only)
 * GET  /api/v1/bookings/me           — list MY bookings (any logged-in user)
 * PUT  /api/v1/bookings/:id/cancel   — cancel a booking (owner or admin)
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const controller = require('./booking.controller');

// ALL booking operations require authentication
router.use(auth);

router.post('/', controller.create);
router.get('/me', controller.listMine);
router.get('/', controller.listAll);
router.put('/:id/cancel', controller.cancel);

module.exports = router;
