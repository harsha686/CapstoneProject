import axios from 'axios';

const API_URL = 'http://localhost:9090/api/votes';

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

export const voteService = {
  // Cast vote
  castVote: async (voterId, candidateId) => {
    return axiosInstance.post('/cast', { voterId, candidateId });
  },

  // Get vote results for a constituency
  getVoteResults: async (constituencyId) => {
    return axiosInstance.get(`/results/constituency/${constituencyId}`);
  },

  // Get overall results
  getOverallResults: async () => {
    return axiosInstance.get('/results/overall');
  },

  // Check if voter has voted
  hasVoterVoted: async (voterId) => {
    return axiosInstance.get(`/voter/${voterId}/has-voted`);
  },

  // Get vote by voter
  getVoteByVoter: async (voterId) => {
    return axiosInstance.get(`/voter/${voterId}`);
  },
};