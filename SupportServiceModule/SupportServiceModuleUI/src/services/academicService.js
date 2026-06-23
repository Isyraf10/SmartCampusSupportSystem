import api from '../API/axiosClient';

export const academicApi = {
  getProfile: () => api.get('/academic/profile'),
  getSchedule: () => api.get('/academic/schedule'),
  bookAdvisor: (data) => api.post('/academic/book-advisor', data),
  getAppointments: () => api.get('/academic/appointments'),
  cancelAppointment: (id) => api.delete(`/academic/appointments/${id}`),
};