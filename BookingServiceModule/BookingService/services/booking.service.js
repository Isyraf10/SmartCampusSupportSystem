const Booking = require('../models/booking.model');
const Facility = require('../models/facility.model');
const { sendAlert } = require('../middleware/notificationService');
const { toMinutes, timesOverlap, isValidTime } = require('../utils/time');

function formatBooking(booking) {
    return { ...booking.toObject(), id: booking._id };
}

async function createBooking(userId, body) {
    const { facilityId, date, startTime, endTime } = body;

    if (!facilityId) {
        const err = new Error('facilityId is required');
        err.status = 400;
        throw err;
    }
    if (!date) {
        const err = new Error('date is required');
        err.status = 400;
        throw err;
    }
    if (!startTime) {
        const err = new Error('startTime is required');
        err.status = 400;
        throw err;
    }
    if (!endTime) {
        const err = new Error('endTime is required');
        err.status = 400;
        throw err;
    }

    if (!isValidTime(startTime) || !isValidTime(endTime)) {
        const err = new Error('Invalid time format. Use HH:mm (e.g., 09:00)');
        err.status = 400;
        throw err;
    }

    if (toMinutes(startTime) >= toMinutes(endTime)) {
        const err = new Error('startTime must be before endTime');
        err.status = 400;
        throw err;
    }

    const facility = await Facility.findById(facilityId);
    if (!facility) {
        const err = new Error('Facility not found');
        err.status = 404;
        throw err;
    }
    if (!facility.active) {
        const err = new Error('Facility is inactive');
        err.status = 400;
        throw err;
    }

    const existing = await Booking.find({
        facilityId,
        date,
        status: { $ne: 'CANCELLED' },
    });

    const conflict = existing.find(b =>
        timesOverlap(startTime, endTime, b.startTime, b.endTime)
    );

    if (conflict) {
        const err = new Error(`Time slot ${startTime}-${endTime} is already booked.`);
        err.status = 409;
        throw err;
    }

    const booking = await Booking.create({
        facilityId,
        userId,
        date,
        startTime,
        endTime,
        status: 'CONFIRMED',
    });

    sendAlert(userId,
        `Success! You have booked facility ${facilityId} on ${date} at ${startTime}`
    );

    return formatBooking(booking);
}

async function listAllBookings() {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    return bookings.map(formatBooking);
}

async function listUserBookings(userId) {
    const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });
    return bookings.map(formatBooking);
}

async function cancelBooking(id, userId, userRole) {
    const booking = await Booking.findById(id);
    if (!booking) {
        const err = new Error('Booking not found');
        err.status = 404;
        throw err;
    }

    if (booking.userId !== userId && userRole?.toLowerCase() !== 'admin') {
        const err = new Error('Not allowed to cancel this booking');
        err.status = 403;
        throw err;
    }

    booking.status = 'CANCELLED';
    await booking.save();

    sendAlert(userId,
        `Your booking for facility ${booking.facilityId} has been successfully cancelled.`
    );

    return { message: 'Booking cancelled successfully' };
}

module.exports = {
    createBooking,
    listAllBookings,
    listUserBookings,
    cancelBooking,
};
