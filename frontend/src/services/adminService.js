import axios from 'axios';

const API_BASE = 'http://localhost:9090/api/admin';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const adminService = {
  // Overview statistics
  getStatistics: () =>
    axios.get(`${API_BASE}/statistics`, { headers: getAuthHeaders() }),

  // All voters as safe DTOs (no faceEncoding/password)
  getVoters: () =>
    axios.get(`${API_BASE}/voters`, { headers: getAuthHeaders() }),

  // Aggregated results per candidate (LEFT JOIN so 0-vote candidates show up)
  getResults: () =>
    axios.get(`${API_BASE}/results`, { headers: getAuthHeaders() }),
};
