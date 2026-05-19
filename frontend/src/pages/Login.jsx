import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Lock, User } from 'lucide-react';
import api from '../api/axiosConfig';
import useAuthStore from '../store/authStore';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Axios sends the data to your Django backend
            const response = await api.post('auth/login/', {
                username: username,
                password: password
            });

            // If successful, pass the tokens to Zustand and redirect to Dashboard
            login(response.data.access, response.data.refresh);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid credentials. Please contact the IT Admin.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-medical-50">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border-t-4 border-medical-500">
                
                {/* Logo Area */}
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-medical-100 p-3 rounded-full mb-3">
                        <Activity className="h-8 w-8 text-medical-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Hospital Portal</h2>
                    <p className="text-gray-500 text-sm">Sign in to your account</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                                placeholder="Enter username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-medical-600 text-white py-2 px-4 rounded-lg hover:bg-medical-700 transition-colors font-medium flex justify-center items-center"
                    >
                        {isLoading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}