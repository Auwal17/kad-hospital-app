import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Stethoscope, TestTubes, Pill, Bed, LogOut } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function MainLayout({ children }) {
    const { user, logout } = useAuthStore();
    const location = useLocation();

    // Determine role name safely
    const roleName = user?.role_name || 'Staff';

    // Navigation links (we will filter these by role later for strict security)
    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Patients', path: '/patients', icon: Users },
        { name: 'Consultations', path: '/consultations', icon: Stethoscope },
        { name: 'Laboratory', path: '/laboratory', icon: TestTubes },
        { name: 'Pharmacy', path: '/pharmacy', icon: Pill },
        { name: 'Admissions', path: '/admissions', icon: Bed },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-medical-900 text-white flex flex-col">
                <div className="p-6 border-b border-medical-700">
                    <h1 className="text-2xl font-bold text-medical-50 tracking-wide">KadHospital</h1>
                    <p className="text-medical-100 text-sm mt-1">{roleName} Portal</p>
                </div>
                
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                                    isActive 
                                    ? 'bg-medical-700 text-white' 
                                    : 'text-medical-100 hover:bg-medical-800 hover:text-white'
                                }`}
                            >
                                <Icon className="h-5 w-5 mr-3" />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-medical-700">
                    <button 
                        onClick={logout}
                        className="flex items-center w-full px-4 py-2 text-medical-100 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                    >
                        <LogOut className="h-5 w-5 mr-3" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 z-10">
                    <h2 className="text-xl font-semibold text-gray-800 capitalize">
                        {location.pathname.split('/')[1] || 'Dashboard'}
                    </h2>
                    <div className="flex items-center space-x-4">
                        <div className="h-8 w-8 bg-medical-100 text-medical-700 rounded-full flex items-center justify-center font-bold">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{user?.username}</span>
                    </div>
                </header>

                {/* Page Content goes here */}
                <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
}