import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Activity, Stethoscope, Save, ArrowLeft, Pill, Plus, TestTubes } from 'lucide-react';
import api from '../api/axiosConfig';
import MainLayout from '../layouts/MainLayout';

export default function ConsultationRoom() {
    const { visitId } = useParams(); // This is a string from the URL
    const numericVisitId = parseInt(visitId, 10); // 👈 FIX: Convert to integer for Django!
    const navigate = useNavigate();
    
    // --- STATES ---
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        symptoms: '', diagnosis: '', vitals_temp: '', vitals_bp: '', vitals_weight: ''
    });

    const [medications, setMedications] = useState([]);
    const [testTypes, setTestTypes] = useState([]); // For Lab Tests
    
    const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
    const [prescriptionForm, setPrescriptionForm] = useState({
        medication: '', dosage: '', frequency: '', duration: '', instructions: ''
    });

    const [showLabForm, setShowLabForm] = useState(false);
    const [selectedLabTest, setSelectedLabTest] = useState('');

    // --- FETCH DATA (Drugs & Lab Tests) ---
    useEffect(() => {
        const fetchHospitalData = async () => {
            try {
                const [medRes, labRes] = await Promise.all([
                    api.get('medications/'),
                    api.get('lab/test-types/')
                ]);
                setMedications(medRes.data.results || medRes.data);
                setTestTypes(labRes.data.results || labRes.data);
            } catch (error) {
                console.error("Failed to load hospital data", error);
            }
        };
        fetchHospitalData();
    }, []);

    // --- HANDLERS ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                visit: numericVisitId, // 👈 Using the fixed integer!
                symptoms: formData.symptoms,
                diagnosis: formData.diagnosis,
                vitals: { Temp: formData.vitals_temp, BP: formData.vitals_bp, Weight: formData.vitals_weight }
            };
            await api.post('consultations/', payload);
            alert('Consultation notes saved successfully!');
        } catch (error) {
            alert('Error saving consultation.');
            console.error(error.response?.data || error);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePrescribe = async (e) => {
        e.preventDefault();
        try {
            await api.post('prescriptions/', { ...prescriptionForm, visit: numericVisitId });
            alert('Prescription sent to Pharmacy!');
            setShowPrescriptionForm(false);
            setPrescriptionForm({ medication: '', dosage: '', frequency: '', duration: '', instructions: '' });
        } catch (error) {
            alert('Failed to send prescription.');
        }
    };

    const handleRequestLab = async (e) => {
        e.preventDefault();
        try {
            await api.post('lab/requests/', { visit: numericVisitId, test_type: selectedLabTest });
            alert('Lab Test ordered! Patient sent to Laboratory.');
            setShowLabForm(false);
            setSelectedLabTest('');
            navigate('/consultations'); // Patient is no longer in the doctor's queue, they are at the lab!
        } catch (error) {
            alert('Failed to order lab test.');
        }
    };

    return (
        <MainLayout>
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('/consultations')} className="mr-4 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50"><ArrowLeft className="h-5 w-5" /></button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Consultation Room</h1>
                    <p className="text-gray-600">Recording medical notes for Visit #{numericVisitId}</p>
                </div>
            </div>

            {/* CLINICAL NOTES FORM */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-blue-500">
                    <div className="flex items-center mb-4">
                        <Activity className="h-5 w-5 text-blue-500 mr-2" />
                        <h2 className="text-lg font-semibold text-gray-800">Patient Vitals</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" placeholder="Temp (°C)" className="p-2 border rounded" value={formData.vitals_temp} onChange={e => setFormData({...formData, vitals_temp: e.target.value})} />
                        <input type="text" placeholder="BP (mmHg)" className="p-2 border rounded" value={formData.vitals_bp} onChange={e => setFormData({...formData, vitals_bp: e.target.value})} />
                        <input type="text" placeholder="Weight (kg)" className="p-2 border rounded" value={formData.vitals_weight} onChange={e => setFormData({...formData, vitals_weight: e.target.value})} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-medical-500">
                    <div className="flex items-center mb-4">
                        <Stethoscope className="h-5 w-5 text-medical-600 mr-2" />
                        <h2 className="text-lg font-semibold text-gray-800">Clinical Notes</h2>
                    </div>
                    <textarea required rows="2" placeholder="Presenting Symptoms *" className="w-full p-3 border rounded mb-4" value={formData.symptoms} onChange={e => setFormData({...formData, symptoms: e.target.value})} />
                    <textarea rows="2" placeholder="Doctor's Diagnosis" className="w-full p-3 border rounded" value={formData.diagnosis} onChange={e => setFormData({...formData, diagnosis: e.target.value})} />
                </div>

                <div className="flex justify-end">
                    <button type="submit" disabled={isSaving} className="bg-medical-600 text-white px-6 py-3 rounded-lg hover:bg-medical-700 font-medium">
                        {isSaving ? 'Saving...' : 'Save Consultation'}
                    </button>
                </div>
            </form>

            <hr className="my-8 border-gray-200" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* LAB REQUEST SECTION (NEW) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-orange-500">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center"><TestTubes className="h-5 w-5 text-orange-600 mr-2" /><h2 className="text-lg font-semibold text-gray-800">Laboratory</h2></div>
                        {!showLabForm && <button onClick={() => setShowLabForm(true)} className="text-sm bg-orange-50 text-orange-700 px-3 py-1 rounded hover:bg-orange-100"><Plus className="h-4 w-4 inline" /> Order Test</button>}
                    </div>
                    {showLabForm && (
                        <form onSubmit={handleRequestLab} className="bg-gray-50 p-4 rounded border">
                            <select required className="w-full p-2 border rounded mb-3" value={selectedLabTest} onChange={e => setSelectedLabTest(e.target.value)}>
                                <option value="">-- Select Lab Test --</option>
                                {testTypes.map(test => <option key={test.id} value={test.id}>{test.name}</option>)}
                            </select>
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setShowLabForm(false)} className="text-gray-500">Cancel</button>
                                <button type="submit" className="bg-orange-600 text-white px-4 py-1 rounded">Send to Lab</button>
                            </div>
                        </form>
                    )}
                </div>

                {/* PRESCRIPTION SECTION */}
                <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-green-500">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center"><Pill className="h-5 w-5 text-green-600 mr-2" /><h2 className="text-lg font-semibold text-gray-800">Pharmacy</h2></div>
                        {!showPrescriptionForm && <button onClick={() => setShowPrescriptionForm(true)} className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded hover:bg-green-100"><Plus className="h-4 w-4 inline" /> Prescribe</button>}
                    </div>
                    {showPrescriptionForm && (
                        <form onSubmit={handlePrescribe} className="bg-gray-50 p-4 rounded border space-y-3">
                            <select required className="w-full p-2 border rounded" value={prescriptionForm.medication} onChange={e => setPrescriptionForm({...prescriptionForm, medication: e.target.value})}>
                                <option value="">-- Choose Drug --</option>
                                {medications.map(med => <option key={med.id} value={med.id}>{med.name}</option>)}
                            </select>
                            <div className="grid grid-cols-2 gap-2">
                                <input type="text" placeholder="Dosage" required className="p-2 border rounded" value={prescriptionForm.dosage} onChange={e => setPrescriptionForm({...prescriptionForm, dosage: e.target.value})} />
                                <input type="text" placeholder="Frequency" required className="p-2 border rounded" value={prescriptionForm.frequency} onChange={e => setPrescriptionForm({...prescriptionForm, frequency: e.target.value})} />
                            </div>
                            <input type="text" placeholder="Duration (e.g. 5 days)" required className="w-full p-2 border rounded" value={prescriptionForm.duration} onChange={e => setPrescriptionForm({...prescriptionForm, duration: e.target.value})} />
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setShowPrescriptionForm(false)} className="text-gray-500">Cancel</button>
                                <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded">Prescribe</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}