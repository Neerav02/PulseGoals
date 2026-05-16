const API_BASE = '/api';

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('pulsegoals_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('pulsegoals_token');
    localStorage.removeItem('pulsegoals_user');
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  // Handle blob responses (Excel exports)
  if (options.responseType === 'blob') {
    if (!response.ok) throw new Error('Export failed');
    return response.blob();
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export const api = {
  // Auth
  register: (data) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (email, password) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => apiRequest('/auth/me'),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),

  // Goals
  getGoalSheet: (year) => apiRequest(`/goals/sheet?year=${year || new Date().getFullYear()}`),
  getUserGoalSheet: (userId, year) => apiRequest(`/goals/sheet/${userId}?year=${year || new Date().getFullYear()}`),
  createGoal: (data) => apiRequest('/goals', { method: 'POST', body: JSON.stringify(data) }),
  updateGoal: (id, data) => apiRequest(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteGoal: (id) => apiRequest(`/goals/${id}`, { method: 'DELETE' }),
  submitGoals: (year) => apiRequest('/goals/submit', { method: 'POST', body: JSON.stringify({ year }) }),
  approveGoals: (sheetId) => apiRequest(`/goals/approve/${sheetId}`, { method: 'POST' }),
  reworkGoals: (sheetId, comment) => apiRequest(`/goals/rework/${sheetId}`, { method: 'POST', body: JSON.stringify({ comment }) }),
  managerEditGoal: (goalId, data) => apiRequest(`/goals/manager-edit/${goalId}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Achievements
  getAchievements: (goalId) => apiRequest(`/achievements/${goalId}`),
  getUserAchievements: (userId, quarter, year) => apiRequest(`/achievements/user/${userId}?quarter=${quarter || ''}&year=${year || new Date().getFullYear()}`),
  saveAchievement: (data) => apiRequest('/achievements', { method: 'POST', body: JSON.stringify(data) }),
  submitAchievements: (quarter, year) => apiRequest('/achievements/submit', { method: 'POST', body: JSON.stringify({ quarter, year }) }),

  // Check-ins
  getCheckIns: (employeeId, quarter) => apiRequest(`/checkins/${employeeId}?quarter=${quarter || ''}`),
  createCheckIn: (data) => apiRequest('/checkins', { method: 'POST', body: JSON.stringify(data) }),

  // Notifications
  getNotifications: () => apiRequest('/notifications'),
  getUnreadCount: () => apiRequest('/notifications/unread-count'),
  markRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () => apiRequest('/notifications/mark-all-read', { method: 'PUT' }),

  // Admin
  getStats: (year) => apiRequest(`/admin/stats?year=${year || new Date().getFullYear()}`),
  getHeatmap: (year) => apiRequest(`/admin/heatmap?year=${year || new Date().getFullYear()}`),
  getCycles: () => apiRequest('/admin/cycles'),
  toggleCycle: (phase) => apiRequest(`/admin/cycles/${phase}/toggle`, { method: 'PUT' }),
  getUsers: () => apiRequest('/admin/users'),
  getUser: (id) => apiRequest(`/admin/users/${id}`),
  createUser: (data) => apiRequest('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => apiRequest(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getTeam: (managerId, year) => apiRequest(`/admin/team/${managerId}?year=${year || new Date().getFullYear()}`),
  getSharedGoals: () => apiRequest('/admin/shared-goals'),
  createSharedGoal: (data) => apiRequest('/admin/shared-goals', { method: 'POST', body: JSON.stringify(data) }),
  exportReport: (data) => apiRequest('/admin/export', { method: 'POST', body: JSON.stringify(data), responseType: 'blob' }),
  getExportPreview: (quarter, year) => apiRequest(`/admin/export/preview?quarter=${quarter || ''}&year=${year || new Date().getFullYear()}`),
  getAuditLogs: (filters) => {
    const params = new URLSearchParams(filters).toString();
    return apiRequest(`/admin/audit-logs?${params}`);
  },
  getAnalytics: (year) => apiRequest(`/admin/analytics?year=${year || new Date().getFullYear()}`),

  // AI
  reviewGoal: (title, description) => apiRequest('/ai/review', { method: 'POST', body: JSON.stringify({ title, description }) }),
};
