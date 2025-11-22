import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Products from './pages/products/Products';
import ProductDetail from './pages/products/ProductDetail';
import CreateProduct from './pages/products/CreateProduct';
import Receipts from './pages/operations/Receipts';
import Deliveries from './pages/operations/Deliveries';
import Transfers from './pages/operations/Transfers';
import StockLevels from './pages/inventory/StockLevels';
import StockLedger from './pages/inventory/StockLedger';

// Protected Route Component
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
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Products */}
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<CreateProduct />} />
        <Route path="products/:id" element={<ProductDetail />} />
        
        {/* Operations */}
        <Route path="operations/receipts" element={<Receipts />} />
        <Route path="operations/deliveries" element={<Deliveries />} />
        <Route path="operations/transfers" element={<Transfers />} />
        
        {/* Inventory */}
        <Route path="inventory/stock-levels" element={<StockLevels />} />
        <Route path="inventory/ledger" element={<StockLedger />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

