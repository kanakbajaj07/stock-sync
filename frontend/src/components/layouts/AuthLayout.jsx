import { Package } from 'lucide-react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <Package size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">StockMaster</h1>
          <p className="text-gray-600 mt-2">Inventory Management System</p>
        </div>

        {/* Auth Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-8">
          © {new Date().getFullYear()} StockMaster IMS. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;

