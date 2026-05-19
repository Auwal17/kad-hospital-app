import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Clock, CheckCircle } from 'lucide-react';
import api from '../api/axiosConfig';
import MainLayout from '../layouts/MainLayout';

export default function Consultations() {
    const [queue, setQueue] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const fetchQueue = async () => {
        try {
            // Our Django viewset is already configured to only return TODAY's queue!
            const response = await api.get('queue/');
            setQueue(response.data.results || response.data);
        } catch (error) {
            console.error("Error fetching queue:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
        // In a production app, you might set an interval here to refresh the queue every 30 seconds
    }, []);

    const getStatusColor = (status) => {
        switch(status) {
            case 'waiting': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'done': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <MainLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Doctor's Queue</h1>
                <p className="text-gray-600">Patients waiting for consultation today.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading today's queue...</div>
                ) : queue.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <CheckCircle className="h-12 w-12 text-medical-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">Queue is empty</h3>
                        <p className="text-gray-500">There are no patients waiting to be seen right now.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {queue.map((ticket) => (
                            <div key={ticket.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="h-12 w-12 bg-medical-50 text-medical-700 rounded-full flex items-center justify-center font-bold text-lg border border-medical-200">
                                        #{ticket.queue_number}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900">
                                            {ticket.visit_details.patient_details.first_name} {ticket.visit_details.patient_details.last_name}
                                        </h4>
                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                            <span className="font-mono">{ticket.visit_details.patient_details.patient_number}</span>
                                            <span className="mx-2">•</span>
                                            <Clock className="h-4 w-4 mr-1" />
                                            {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                                        {ticket.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                    <button 
                                        onClick={() => navigate(`/consultation/${ticket.visit}`)} 
                                        className="bg-medical-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-medical-700 transition-colors"
                                    >
                                        Begin Consultation
                                    </button>
                                    
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}