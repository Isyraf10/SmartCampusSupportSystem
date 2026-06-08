const mongoose = require('mongoose');

// ── Facility Model ─────────────────────────────────────────────────────────
// Maps to the 'facilities' collection — same structure as the Java version
const facilitySchema = new mongoose.Schema({
    name:     { type: String, required: true },
    type:     { type: String, required: true },
    location: { type: String, required: true },
    capacity: { type: Number, required: true },
    active:   { type: Boolean, default: true },
});

// ── Booking Model ──────────────────────────────────────────────────────────
// Maps to the 'bookings' collection — same structure as the Java version
const bookingSchema = new mongoose.Schema({
    facilityId: { type: String, required: true },
    userId:     { type: String, required: true },
    date:       { type: String, required: true },   // e.g. "2026-07-01"
    startTime:  { type: String, required: true },   // e.g. "10:00"
    endTime:    { type: String, required: true },   // e.g. "12:00"
    status:     { type: String, default: 'CONFIRMED' },
    createdAt:  { type: Date,   default: Date.now },
});

const Facility = mongoose.model('Facility', facilitySchema);
const Booking  = mongoose.model('Booking',  bookingSchema);

module.exports = { Facility, Booking };
