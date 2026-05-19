import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

const useAuthStore = create((set) => ({
    // Check if a token already exists in the browser when the app loads
    token: localStorage.getItem('access_token') || null,
    user: localStorage.getItem('access_token') ? jwtDecode(localStorage.getItem('access_token')) : null,
    isAuthenticated: !!localStorage.getItem('access_token'),

    // The function to run when the user successfully logs in
    login: (token, refreshToken) => {
        localStorage.setItem('access_token', token);
        localStorage.setItem('refresh_token', refreshToken);
        set({ 
            token: token, 
            user: jwtDecode(token), 
            isAuthenticated: true 
        });
    },

    // The function to run when the user clicks "Logout"
    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ token: null, user: null, isAuthenticated: false });
    }
}));

export default useAuthStore;