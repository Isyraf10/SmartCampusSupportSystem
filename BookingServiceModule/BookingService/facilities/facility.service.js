const Facility = require('./facility.model');
const Booking = require('../bookings/booking.model');
const { toMinutes, timesOverlap } = require('../utils/time');

function formatFacility(facility) {
    return { ...facility.toObject(), id: facility._id };
}

async function listFacilities() {
    const facilities = await Facility.find();
    return facilities.map(formatFacility);
}

async function getFacilityById(id) {
    return Facility.findById(id);
}

async function checkAvailability(id, { date, startTime, endTime }) {
    if (!date || !startTime || !endTime) {
        const err = new Error('date, startTime and endTime are required');
        err.status = 400;
        throw err;
    }

    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        const err = new Error('Invalid time format. Use HH:mm');
        err.status = 400;
        throw err;
    }

    if (toMinutes(startTime) >= toMinutes(endTime)) {
        const err = new Error('startTime must be before endTime');
        err.status = 400;
        throw err;
    }

    const exists = await Facility.findById(id);
    if (!exists) {
        const err = new Error('Facility not found');
        err.status = 404;
        throw err;
    }

    const bookings = await Booking.find({
        facilityId: id,
        date,
        status: { $ne: 'CANCELLED' },
    });

    const conflicts = bookings.filter(b =>
        timesOverlap(startTime, endTime, b.startTime, b.endTime)
    ).length;

    return { available: conflicts === 0, conflicts };
}

async function createFacility(data) {
    const { name, type, location, capacity, active } = data;
    if (!name || !type || !location || !capacity) {
        const err = new Error('name, type, location and capacity are required');
        err.status = 400;
        throw err;
    }

    const facility = await Facility.create({
        name,
        type,
        location,
        capacity: Number(capacity),
        active: active !== undefined ? active : true,
    });

    return formatFacility(facility);
}

async function updateFacility(id, data) {
    const facility = await Facility.findById(id);
    if (!facility) {
        const err = new Error('Facility not found');
        err.status = 404;
        throw err;
    }

    const { name, type, location, capacity, active } = data;
    if (name     !== undefined) facility.name     = name;
    if (type     !== undefined) facility.type     = type;
    if (location !== undefined) facility.location = location;
    if (capacity !== undefined) facility.capacity = Number(capacity);
    if (active   !== undefined) facility.active   = active;

    await facility.save();
    return formatFacility(facility);
}

async function deleteFacility(id) {
    const deleted = await Facility.findByIdAndDelete(id);
    if (!deleted) {
        const err = new Error('Facility not found');
        err.status = 404;
        throw err;
    }
    return { message: 'Facility deleted successfully' };
}

module.exports = {
    listFacilities,
    getFacilityById,
    checkAvailability,
    createFacility,
    updateFacility,
    deleteFacility,
    formatFacility,
};
