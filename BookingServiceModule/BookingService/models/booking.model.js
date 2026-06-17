const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    facilityId: { type: String, required: true },
    userId:     { type: String, required: true },
    date:       { type: String, required: true },
    startTime:  { type: String, required: true },
    endTime:    { type: String, required: true },
    status:     { type: String, default: 'CONFIRMED' },
    createdAt:  { type: Date,   default: Date.now },
});

bookingSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
});

module.exports = mongoose.model('Booking', bookingSchema);