/**
 * bookingService.js — bookingService frontend
 *
 * All API calls go through axiosClient which automatically
 * attaches the Bearer token and handles 401 redirects.
 */

import api from '../api/axiosClient';

export const bookingApi = {
  // ── Facilities ─────────────────────────────────────────────────────────────
  getFacilities: () =>
    api.get(`/facilities?_=${Date.now()}`).then((r) => r.data),

  createFacility: (data) =>
    api.post('/facilities', data).then((r) => r.data),

  updateFacility: (id, data) =>
    api.put(`/facilities/${id}`, data).then((r) => r.data),

  deleteFacility: (id) =>
    api.delete(`/facilities/${id}`).then((r) => r.data),

  // ── Bookings ───────────────────────────────────────────────────────────────
  // Admin → GET /bookings        (all bookings in the system)
  // User  → GET /bookings/me     (only their own bookings)
  getBookings: (isAdmin) =>
    api.get(isAdmin ? `/bookings?_=${Date.now()}` : `/bookings/me?_=${Date.now()}`).then((r) => r.data),

  createBooking: (data) =>
    api.post('/bookings', data).then((r) => r.data),

  cancelBooking: (id) =>
    api.put(`/bookings/${id}/cancel`).then((r) => r.data),

  // ADDED: Permanently delete a booking (Admin feature)
  deleteBooking: (id) =>
    api.delete(`/bookings/${id}`).then((r) => r.data),
};