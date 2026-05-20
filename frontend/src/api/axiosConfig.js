import axios from 'axios';

// Dynamically choose Render (Cloud) or localhost (Laptop)
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/',
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

export default api;