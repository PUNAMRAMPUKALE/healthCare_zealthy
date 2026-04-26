import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import PortalLayout from './pages/PortalLayout';
import PortalDashboard from './pages/PortalDashboard';
import PortalAppointments from './pages/PortalAppointments';
import PortalPrescriptions from './pages/PortalPrescriptions';
import AdminLayout from './pages/AdminLayout';
import AdminPatients from './pages/AdminPatients';
import AdminPatientDetail from './pages/AdminPatientDetail';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/portal" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Patient Portal */}
      <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/portal" element={<ProtectedRoute><PortalLayout /></ProtectedRoute>}>
        <Route index element={<PortalDashboard />} />
        <Route path="appointments" element={<PortalAppointments />} />
        <Route path="prescriptions" element={<PortalPrescriptions />} />
      </Route>

      {/* Admin EMR (no auth required as per spec) */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminPatients />} />
        <Route path="patients/:id" element={<AdminPatientDetail />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
