import React from 'react';
import { ArrowLeftRight } from 'lucide-react';

const Transfers = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Transfers</h1>
          <p className="text-gray-600 mt-1">Manage internal stock transfers between locations</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <ArrowLeftRight className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">Transfers page coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Transfers;
