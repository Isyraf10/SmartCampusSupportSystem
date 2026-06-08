/**
 * facilityRoutes.js
 *
 * GET  /api/v1/facilities              — list all (PUBLIC)
 * GET  /api/v1/facilities/:id          — get one (PUBLIC)
 * GET  /api/v1/facilities/:id/availability — check slot (PUBLIC)
 * POST /api/v1/facilities              — create (admin only)
 * PUT  /api/v1/facilities/:id          — update (admin only)
 * DELETE /api/v1/facilities/:id        — delete (admin only)
 */

const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');
const { Facility, Booking } = require('../models');

// ── Helper: parse HH:mm into comparable minutes ───────────────────────────
function toMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

function timesOverlap(s1, e1, s2, e2) {
    return toMinutes(s1) < toMinutes(e2) && toMinutes(e1) > toMinutes(s2);
}

// ── Apply auth middleware to ALL routes in this file ─────────────────────
// Public routes are whitelisted INSIDE the middleware, so GET requests
// pass through even without a token.
router.use(auth);

// ── GET /api/v1/facilities ─────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const facilities = await Facility.find();
        // Return id as string to match old Java format
        res.json(facilities.map(f => ({ ...f.toObject(), id: f._id })));
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch facilities' });
    }
});

// ── GET /api/v1/facilities/:id ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const facility = await Facility.findById(req.params.id);
        if (!facility) return res.status(404).json({ message: 'Facility not found' });
        res.json({ ...facility.toObject(), id: facility._id });
    } catch (err) {
        res.status(404).json({ message: 'Facility not found' });
    }
});

// ── GET /api/v1/facilities/:id/availability ───────────────────────────────
router.get('/:id/availability', async (req, res) => {
    const { date, startTime, endTime } = req.query;

    if (!date || !startTime || !endTime) {
        return res.status(400).json({ message: 'date, startTime and endTime are required' });
    }

    // Validate time format HH:mm
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        return res.status(400).json({ message: 'Invalid time format. Use HH:mm' });
    }

    if (toMinutes(startTime) >= toMinutes(endTime)) {
        return res.status(400).json({ message: 'startTime must be before endTime' });
    }

    try {
        const exists = await Facility.findById(req.params.id);
        if (!exists) return res.status(404).json({ message: 'Facility not found' });

        const bookings = await Booking.find({
            facilityId: req.params.id,
            date,
            status: { $ne: 'CANCELLED' },
        });

        const conflicts = bookings.filter(b =>
            timesOverlap(startTime, endTime, b.startTime, b.endTime)
        ).length;

        res.json({ available: conflicts === 0, conflicts });
    } catch (err) {
        res.status(500).json({ message: 'Availability check failed' });
    }
});

// ── POST /api/v1/facilities (admin only) ──────────────────────────────────
router.post('/', async (req, res) => {
    if (req.user?.userRole?.toLowerCase() !== 'admin') {
        return res.status(403).json({ message: 'Admin only' });
    }

    const { name, type, location, capacity, active } = req.body;
    if (!name || !type || !location || !capacity) {
        return res.status(400).json({ message: 'name, type, location and capacity are required' });
    }

    try {
        const facility = await Facility.create({
            name, type, location,
            capacity: Number(capacity),
            active: active !== undefined ? active : true,
        });
        res.status(201).json({ ...facility.toObject(), id: facility._id });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create facility' });
    }
});

// ── PUT /api/v1/facilities/:id (admin only) ───────────────────────────────
router.put('/:id', async (req, res) => {
    if (req.user?.userRole?.toLowerCase() !== 'admin') {
        return res.status(403).json({ message: 'Admin only' });
    }

    try {
        const facility = await Facility.findById(req.params.id);
        if (!facility) return res.status(404).json({ message: 'Facility not found' });

        const { name, type, location, capacity, active } = req.body;
        if (name     !== undefined) facility.name     = name;
        if (type     !== undefined) facility.type     = type;
        if (location !== undefined) facility.location = location;
        if (capacity !== undefined) facility.capacity = Number(capacity);
        if (active   !== undefined) facility.active   = active;

        await facility.save();
        res.json({ ...facility.toObject(), id: facility._id });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update facility' });
    }
});

// ── DELETE /api/v1/facilities/:id (admin only) ────────────────────────────
router.delete('/:id', async (req, res) => {
    if (req.user?.userRole?.toLowerCase() !== 'admin') {
        return res.status(403).json({ message: 'Admin only' });
    }

    try {
        const deleted = await Facility.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Facility not found' });
        res.json({ message: 'Facility deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete facility' });
    }
});

module.exports = router;
