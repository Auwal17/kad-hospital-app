import axios from 'axios';

// Create a custom Axios instance pointing to your Django local server
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
});

// Intercept every request BEFORE it leaves React
api.interceptors.request.use(
    (config) => {
        // Grab the token from local storage
        const token = localStorage.getItem('access_token');
        if (token) {
            // Attach the master keycard to the request headers
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// We will add the "Refresh Token" logic later in the Auth phase!

export default api;