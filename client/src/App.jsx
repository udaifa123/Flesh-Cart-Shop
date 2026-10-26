
import { Navigate, Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Landing from './pages/Landing.jsx';
import Signup from './pages/Signup.jsx';
import Login from './pages/Login.jsx';
import AdminLogin from './pages/AdminLogin.jsx';

import Dashboard from './pages/Dashboard.jsx';
import POS from './pages/POS.jsx';
import Bills from './pages/Bills.jsx';
import BillView from './pages/BillView.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* IMPORTANT: Admin login must be outside ProtectedRoute */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected staff and admin pages */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/bills/:id" element={<BillView />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Unknown URLs */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
