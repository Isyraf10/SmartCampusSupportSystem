import api from '../API/axiosClient';

export const academicApi = {
  getProfile: () => api.get('/academic/profile').then((r) => r.data),
  getSchedule: () => api.get('/academic/schedule').then((r) => r.data),
  bookAdvisor: (data) => api.post('/academic/book-advisor', data).then((r) => r.data),
  cancelAppointment: (id) => api.delete(`/academic/appointments/${id}`).then((r) => r.data),
};