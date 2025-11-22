import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationService } from '../../services/locationService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  MapPin, Plus, Edit2, Trash2, X, Save, Search
} from 'lucide-react';

// Location Modal (Create/Edit)
const LocationModal = ({ location, onClose, onSave }) => {
  const isEdit = !!location;
  const [formData, setFormData] = useState({
    name: location?.name || '',
    type: location?.type || 'WAREHOUSE',
    description: location?.description || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Edit Location' : 'Create New Location'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location Name *</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              required
            >
              <option value="WAREHOUSE">Warehouse</option>
              <option value="RACK">Rack</option>
              <option value="SHELF">Shelf</option>
              <option value="ZONE">Zone</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {isEdit ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Location List Table
const LocationList = ({ locations, onEdit, onDelete }) => {
  if (locations.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
        <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>No locations found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {locations.map((location) => (
              <tr key={location.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{location.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                    {location.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{location.description || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onEdit(location)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(location.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main Settings Page (Currently just Locations)
const Settings = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const queryClient = useQueryClient();

  // Fetch Locations
  const { data: locationsResponse, isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: locationService.getLocations,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: locationService.createLocation,
    onSuccess: () => {
      toast.success('Location created successfully');
      queryClient.invalidateQueries(['locations']);
      setShowModal(false);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to create location'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => locationService.updateLocation(id, data),
    onSuccess: () => {
      toast.success('Location updated successfully');
      queryClient.invalidateQueries(['locations']);
      setEditingLocation(null);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update location'),
  });

  const deleteMutation = useMutation({
    mutationFn: locationService.deleteLocation,
    onSuccess: () => {
      toast.success('Location deleted successfully');
      queryClient.invalidateQueries(['locations']);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to delete location'),
  });

  const locations = useMemo(() => locationsResponse?.data || [], [locationsResponse]);

  const filteredLocations = locations.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (location) => {
    setEditingLocation(location);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Locations</h1>
            <p className="text-gray-600 mt-1">Manage warehouses and storage locations</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
          >
            <Plus size={20} />
            Add Location
          </button>
        </div>

        <div className="mb-6 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <LocationList 
          locations={filteredLocations} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      </div>

      {(showModal || editingLocation) && (
        <LocationModal
          location={editingLocation}
          onClose={() => {
            setShowModal(false);
            setEditingLocation(null);
          }}
          onSave={(data) => {
            if (editingLocation) {
              updateMutation.mutate({ id: editingLocation.id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
        />
      )}
    </div>
  );
};

export default Settings;
