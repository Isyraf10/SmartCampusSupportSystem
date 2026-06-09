import api from '../api/axiosClient';

export const bookingApi = {
  getFacilities: () => api.get('/facilities').then((r) => r.data),

  createFacility: (data) => api.post('/facilities', data).then((r) => r.data),

  updateFacility: (id, data) => api.put(`/facilities/${id}`, data).then((r) => r.data),

  deleteFacility: (id) => api.delete(`/facilities/${id}`).then((r) => r.data),

  getBookings: (isAdmin) =>
    api.get(isAdmin ? '/bookings' : '/bookings/me').then((r) => r.data),

  createBooking: (data) => api.post('/bookings', data).then((r) => r.data),

  cancelBooking: (id) => api.put(`/bookings/${id}/cancel`).then((r) => r.data),
};
