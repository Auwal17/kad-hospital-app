import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, UserCircle } from 'lucide-react';
import api from '../api/axiosConfig';
import MainLayout from '../layouts/MainLayout';
import Modal from '../components/Modal';

export default function Patients() {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        first_name: '', last_name: '', gender: 'M', 
        date_of_birth: '', phone: '', address: '', 
        blood_group: 'O+', next_of_kin: ''
    });

    // 1. Fetch Patients from Django
    const fetchPatients = async () => {
        try {
            // Notice how we use the search query here! Django's SearchFilter handles the rest.
            const response = await api.get(`patients/?search=${searchQuery}`);
            setPatients(response.data.results || response.data);
        } catch (error) {
            console.error("Error fetching patients:", error);
        }
    };

    // Re-fetch whenever the search query changes
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchPatients();
        }, 500); // Wait 500ms after user stops typing before searching
        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    // 2. Handle Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('patients/', formData);
            setIsModalOpen(false); // Close modal
            fetchPatients();       // Refresh the table
            setFormData({          // Reset form
                first_name: '', last_name: '', gender: 'M', 
                date_of_birth: '', phone: '', address: '', 
                blood_group: 'O+', next_of_kin: ''
            });
        } catch (error) {
            alert("Error creating patient. Check the console.");
            console.error(error);
        }
    };
    const handleCreateVisit = async (patientId) => {
        try {
            // Step 1: Create the Visit record
            const visitResponse = await api.post('visits/', { patient: patientId });
            
            // Step 2: Grab the ID of the newly created Visit
            const newVisitId = visitResponse.data.id;
            
            // Step 3: Send that Visit ID to the Queue system to generate the ticket
            await api.post('queue/', { visit: newVisitId });
            
            alert('Patient successfully sent to the Doctor!');
        } catch (error) {
            alert('Failed to add patient to queue. Check console for details.');
            console.error(error.response?.data || error.message);
        }
    };
    return (
        <MainLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Patient Registry</h1>
                    <p className="text-gray-600">Manage hospital patients and records.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center bg-medical-600 text-white px-4 py-2 rounded-lg hover:bg-medical-700 transition-colors"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    New Patient
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center">
                <Search className="h-5 w-5 text-gray-400 mr-3" />
                <input 
                    type="text" 
                    placeholder="Search by name, phone, or patient ID (e.g., PT-2026...)"
                    className="w-full focus:outline-none text-gray-700"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-100">
                            <th className="p-4 font-medium">Patient ID</th>
                            <th className="p-4 font-medium">Name</th>
                            <th className="p-4 font-medium">Gender/Age</th>
                            <th className="p-4 font-medium">Phone</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {patients.map((patient) => (
                            <tr key={patient.id} className="hover:bg-medical-50 transition-colors">
                                <td className="p-4 font-mono text-sm text-medical-700 font-semibold">
                                    {patient.patient_number}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center">
                                        <UserCircle className="h-8 w-8 text-gray-300 mr-3" />
                                        <span className="font-medium text-gray-800">
                                            {patient.first_name} {patient.last_name}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-600">
                                    {patient.gender} • {patient.date_of_birth}
                                </td>
                                <td className="p-4 text-gray-600">{patient.phone}</td>
                                
                                <td className="p-4 text-right space-x-2">
                                    <button 
                                        onClick={() => navigate(`/patients/${patient.id}`)}
                                        className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors font-medium border border-gray-200"
                                    >
                                        View Profile
                                    </button>
                                    <button 
                                        onClick={() => handleCreateVisit(patient.id)}
                                        className="text-sm bg-medical-100 text-medical-700 px-3 py-1 rounded hover:bg-medical-200 transition-colors font-medium"
                                    >
                                        Send to Doctor
                                    </button>
                            </td>
                            </tr>
                        ))}
                        {patients.length === 0 && (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-gray-500">
                                    No patients found. Try adjusting your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Registration Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Patient">
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input type="text" required className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-medical-500"
                            value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input type="text" required className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-medical-500"
                            value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <select className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-medical-500"
                            value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <input type="date" required className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-medical-500"
                            value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input type="tel" required className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-medical-500"
                            value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                        <select className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-medical-500"
                            value={formData.blood_group} onChange={e => setFormData({...formData, blood_group: e.target.value})}>
                            <option value="A+">A+</option><option value="O+">O+</option><option value="B+">B+</option><option value="AB+">AB+</option>
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Next of Kin (Name & Phone)</label>
                        <input type="text" required className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-medical-500"
                            value={formData.next_of_kin} onChange={e => setFormData({...formData, next_of_kin: e.target.value})} />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Home Address</label>
                        <textarea required className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-medical-500"
                            value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>
                    
                    <div className="col-span-2 flex justify-end mt-4">
                        <button type="submit" className="bg-medical-600 text-white px-6 py-2 rounded hover:bg-medical-700">
                            Save Patient
                        </button>
                    </div>
                </form>
            </Modal>
        </MainLayout>
    );
}