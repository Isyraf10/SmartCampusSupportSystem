const bookingService = require('../services/booking.service');
const catchAsync = require('../utils/catchAsync');
const { sendSystemNotification } = require('../utils/notifier');

const create = catchAsync(async (req, res) => {
    const token = req.headers.authorization;
    const booking = await bookingService.createBooking(req.user.userId, req.body, token);

    const validUserId = req.user.userId || req.user.id;
    const pureToken = token ? token.split(' ')[1] || token : '';
    
    console.log('[Controller] Handing over this exact ID to Notifier:', validUserId);

    await sendSystemNotification(
        validUserId,
        'BOOKING_CONFIRMATION',
        'Your facility booking is confirmed.',
        { bookingId: booking._id || booking.id },
        pureToken
    );

    res.status(201).json(booking);
});

const listAll = catchAsync(async (req, res) => {
    if (req.user?.userRole?.toLowerCase() !== 'admin') {
        return res.status(403).json({ message: 'Admin only' });
    }
    const bookings = await bookingService.listAllBookings();
    res.json(bookings);
});

const listMine = catchAsync(async (req, res) => {
    const bookings = await bookingService.listUserBookings(req.user.userId);
    res.json(bookings);
});

const cancel = catchAsync(async (req, res) => {
    const token = req.headers.authorization;
    const result = await bookingService.cancelBooking(
        req.params.id,
        req.user.userId,
        req.user.userRole,
        token
    );
    res.json(result);
});

const remove = catchAsync(async (req, res) => {
    if (req.user?.userRole?.toLowerCase() !== 'admin') {
        return res.status(403).json({ message: 'Admin only' });
    }
    const result = await bookingService.deleteBooking(req.params.id);
    res.json(result);
});

module.exports = { create, listAll, listMine, cancel, remove };