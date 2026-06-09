const { v4: uuidv4 } = require('uuid');
const Event = require('../models/Event');
const Notification = require('../models/Notification');

// GET /api/v1/events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json({ success: true, count: events.length, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// GET /api/v1/events/:id
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    res.json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// POST /api/v1/events (Admin)
const createEvent = async (req, res) => {
  try {
    const { title, description, location, date, time, organizer, capacity } = req.body;
    if (!title || !date || !location) {
      return res.status(400).json({ success: false, message: 'title, date and location are required.' });
    }
    const event = await Event.create({ title, description, location, date, time, organizer, capacity });
    res.status(201).json({ success: true, message: 'Event created successfully.', data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// PUT /api/v1/events/:id (Admin)
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    res.json({ success: true, message: 'Event updated.', data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// DELETE /api/v1/events/:id (Admin)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    res.json({ success: true, message: 'Event deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// POST /api/v1/events/:id/register (Protected)
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    const userId = req.user?.id || req.user?._id;
    const userName = req.user?.name || 'Unknown';

    if (event.registrations.find(r => r.userId === userId)) {
      return res.status(409).json({ success: false, message: 'Already registered for this event.' });
    }

    if (event.registrations.length >= event.capacity) {
      return res.status(400).json({ success: false, message: 'Event is fully booked.' });
    }

    const registration = { registrationId: `reg-${uuidv4().slice(0,8)}`, userId, userName };
    event.registrations.push(registration);
    await event.save();

    // Save notification to MongoDB
    const notif = await Notification.create({
      userId,
      type: 'EVENT_REGISTRATION',
      message: `You have successfully registered for "${event.title}" on ${event.date} at ${event.time}.`,
      metadata: { eventId: event._id, eventTitle: event.title },
    });

    console.log(`[NOTIFICATION] Sent to user ${userId}: ${notif.message}`);

    res.status(201).json({
      success: true,
      message: `Successfully registered for "${event.title}".`,
      data: { registration, notification: notif },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// DELETE /api/v1/events/:id/register (Protected)
const cancelRegistration = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    const userId = req.user?.id || req.user?._id;
    const regIndex = event.registrations.findIndex(r => r.userId === userId);
    if (regIndex === -1) return res.status(404).json({ success: false, message: 'Not registered for this event.' });

    event.registrations.splice(regIndex, 1);
    await event.save();

    await Notification.create({
      userId,
      type: 'EVENT_CANCELLATION',
      message: `Your registration for "${event.title}" has been cancelled.`,
      metadata: { eventId: event._id },
    });

    res.json({ success: true, message: 'Registration cancelled.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// GET /api/v1/events/:id/registrations (Admin)
const getEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    res.json({
      success: true,
      eventTitle: event.title,
      totalRegistered: event.registrations.length,
      capacity: event.capacity,
      data: event.registrations,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent, registerForEvent, cancelRegistration, getEventRegistrations };
