import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api/v1';

const getHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

const notificationService = {
  getMyNotifications: (token) =>
    axios.get(`${API_URL}/notifications/my`, getHeaders(token)),

  getAllNotifications: (token) =>
    axios.get(`${API_URL}/notifications`, getHeaders(token)),

  getById: (id, token) =>
    axios.get(`${API_URL}/notifications/${id}`, getHeaders(token)),

  markAsRead: (id, token) =>
    axios.put(`${API_URL}/notifications/${id}/read`, {}, getHeaders(token)),

  deleteNotification: (id, token) =>
    axios.delete(`${API_URL}/notifications/${id}`, getHeaders(token)),

  clearAll: (token) =>
    axios.delete(`${API_URL}/notifications/my/all`, getHeaders(token)),

  sendNotification: (data, token) =>
    axios.post(`${API_URL}/notifications/send`, data, getHeaders(token)),

  healthCheck: () =>
    axios.get(`${API_URL}/health`),
};

export default notificationService;
