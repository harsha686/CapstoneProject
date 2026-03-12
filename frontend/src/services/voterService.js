import axios from 'axios';

const API_URL = 'http://localhost:9090/api/voters';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const voterService = {
  // Get all voters
  getAllVoters: async () => {
    return axiosInstance.get('/');
  },

  // Get voter by ID
  getVoterById: async (id) => {
    return axiosInstance.get(`/${id}`);
  },

  // Get voter by EPIC number
  getVoterByEpicNumber: async (epicNumber) => {
    return axiosInstance.get(`/epic/${epicNumber}`);
  },

  // Update voter
  updateVoter: async (id, voterData) => {
    return axiosInstance.put(`/${id}`, voterData);
  },

  // Delete voter
  deleteVoter: async (id) => {
    return axiosInstance.delete(`/${id}`);
  },

  // Verify voter
  verifyVoter: async (id) => {
    return axiosInstance.put(`/${id}/verify`);
  },

  // Get unverified voters
  getUnverifiedVoters: async () => {
    return axiosInstance.get('/unverified');
  },

  // Get voters by constituency
  getVotersByConstituency: async (constituencyId) => {
    return axiosInstance.get(`/constituency/${constituencyId}`);
  },

  // Get voter statistics
  getVoterStatistics: async () => {
    return axiosInstance.get('/statistics');
  },

  // Get constituency voter statistics
  getConstituencyVoterStatistics: async (constituencyId) => {
    return axiosInstance.get(`/constituency/${constituencyId}/statistics`);
  },

  // Check if voter has voted
  hasVoterVoted: async (epicNumber) => {
    return axiosInstance.get(`/${epicNumber}/has-voted`);
  },

  // Check if voter is eligible
  isVoterEligible: async (epicNumber) => {
    return axiosInstance.get(`/${epicNumber}/is-eligible`);
  },
};