const Facility = require('../models/facility.model');
const Booking = require('../models/booking.model');
const { toMinutes, timesOverlap } = require('../utils/time');

async function listFacilities() {
    return Facility.find();
}

async function getFacilityById(id) {
    return Facility.findById(id);
}

async function checkAvailability(id, { date, startTime, endTime }) {
    if (!date || !startTime || !endTime) {
        throw Object.assign(new Error('date, startTime and endTime are required'), { status: 400 });
    }

    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        throw Object.assign(new Error('Invalid time format. Use HH:mm'), { status: 400 });
    }

    if (toMinutes(startTime) >= toMinutes(endTime)) {
        throw Object.assign(new Error('startTime must be before endTime'), { status: 400 });
    }

    const exists = await Facility.findById(id);
    if (!exists) throw Object.assign(new Error('Facility not found'), { status: 404 });

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
        throw Object.assign(new Error('name, type, location and capacity are required'), { status: 400 });
    }

    return Facility.create({
        name,
        type,
        location,
        capacity: Number(capacity),
        active: active !== undefined ? active : true,
    });
}

async function updateFacility(id, data) {
    const facility = await Facility.findById(id);
    if (!facility) throw Object.assign(new Error('Facility not found'), { status: 404 });

    const { name, type, location, capacity, active } = data;
    if (name     !== undefined) facility.name     = name;
    if (type     !== undefined) facility.type     = type;
    if (location !== undefined) facility.location = location;
    if (capacity !== undefined) facility.capacity = Number(capacity);
    if (active   !== undefined) facility.active   = active;

    await facility.save();
    return facility;
}

async function deleteFacility(id) {
    const deleted = await Facility.findByIdAndDelete(id);
    if (!deleted) throw Object.assign(new Error('Facility not found'), { status: 404 });
    
    return { message: 'Facility deleted successfully' };
}

module.exports = {
    listFacilities,
    getFacilityById,
    checkAvailability,
    createFacility,
    updateFacility,
    deleteFacility
};