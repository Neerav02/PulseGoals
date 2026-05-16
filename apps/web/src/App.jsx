import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Toaster } from 'react-hot-toast';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import EmployeeDashboard from './pages/employee/Dashboard';
import GoalSheet from './pages/employee/GoalSheet';
import Achievements from './pages/employee/Achievements';
import TeamDashboard from './pages/manager/TeamDashboard';
import ApprovalView from './pages/manager/ApprovalView';
import CheckIns from './pages/manager/CheckIns';
import ControlCenter from './pages/admin/ControlCenter';
import CycleManagement from './pages/admin/CycleManagement';
import OrgHierarchy from './pages/admin/OrgHierarchy';
import SharedGoals from './pages/admin/SharedGoals';
import Reports from './pages/admin/Reports';
import AuditLog from './pages/admin/AuditLog';
import Analytics from './pages/admin/Analytics';

function ProtectedRoute({ children, roles }) {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <div className="page-enter" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><div className="skeleton" style={{ width: 200, height: 40 }} /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
  return children;
}

function AppRoutes() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to={getDefaultPath(user?.role)} replace /> : <Landing />} />
      <Route path="/login/:role?" element={isAuthenticated ? <Navigate to={getDefaultPath(user?.role)} replace /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to={getDefaultPath(user?.role)} replace /> : <Signup />} />

      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        {/* Employee routes */}
        <Route path="employee" element={<ProtectedRoute roles={['EMPLOYEE', 'MANAGER', 'ADMIN']}><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="employee/goals" element={<ProtectedRoute roles={['EMPLOYEE', 'MANAGER', 'ADMIN']}><GoalSheet /></ProtectedRoute>} />
        <Route path="employee/achievements" element={<ProtectedRoute roles={['EMPLOYEE', 'MANAGER', 'ADMIN']}><Achievements /></ProtectedRoute>} />

        {/* Manager routes */}
        <Route path="manager" element={<ProtectedRoute roles={['MANAGER', 'ADMIN']}><TeamDashboard /></ProtectedRoute>} />
        <Route path="manager/approvals" element={<ProtectedRoute roles={['MANAGER', 'ADMIN']}><ApprovalView /></ProtectedRoute>} />
        <Route path="manager/approvals/:userId" element={<ProtectedRoute roles={['MANAGER', 'ADMIN']}><ApprovalView /></ProtectedRoute>} />
        <Route path="manager/checkins" element={<ProtectedRoute roles={['MANAGER', 'ADMIN']}><CheckIns /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="admin" element={<ProtectedRoute roles={['ADMIN']}><ControlCenter /></ProtectedRoute>} />
        <Route path="admin/cycles" element={<ProtectedRoute roles={['ADMIN']}><CycleManagement /></ProtectedRoute>} />
        <Route path="admin/users" element={<ProtectedRoute roles={['ADMIN']}><OrgHierarchy /></ProtectedRoute>} />
        <Route path="admin/shared-goals" element={<ProtectedRoute roles={['ADMIN']}><SharedGoals /></ProtectedRoute>} />
        <Route path="admin/reports" element={<ProtectedRoute roles={['ADMIN']}><Reports /></ProtectedRoute>} />
        <Route path="admin/audit" element={<ProtectedRoute roles={['ADMIN']}><AuditLog /></ProtectedRoute>} />
        <Route path="admin/analytics" element={<ProtectedRoute roles={['ADMIN']}><Analytics /></ProtectedRoute>} />

      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function getDefaultPath(role) {
  switch (role) {
    case 'ADMIN': return '/admin';
    case 'MANAGER': return '/manager';
    default: return '/employee';
  }
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#333', color: '#fff', borderRadius: '8px' } }} />
      <AppRoutes />
    </AuthProvider>
  );
}
