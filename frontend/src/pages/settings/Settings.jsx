import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure your system preferences</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <SettingsIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">Settings page coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
