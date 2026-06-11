const bookingService = require('../services/booking.service');

async function create(req, res) {
    try {
        const token = req.headers.authorization; 
        const booking = await bookingService.createBooking(req.user.userId, req.body, token);
        res.status(201).json(booking);
    } catch (err) {
        console.error('[Booking] Create error:', err.message);
        res.status(err.status || 500).json({ message: err.message || 'Failed to create booking' });
    }
}


async function listAll(req, res) {
    if (req.user?.userRole?.toLowerCase() !== 'admin') {
        return res.status(403).json({ message: 'Admin only' });
    }

    try {
        const bookings = await bookingService.listAllBookings();
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch bookings' });
    }
}

async function listMine(req, res) {
    try {
        const bookings = await bookingService.listUserBookings(req.user.userId);
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch bookings' });
    }
}

async function cancel(req, res) {
    try {
        const token = req.headers.authorization;
        const result = await bookingService.cancelBooking(
            req.params.id,
            req.user.userId,
            req.user.userRole,
            token
        );
        res.json(result);
    } catch (err) {
        console.error('[Booking] Cancel error:', err.message);
        res.status(err.status || 500).json({ message: err.message || 'Failed to cancel booking' });
    }
}

module.exports = { create, listAll, listMine, cancel };