import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Components
import RoleProtectedRoute from './components/common/RoleProtectedRoute';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Stock from './pages/stock/Stock';
import Products from './pages/products/Products';
import MoveHistory from './pages/history/MoveHistory';
import Receipts from './pages/operations/Receipts';
import Deliveries from './pages/operations/Deliveries';
import Transfers from './pages/operations/Transfers';
import Settings from './pages/settings/Settings';
import Unauthorized from './pages/Unauthorized';

// Protected Route Component - Basic authentication check
const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { token } = useAuthStore();
  
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <AuthLayout>
            <Login />
          </AuthLayout>
        </PublicRoute>
      } />
      
      <Route path="/register" element={
        <PublicRoute>
          <AuthLayout>
            <Register />
          </AuthLayout>
        </PublicRoute>
      } />

      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Dashboard - All authenticated users */}
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Stock - Admin, Manager & Staff */}
        <Route 
          path="stock" 
          element={
            <RoleProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'STAFF']}>
              <Stock />
            </RoleProtectedRoute>
          } 
        />
        
        {/* Products - Admin & Manager only */}
        <Route 
          path="products" 
          element={
            <RoleProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <Products />
            </RoleProtectedRoute>
          } 
        />
        
        {/* Operations - All authenticated users */}
        <Route path="operations/receipts" element={<Receipts />} />
        <Route path="operations/deliveries" element={<Deliveries />} />
        <Route path="operations/transfers" element={<Transfers />} />
        
        {/* Move History - Admin & Manager only */}
        <Route 
          path="history" 
          element={
            <RoleProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <MoveHistory />
            </RoleProtectedRoute>
          } 
        />
        <Route 
          path="inventory/ledger" 
          element={
            <RoleProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <MoveHistory />
            </RoleProtectedRoute>
          } 
        />

        {/* Settings - Admin only */}
        <Route 
          path="settings" 
          element={
            <RoleProtectedRoute allowedRoles={['ADMIN']}>
              <Settings />
            </RoleProtectedRoute>
          } 
        />
      </Route>

      {/* Unauthorized Page */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
