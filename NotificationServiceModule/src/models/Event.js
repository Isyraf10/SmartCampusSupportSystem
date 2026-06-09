const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  registrationId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  registeredAt: { type: Date, default: Date.now },
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  location: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, default: 'TBD' },
  organizer: { type: String, default: 'Admin' },
  capacity: { type: Number, default: 100 },
  registrations: [registrationSchema],
  status: { type: String, default: 'upcoming' },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
