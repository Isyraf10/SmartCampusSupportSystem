const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
    name:     { type: String, required: true },
    type:     { type: String, required: true },
    location: { type: String, required: true },
    capacity: { type: Number, required: true },
    active:   { type: Boolean, default: true },
});

facilitySchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
});

module.exports = mongoose.model('Facility', facilitySchema);