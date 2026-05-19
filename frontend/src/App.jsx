import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Page Imports
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientProfile from './pages/PatientProfile';
import Consultations from './pages/Consultations';
import ConsultationRoom from './pages/ConsultationRoom';
import Pharmacy from './pages/Pharmacy';
import Laboratory from './pages/Laboratory';

// Security Bouncer
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Department Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        {/* Patient Registry & EMR */}
        <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
        <Route path="/patients/:patientId" element={<ProtectedRoute><PatientProfile /></ProtectedRoute>} />
        
        {/* Clinical Core */}
        <Route path="/consultations" element={<ProtectedRoute><Consultations /></ProtectedRoute>} />
        <Route path="/consultation/:visitId" element={<ProtectedRoute><ConsultationRoom /></ProtectedRoute>} />
        
        {/* Ancillary Services */}
        <Route path="/pharmacy" element={<ProtectedRoute><Pharmacy /></ProtectedRoute>} />
        <Route path="/laboratory" element={<ProtectedRoute><Laboratory /></ProtectedRoute>} />

        {/* Catch-all Security Route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;