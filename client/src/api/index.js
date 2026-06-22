import api from './axios';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getPublicProfile: (id) => api.get(`/auth/profile/${id}`),
};

export const companyAPI = {
  getAll: (params) => api.get('/companies', { params }),
  getBySlug: (slug) => api.get(`/companies/${slug}`),
  create: (data) => api.post('/companies', data),
  update: (id, data) => api.put(`/companies/${id}`, data),
  delete: (id) => api.delete(`/companies/${id}`),
};

export const questionAPI = {
  getAll: (params) => api.get('/questions', { params }),
  getByCompany: (slug, params) => api.get(`/questions/company/${slug}`, { params }),
  getById: (id) => api.get(`/questions/${id}`),
  search: (params) => api.get('/questions/search', { params }),
  create: (data) => api.post('/questions', data),
  update: (id, data) => api.put(`/questions/${id}`, data),
  delete: (id) => api.delete(`/questions/${id}`),
};

export const progressAPI = {
  getDashboard: () => api.get('/progress/dashboard'),
  update: (questionId, data) => api.put(`/progress/${questionId}`, data),
  getBookmarks: (params) => api.get('/progress/bookmarks', { params }),
  getRevisions: (params) => api.get('/progress/revisions', { params }),
  getCalendar: (params) => api.get('/progress/calendar', { params }),
  export: () => api.get('/progress/export'),
};

export const noteAPI = {
  get: (questionId) => api.get(`/notes/${questionId}`),
  upsert: (questionId, content) => api.put(`/notes/${questionId}`, { content }),
  delete: (questionId) => api.delete(`/notes/${questionId}`),
  getAll: (params) => api.get('/notes', { params }),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getLeaderboard: (period) => api.get('/admin/leaderboard', { params: { period } }),
  getStats: () => api.get('/admin/stats'),
  importCSV: (formData) => api.post('/admin/import-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};
