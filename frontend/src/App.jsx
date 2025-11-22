import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './components/layouts/MainLayout';

// Pages
import Dashboard from './pages/dashboard/Dashboard';
import Stock from './pages/stock/Stock';
import MoveHistory from './pages/history/MoveHistory';
import Receipts from './pages/operations/Receipts';
import Deliveries from './pages/operations/Deliveries';
import Transfers from './pages/operations/Transfers';
import Settings from './pages/settings/Settings';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Stock */}
        <Route path="stock" element={<Stock />} />
        <Route path="products" element={<Stock />} />
        
        {/* Operations */}
        <Route path="operations/receipts" element={<Receipts />} />
        <Route path="operations/deliveries" element={<Deliveries />} />
        <Route path="operations/transfers" element={<Transfers />} />
        
        {/* Move History */}
        <Route path="history" element={<MoveHistory />} />
        <Route path="inventory/ledger" element={<MoveHistory />} />
        
        {/* Settings */}
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

