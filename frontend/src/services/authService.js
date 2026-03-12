import axios from 'axios';

const API_URL = 'http://localhost:9090/api/auth';

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

export const authService = {
  // Voter registration
  registerVoter: async (voterData, faceImage) => {
    const formData = new FormData();
    formData.append('voter', new Blob([JSON.stringify(voterData)], { type: 'application/json' }));
    formData.append('faceImage', faceImage);
    
    return axiosInstance.post('/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Initiate login (send OTP)
  initiateLogin: async (identifier) => {
    return axiosInstance.post('/login/initiate', { identifier });
  },

  // Complete login with face verification and OTP
  verifyLogin: async (identifier, faceImage, otp) => {
    const formData = new FormData();
    formData.append('identifier', identifier);
    formData.append('faceImage', faceImage);
    formData.append('otp', otp);
    
    return axiosInstance.post('/login/verify', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Admin login
  adminLogin: async (username, password) => {
    return axiosInstance.post('/admin/login', { identifier: username, password });
  },

  // Verify token
  verifyToken: async (token) => {
    return axiosInstance.get('/verify-token', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Logout
  logout: async () => {
    return axiosInstance.post('/logout');
  },
};