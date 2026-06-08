/**
 * bookingRoutes.js
 *
 * POST /api/v1/bookings              — create booking (any logged-in user)
 * GET  /api/v1/bookings              — list ALL bookings (admin only)
 * GET  /api/v1/bookings/me           — list MY bookings (any logged-in user)
 * PUT  /api/v1/bookings/:id/cancel   — cancel a booking (owner or admin)
 */

const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');
const { sendAlert } = require('../middleware/notificationService');
const { Facility, Booking } = require('../models');

// ── Helper: parse HH:mm and check overlap ────────────────────────────────
function toMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

function timesOverlap(s1, e1, s2, e2) {
    return toMinutes(s1) < toMinutes(e2) && toMinutes(e1) > toMinutes(s2);
}

function isValidTime(t) {
    return /^\d{2}:\d{2}$/.test(t);
}

// Apply auth middleware to ALL booking routes (none are public)
router.use(auth);

// ── POST /api/v1/bookings ─────────────────────────────────────────────────
router.post('/', async (req, res) => {
    const { userId, userRole } = req.user;
    const { facilityId, date, startTime, endTime } = req.body;

    // Validate required fields
    if (!facilityId) return res.status(400).json({ message: 'facilityId is required' });
    if (!date)       return res.status(400).json({ message: 'date is required' });
    if (!startTime)  return res.status(400).json({ message: 'startTime is required' });
    if (!endTime)    return res.status(400).json({ message: 'endTime is required' });

    // Validate time format
    if (!isValidTime(startTime) || !isValidTime(endTime)) {
        return res.status(400).json({ message: 'Invalid time format. Use HH:mm (e.g., 09:00)' });
    }

    if (toMinutes(startTime) >= toMinutes(endTime)) {
        return res.status(400).json({ message: 'startTime must be before endTime' });
    }

    try {
        // Check facility exists and is active
        const facility = await Facility.findById(facilityId);
        if (!facility) return res.status(404).json({ message: 'Facility not found' });
        if (!facility.active) return res.status(400).json({ message: 'Facility is inactive' });

        // Check for time conflicts
        const existing = await Booking.find({
            facilityId,
            date,
            status: { $ne: 'CANCELLED' },
        });

        const conflict = existing.find(b =>
            timesOverlap(startTime, endTime, b.startTime, b.endTime)
        );

        if (conflict) {
            return res.status(409).json({
                message: `Time slot ${startTime}-${endTime} is already booked.`,
            });
        }

        // Save booking
        const booking = await Booking.create({
            facilityId,
            userId,
            date,
            startTime,
            endTime,
            status: 'CONFIRMED',
        });

        // Fire and forget notification
        sendAlert(userId,
            `Success! You have booked facility ${facilityId} on ${date} at ${startTime}`
        );

        res.status(201).json({ ...booking.toObject(), id: booking._id });

    } catch (err) {
        console.error('[Booking] Create error:', err.message);
        res.status(500).json({ message: 'Failed to create booking' });
    }
});

// ── GET /api/v1/bookings (admin: all bookings) ────────────────────────────
router.get('/', async (req, res) => {
    if (req.user?.userRole?.toLowerCase() !== 'admin') {
        return res.status(403).json({ message: 'Admin only' });
    }

    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json(bookings.map(b => ({ ...b.toObject(), id: b._id })));
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch bookings' });
    }
});

// ── GET /api/v1/bookings/me (student: own bookings) ───────────────────────
// NOTE: this must be defined BEFORE /:id to avoid Express matching "me" as an id
router.get('/me', async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json(bookings.map(b => ({ ...b.toObject(), id: b._id })));
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch bookings' });
    }
});

// ── PUT /api/v1/bookings/:id/cancel ──────────────────────────────────────
router.put('/:id/cancel', async (req, res) => {
    const { userId, userRole } = req.user;

    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Only the owner or an admin can cancel
        if (booking.userId !== userId && userRole?.toLowerCase() !== 'admin') {
            return res.status(403).json({ message: 'Not allowed to cancel this booking' });
        }

        booking.status = 'CANCELLED';
        await booking.save();

        // Fire and forget notification
        sendAlert(userId,
            `Your booking for facility ${booking.facilityId} has been successfully cancelled.`
        );

        res.json({ message: 'Booking cancelled successfully' });

    } catch (err) {
        console.error('[Booking] Cancel error:', err.message);
        res.status(500).json({ message: 'Failed to cancel booking' });
    }
});

module.exports = router;
