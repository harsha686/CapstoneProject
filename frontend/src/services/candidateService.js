import axios from 'axios';

const API_URL = 'http://localhost:9090';

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

export const candidateService = {
    // Get active candidates for Voter Dashboard
    getActiveCandidates: async () => {
        return axiosInstance.get('/api/candidates');
    },

    // Get all candidates for Admin View
    getAllCandidates: async () => {
        return axiosInstance.get('/api/candidates/admin');
    },

    // Add new candidate
    addCandidate: async (candidateData) => {
        return axiosInstance.post('/api/candidates', candidateData);
    },

    // Update candidate details
    updateCandidate: async (id, candidateData) => {
        return axiosInstance.put(`/api/candidates/${id}`, candidateData);
    },

    // Toggle candidate status
    toggleCandidateStatus: async (id) => {
        return axiosInstance.patch(`/api/candidates/${id}/toggle`);
    },

    // Delete candidate
    deleteCandidate: async (id) => {
        return axiosInstance.delete(`/api/candidates/${id}`);
    },

    // Get all constituencies
    getCandidatesByConstituency: async (constituencyId) => {
        return axiosInstance.get(`/api/candidates/constituency/${constituencyId}`);
    },

    getConstituencies: async () => {
        return axiosInstance.get('/api/constituencies');
    }
};
