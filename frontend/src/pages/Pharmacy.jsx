import { useState, useEffect } from 'react';
import { Pill, CheckCircle, Plus, Package } from 'lucide-react';
import api from '../api/axiosConfig';
import MainLayout from '../layouts/MainLayout';
import Modal from '../components/Modal';


export default function Pharmacy() {
    const [activeTab, setActiveTab] = useState('prescriptions'); // 'prescriptions' or 'inventory'
    
    // State for Data
    const [prescriptions, setPrescriptions] = useState([]);
    const [medications, setMedications] = useState([]);
    
    // State for Modals & Forms
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [drugForm, setDrugForm] = useState({ name: '', stock_quantity: 0, unit: 'Tablet', price: 0 });

    // Fetch Data
    const fetchData = async () => {
        try {
            const [rxRes, medRes] = await Promise.all([
                api.get('prescriptions/?status=pending'),
                api.get('medications/')
            ]);
            setPrescriptions(rxRes.data.results || rxRes.data);
            setMedications(medRes.data.results || medRes.data);
        } catch (error) {
            console.error("Error fetching pharmacy data", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle Dispensing a Drug
    const handleDispense = async (prescriptionId) => {
        try {
            // We use PATCH because we only want to update the status, not rewrite the whole record
            await api.patch(`prescriptions/${prescriptionId}/`, { status: 'dispensed' });
            alert("Medication dispensed successfully!");
            fetchData(); // Refresh the list
        } catch (error) {
            alert("Error dispensing medication.");
        }
    };

    // Handle Adding New Drug to Inventory
    const handleAddDrug = async (e) => {
        e.preventDefault();
        try {
            await api.post('medications/', drugForm);
            setIsModalOpen(false);
            setDrugForm({ name: '', stock_quantity: 0, unit: 'Tablet', price: 0 });
            fetchData();
        } catch (error) {
            alert("Error adding medication.");
        }
    };

    return (
        <MainLayout>
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pharmacy Portal</h1>
                    <p className="text-gray-600">Manage prescriptions and drug inventory.</p>
                </div>
                
                {/* Tabs */}
                <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                    <button 
                        onClick={() => setActiveTab('prescriptions')}
                        className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'prescriptions' ? 'bg-medical-50 text-medical-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Pending Prescriptions
                    </button>
                    <button 
                        onClick={() => setActiveTab('inventory')}
                        className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'inventory' ? 'bg-medical-50 text-medical-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Drug Inventory
                    </button>
                </div>
            </div>

            {/* TAB 1: PRESCRIPTIONS */}
            {activeTab === 'prescriptions' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {prescriptions.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                            <CheckCircle className="h-12 w-12 text-green-400 mb-3" />
                            <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
                            <p>No pending prescriptions in the queue.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {prescriptions.map((rx) => (
                                <div key={rx.id} className="p-6 hover:bg-gray-50 flex items-center justify-between">
                                    <div className="flex items-start space-x-4">
                                        <div className="bg-medical-100 p-3 rounded-full text-medical-600">
                                            <Pill className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900">{rx.medication_name}</h4>
                                            <p className="text-gray-600 mt-1">
                                                <span className="font-semibold text-gray-800">Dose:</span> {rx.dosage} | 
                                                <span className="font-semibold text-gray-800 ml-2">Freq:</span> {rx.frequency} | 
                                                <span className="font-semibold text-gray-800 ml-2">Duration:</span> {rx.duration}
                                            </p>
                                            {rx.instructions && (
                                                <p className="text-sm text-gray-500 mt-2 bg-yellow-50 p-2 rounded border border-yellow-100 inline-block">
                                                    Note: {rx.instructions}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDispense(rx.id)}
                                        className="bg-medical-600 text-white px-6 py-2 rounded-lg hover:bg-medical-700 transition-colors font-medium"
                                    >
                                        Dispense Drug
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: INVENTORY */}
            {activeTab === 'inventory' && (
                <div>
                    <div className="flex justify-end mb-4">
                        <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900">
                            <Plus className="h-5 w-5 mr-2" /> Add New Drug
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {medications.map(med => (
                            <div key={med.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                                <Package className="h-10 w-10 text-gray-400" />
                                <div>
                                    <h4 className="font-bold text-gray-900">{med.name}</h4>
                                    <p className="text-sm text-gray-500">Stock: <span className="font-semibold text-medical-600">{med.stock_quantity} {med.unit}s</span></p>
                                    <p className="text-sm text-gray-500">Price: ₦{med.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Drug Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Medication to Inventory">
                <form onSubmit={handleAddDrug} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Drug Name</label>
                        <input type="text" required className="w-full p-2 border rounded" placeholder="e.g., Artemether/Lumefantrine"
                            value={drugForm.name} onChange={e => setDrugForm({...drugForm, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                            <input type="number" required className="w-full p-2 border rounded"
                                value={drugForm.stock_quantity} onChange={e => setDrugForm({...drugForm, stock_quantity: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Type</label>
                            <select className="w-full p-2 border rounded" value={drugForm.unit} onChange={e => setDrugForm({...drugForm, unit: e.target.value})}>
                                <option value="Tablet">Tablet</option><option value="Syrup">Syrup (Bottle)</option><option value="Injection">Injection (Vial)</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
                        <input type="number" step="0.01" required className="w-full p-2 border rounded"
                            value={drugForm.price} onChange={e => setDrugForm({...drugForm, price: e.target.value})} />
                    </div>
                    <button type="submit" className="w-full bg-gray-800 text-white py-2 rounded mt-4">Save to Inventory</button>
                </form>
            </Modal>
        </MainLayout>
    );
}