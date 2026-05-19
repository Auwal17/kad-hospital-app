import { useState, useEffect } from 'react';
import { TestTubes, CheckCircle, FileText, Plus } from 'lucide-react';
import api from '../api/axiosConfig';
import MainLayout from '../layouts/MainLayout';
import Modal from '../components/Modal';

export default function Laboratory() {
    const [requests, setRequests] = useState([]);
    const [testTypes, setTestTypes] = useState([]);
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const [isTestTypeModalOpen, setIsTestTypeModalOpen] = useState(false);
    
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [resultText, setResultText] = useState('');
    const [newTestName, setNewTestName] = useState('');

    const fetchData = async () => {
        try {
            const [reqRes, typeRes] = await Promise.all([
                api.get('lab/requests/?status=pending'),
                api.get('lab/test-types/')
            ]);
            setRequests(reqRes.data.results || reqRes.data);
            setTestTypes(typeRes.data.results || typeRes.data);
        } catch (error) {
            console.error("Error fetching lab data", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Add a new type of test to the hospital catalog (e.g., "Malaria Parasite")
    // Add a new type of test to the hospital catalog
    const handleAddTestType = async (e) => {
        e.preventDefault();
        try {
            console.log("Sending new test to Django:", { name: newTestName }); // For debugging
            
            await api.post('lab/test-types/', { name: newTestName });
            
            setNewTestName('');
            setIsTestTypeModalOpen(false);
            fetchData();
            alert('Success! Lab test type added to the hospital catalog.');
        } catch (error) {
            // This extracts the exact reason Django rejected it
            const errorMessage = error.response?.data 
                ? JSON.stringify(error.response.data) 
                : error.message;
                
            alert(`Django Error (Add Test): ${errorMessage}`);
            console.error("Full error details:", error);
        }
    };

    // Submit the patient's lab result
    const handleSubmitResult = async (e) => {
        e.preventDefault();
        try {
            await api.post('lab/results/', {
                lab_request: selectedRequest.id,
                result_text: resultText
            });
            alert('Result saved! Patient sent back to Doctor.');
            setResultText('');
            setSelectedRequest(null);
            setIsResultModalOpen(false);
            fetchData();
        } catch (error) {
            alert('Error saving result.');
        }
    };

    return (
        <MainLayout>
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Laboratory Portal</h1>
                    <p className="text-gray-600">Process pending tests and upload results.</p>
                </div>
                <button onClick={() => setIsTestTypeModalOpen(true)} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm flex items-center">
                    <Plus className="h-4 w-4 mr-2" /> Add Lab Test Type
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {requests.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                        <CheckCircle className="h-12 w-12 text-green-400 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">Queue Empty</h3>
                        <p>No pending lab tests at the moment.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {requests.map((req) => (
                            <div key={req.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                                        <TestTubes className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900">{req.test_name}</h4>
                                        <p className="text-gray-600 text-sm">Visit #{req.visit} • Ordered at {new Date(req.requested_at).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => { setSelectedRequest(req); setIsResultModalOpen(true); }}
                                    className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                                >
                                    Enter Result
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal for adding new Test Types (like Malaria, X-Ray) */}
            <Modal isOpen={isTestTypeModalOpen} onClose={() => setIsTestTypeModalOpen(false)} title="New Test Type">
                <form onSubmit={handleAddTestType}>
                    <label className="block text-sm font-medium mb-1">Test Name (e.g., Full Blood Count)</label>
                    <input type="text" required className="w-full p-2 border rounded mb-4" value={newTestName} onChange={e => setNewTestName(e.target.value)} />
                    <button type="submit" className="w-full bg-gray-800 text-white py-2 rounded">Save</button>
                </form>
            </Modal>

            {/* Modal for entering the patient's result */}
            <Modal isOpen={isResultModalOpen} onClose={() => setIsResultModalOpen(false)} title={`Result for ${selectedRequest?.test_name}`}>
                <form onSubmit={handleSubmitResult}>
                    <label className="block text-sm font-medium mb-1">Clinical Findings</label>
                    <textarea required rows="4" className="w-full p-2 border rounded mb-4" placeholder="Type the test results here..." value={resultText} onChange={e => setResultText(e.target.value)} />
                    <button type="submit" className="w-full bg-orange-600 text-white py-2 rounded">Submit Result to Doctor</button>
                </form>
            </Modal>
        </MainLayout>
    );
}