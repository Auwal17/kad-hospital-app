import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Clock, Activity, FileText, ArrowLeft, Pill, TestTubes } from 'lucide-react';
import api from '../api/axiosConfig';
import MainLayout from '../layouts/MainLayout';

export default function PatientProfile() {
    const { patientId } = useParams();
    const navigate = useNavigate();
    
    const [patient, setPatient] = useState(null);
    const [visits, setVisits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                const patientRes = await api.get(`patients/${patientId}/`);
                setPatient(patientRes.data);

                // Now that Django is updated, this single call brings in the Notes, Labs, and Prescriptions!
                const visitsRes = await api.get(`visits/?patient=${patientId}`);
                setVisits(visitsRes.data.results || visitsRes.data);
            } catch (error) {
                console.error("Error fetching patient profile:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPatientData();
    }, [patientId]);

    if (isLoading) return <MainLayout><div className="p-8 text-center text-gray-500 font-medium">Loading comprehensive patient records...</div></MainLayout>;
    if (!patient) return <MainLayout><div className="p-8 text-center text-red-500 font-medium">Patient not found in database.</div></MainLayout>;

    return (
        <MainLayout>
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('/patients')} className="mr-4 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-600 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Electronic Medical Record (EMR)</h1>
                    <p className="text-gray-600">Complete history for {patient.patient_number}</p>
                </div>
            </div>

            {/* Patient Master Identity Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-medical-500 mb-8 flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="bg-medical-50 p-4 rounded-full text-medical-600 border border-medical-100">
                    <User className="h-10 w-10" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1 w-full">
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Patient Name</p>
                        <p className="font-bold text-gray-900 text-lg">{patient.first_name} {patient.last_name}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Demographics</p>
                        <p className="font-semibold text-gray-800">{patient.gender} • Blood: <span className="text-red-500">{patient.blood_group}</span></p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Contact</p>
                        <p className="font-semibold text-gray-800">{patient.phone}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Emergency Contact</p>
                        <p className="font-semibold text-gray-800">{patient.next_of_kin}</p>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-medical-600" /> Clinical History
            </h2>

            {/* Timeline of Visits */}
            <div className="space-y-8">
                {visits.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-xl border border-gray-100 text-gray-500 shadow-sm">
                        No previous medical visits recorded for this patient.
                    </div>
                ) : (
                    visits.map((visit) => (
                        <div key={visit.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            
                            {/* Visit Header */}
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <div className="font-bold text-gray-800 text-lg">
                                    Visit #{visit.id} <span className="text-gray-400 font-normal mx-2">|</span> 
                                    <span className="text-medical-700">
                                        {new Date(visit.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${visit.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-blue-100 text-blue-800 border-blue-200'}`}>
                                    {visit.status.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="p-6">
                                {/* Doctor's Notes & Vitals Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                                    
                                    {/* Clinical Notes */}
                                    <div className="lg:col-span-2">
                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                                            <FileText className="h-4 w-4 mr-2 text-medical-500" /> Consultation Notes
                                        </h4>
                                        {visit.consultation ? (
                                            <div className="bg-medical-50 p-4 rounded-lg border border-medical-100 space-y-4">
                                                <div>
                                                    <span className="text-xs text-medical-600 font-bold uppercase tracking-wider">Presenting Symptoms</span>
                                                    <p className="text-gray-800 mt-1">{visit.consultation.symptoms}</p>
                                                </div>
                                                <div className="pt-3 border-t border-medical-200">
                                                    <span className="text-xs text-medical-600 font-bold uppercase tracking-wider">Doctor's Diagnosis</span>
                                                    <p className="text-gray-900 font-medium mt-1">{visit.consultation.diagnosis || 'Pending observation'}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-lg border border-gray-100">No clinical notes recorded.</p>
                                        )}
                                    </div>

                                    {/* Vitals */}
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                                            <Activity className="h-4 w-4 mr-2 text-blue-500" /> Recorded Vitals
                                        </h4>
                                        {visit.consultation?.vitals ? (
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center bg-blue-50 px-4 py-2 rounded border border-blue-100">
                                                    <span className="text-sm text-blue-800 font-medium">Temperature</span>
                                                    <span className="font-bold text-blue-900">{visit.consultation.vitals.Temp}°C</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-red-50 px-4 py-2 rounded border border-red-100">
                                                    <span className="text-sm text-red-800 font-medium">Blood Pressure</span>
                                                    <span className="font-bold text-red-900">{visit.consultation.vitals.BP}</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-green-50 px-4 py-2 rounded border border-green-100">
                                                    <span className="text-sm text-green-800 font-medium">Weight</span>
                                                    <span className="font-bold text-green-900">{visit.consultation.vitals.Weight} kg</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-lg border border-gray-100">Vitals not taken.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Labs & Prescriptions Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                                    
                                    {/* Laboratory Results */}
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                                            <TestTubes className="h-4 w-4 mr-2 text-orange-500" /> Laboratory Results
                                        </h4>
                                        {visit.lab_requests && visit.lab_requests.length > 0 ? (
                                            <div className="space-y-3">
                                                {visit.lab_requests.map((lab, index) => (
                                                    <div key={index} className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                                                        <div className="flex justify-between mb-1">
                                                            <span className="font-bold text-orange-900">{lab.test_name || `Test #${lab.test_type}`}</span>
                                                            <span className="text-xs font-bold px-2 py-1 bg-white rounded text-orange-600 border border-orange-200 uppercase">{lab.status}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-800 mt-2 bg-white p-2 rounded">
                                                            {lab.result_text || <span className="italic text-gray-400">Awaiting technician results...</span>}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">No lab tests ordered.</p>
                                        )}
                                    </div>

                                    {/* Prescriptions */}
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                                            <Pill className="h-4 w-4 mr-2 text-green-500" /> Issued Prescriptions
                                        </h4>
                                        {visit.prescriptions && visit.prescriptions.length > 0 ? (
                                            <div className="space-y-3">
                                                {visit.prescriptions.map((rx, index) => (
                                                    <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-100">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="font-bold text-green-900 text-lg">{rx.medication_name || `Drug ID: ${rx.medication}`}</span>
                                                            <span className={`text-xs font-bold px-2 py-1 bg-white rounded border uppercase ${rx.status === 'dispensed' ? 'text-green-600 border-green-200' : 'text-yellow-600 border-yellow-200'}`}>
                                                                {rx.status}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-gray-700 bg-white p-2 rounded flex flex-wrap gap-2">
                                                            <span className="bg-gray-100 px-2 py-1 rounded"><strong>Dose:</strong> {rx.dosage}</span>
                                                            <span className="bg-gray-100 px-2 py-1 rounded"><strong>Freq:</strong> {rx.frequency}</span>
                                                            <span className="bg-gray-100 px-2 py-1 rounded"><strong>For:</strong> {rx.duration}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">No medications prescribed.</p>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </MainLayout>
    );
}