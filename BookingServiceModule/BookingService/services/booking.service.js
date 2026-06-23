const Booking = require('../models/booking.model');
const Facility = require('../models/facility.model');
const { sendAlert } = require('./notificationService'); // Assuming you moved this to /services
const { toMinutes, timesOverlap, isValidTime } = require('../utils/time');

async function createBooking(userId, body, token) {
    const { facilityId, date, startTime, endTime } = body;

    if (!facilityId) throw Object.assign(new Error('facilityId is required'), { status: 400 });
    if (!date) throw Object.assign(new Error('date is required'), { status: 400 });
    if (!startTime) throw Object.assign(new Error('startTime is required'), { status: 400 });
    if (!endTime) throw Object.assign(new Error('endTime is required'), { status: 400 });

    if (!isValidTime(startTime) || !isValidTime(endTime)) {
        throw Object.assign(new Error('Invalid time format. Use HH:mm (e.g., 09:00)'), { status: 400 });
    }

    if (toMinutes(startTime) >= toMinutes(endTime)) {
        throw Object.assign(new Error('startTime must be before endTime'), { status: 400 });
    }

    const facility = await Facility.findById(facilityId);
    if (!facility) throw Object.assign(new Error('Facility not found'), { status: 404 });
    if (!facility.active) throw Object.assign(new Error('Facility is inactive'), { status: 400 });

    const existing = await Booking.find({
        facilityId,
        date,
        status: { $ne: 'CANCELLED' },
    });

    const conflict = existing.find(b =>
        timesOverlap(startTime, endTime, b.startTime, b.endTime)
    );

    if (conflict) {
        throw Object.assign(new Error(`Time slot ${startTime}-${endTime} is already booked.`), { status: 409 });
    }

    const booking = await Booking.create({
        facilityId,
        userId,
        date,
        startTime,
        endTime,
        status: 'CONFIRMED',
    });

    sendAlert(userId, `Success! You have booked facility "${facility.name}" on ${date} at ${startTime} - ${endTime}`, token);

    return booking;
}

async function listAllBookings() {
    return Booking.find().sort({ createdAt: -1 });
}

async function listUserBookings(userId) {
    return Booking.find({ userId }).sort({ createdAt: -1 });
}

async function cancelBooking(id, userId, userRole, token) {
    const booking = await Booking.findById(id);
    if (!booking) throw Object.assign(new Error('Booking not found'), { status: 404 });

    if (booking.userId !== userId && userRole?.toLowerCase() !== 'admin') {
        throw Object.assign(new Error('Not allowed to cancel this booking'), { status: 403 });
    }

    booking.status = 'CANCELLED';
    await booking.save();

    sendAlert(userId, 'The booking successfully cancelled', token);

    return { message: 'Booking cancelled successfully' };
}

async function deleteBooking(id) {
    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) throw Object.assign(new Error('Booking not found'), { status: 404 });

    return { message: 'Booking permanently deleted' };
}

module.exports = {
    createBooking,
    listAllBookings,
    listUserBookings,
    cancelBooking,
    deleteBooking 
};