import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, Pill, TestTubes, Activity, ArrowRight } from 'lucide-react';
import api from '../api/axiosConfig';
import MainLayout from '../layouts/MainLayout';
import useAuthStore from '../store/authStore';

export default function Dashboard() {
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();
    
    const [stats, setStats] = useState({
        totalPatients: 0,
        waitingQueue: 0,
        pendingLabs: 0,
        pendingPrescriptions: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHospitalStats = async () => {
            try {
                // We fire all 4 database requests at the exact same time for maximum speed
                const [patientsRes, queueRes, labRes, rxRes] = await Promise.all([
                    api.get('patients/'),
                    api.get('queue/'),
                    api.get('lab/requests/?status=pending'),
                    api.get('prescriptions/?status=pending')
                ]);

                // Django might return paginated data (.count) or raw arrays (.length)
                setStats({
                    totalPatients: patientsRes.data.count || patientsRes.data.results?.length || patientsRes.data.length || 0,
                    waitingQueue: queueRes.data.count || queueRes.data.results?.length || queueRes.data.length || 0,
                    pendingLabs: labRes.data.count || labRes.data.results?.length || labRes.data.length || 0,
                    pendingPrescriptions: rxRes.data.count || rxRes.data.results?.length || rxRes.data.length || 0
                });
            } catch (error) {
                console.error("Error fetching dashboard analytics:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHospitalStats();
    }, []);

    // A reusable component for our stat cards
    const StatCard = ({ title, count, icon: Icon, colorClass, borderClass, link }) => (
        <div 
            onClick={() => navigate(link)}
            className={`bg-white p-6 rounded-xl shadow-sm border-t-4 ${borderClass} hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">{title}</h3>
                    <p className={`text-4xl font-black ${colorClass}`}>
                        {isLoading ? '...' : count}
                    </p>
                </div>
                <div className={`p-3 rounded-full bg-opacity-10 ${colorClass.replace('text-', 'bg-')}`}>
                    <Icon className={`h-8 w-8 ${colorClass}`} />
                </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500 font-medium">
                View details <ArrowRight className="h-4 w-4 ml-1" />
            </div>
        </div>
    );

    return (
        <MainLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hospital Overview</h1>
                <p className="text-gray-600 mt-1 text-lg">Welcome back, Dr. {user?.username}. Here is the live status of the facility.</p>
            </div>
            
            {/* Live Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Total Registered Patients" 
                    count={stats.totalPatients} 
                    icon={Users} 
                    colorClass="text-blue-600" 
                    borderClass="border-blue-500"
                    link="/patients"
                />
                <StatCard 
                    title="Doctor's Waiting Queue" 
                    count={stats.waitingQueue} 
                    icon={Clock} 
                    colorClass="text-medical-600" 
                    borderClass="border-medical-500"
                    link="/consultations"
                />
                <StatCard 
                    title="Pending Lab Tests" 
                    count={stats.pendingLabs} 
                    icon={TestTubes} 
                    colorClass="text-orange-500" 
                    borderClass="border-orange-500"
                    link="/laboratory"
                />
                <StatCard 
                    title="Pending Prescriptions" 
                    count={stats.pendingPrescriptions} 
                    icon={Pill} 
                    colorClass="text-green-600" 
                    borderClass="border-green-500"
                    link="/pharmacy"
                />
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-medical-600" /> Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onClick={() => navigate('/patients')} className="p-4 border border-gray-200 rounded-lg text-left hover:border-medical-500 hover:bg-medical-50 transition-colors group">
                        <h4 className="font-bold text-gray-800 group-hover:text-medical-700">Register New Patient</h4>
                        <p className="text-sm text-gray-500 mt-1">Add a new arrival to the hospital records.</p>
                    </button>
                    <button onClick={() => navigate('/pharmacy')} className="p-4 border border-gray-200 rounded-lg text-left hover:border-green-500 hover:bg-green-50 transition-colors group">
                        <h4 className="font-bold text-gray-800 group-hover:text-green-700">Restock Pharmacy</h4>
                        <p className="text-sm text-gray-500 mt-1">Add new drug shipments to the inventory.</p>
                    </button>
                    <button onClick={() => navigate('/laboratory')} className="p-4 border border-gray-200 rounded-lg text-left hover:border-orange-500 hover:bg-orange-50 transition-colors group">
                        <h4 className="font-bold text-gray-800 group-hover:text-orange-700">Process Lab Results</h4>
                        <p className="text-sm text-gray-500 mt-1">Enter clinical findings for waiting patients.</p>
                    </button>
                </div>
            </div>
        </MainLayout>
    );
}