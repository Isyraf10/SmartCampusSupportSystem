import api from '../api/axiosClient'

const notificationService = {
  healthCheck: () => api.get('/health').then((r) => r.data),
  getMyNotifications: (token) => api.get('/notifications/my', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.data),
  getAllNotifications: (token) => api.get('/notifications', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.data),
  getById: (id, token) => api.get(`/notifications/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.data),
  markAsRead: (id, token) => api.put(`/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.data),
  deleteNotification: (id, token) => api.delete(`/notifications/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.data),
  clearAll: (token) => api.delete('/notifications/my/all', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.data),
  sendNotification: (data, token) => api.post('/notifications', data, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.data),
  updateNotification: (id, data, token) => api.put(`/notifications/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.data)
}

export default notificationService
export const notificationApi = notificationService