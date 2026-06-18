import api from '../api/axiosClient'

export const notificationApi = {
  // New health check method added here to fix the blank page error
  healthCheck: () => api.get('/health').then((r) => r.data),

  getMyNotifications: () => api.get('/notifications/my').then((r) => r.data),

  clearAll: () => api.delete('/notifications/my/all').then((r) => r.data),

  getById: (id) => api.get(`/notifications/${id}`).then((r) => r.data),

  markAsRead: (id) => api.put(`/notifications/${id}/read`, {}).then((r) => r.data),

  deleteNotification: (id) => api.delete(`/notifications/${id}`).then((r) => r.data),

  getAllNotifications: () => api.get('/notifications').then((r) => r.data),

  sendNotification: (data) => api.post('/notifications', data).then((r) => r.data)
}

export default notificationApi