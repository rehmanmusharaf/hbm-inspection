import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaUserPlus, FaEdit, FaToggleOn, FaToggleOff, FaKey, FaSearch } from 'react-icons/fa';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import api from '../../services/api';

const InspectorsPage = () => {
  const { user } = useAuth();
  const [inspectors, setInspectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedInspector, setSelectedInspector] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Pakistan'
    }
  });
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchInspectors();
    }
  }, [user]);

  const fetchInspectors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/inspectors', {
        params: { search: searchTerm }
      });
      setInspectors(response.data.data);
    } catch (error) {
      console.error('Error fetching inspectors:', error);
      toast.error('Failed to load inspectors');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInspector = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/inspectors', formData);
      if (response.data.success) {
        toast.success('Inspector created successfully');
        setShowCreateModal(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          phone: '',
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'Pakistan'
          }
        });
        fetchInspectors();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create inspector');
    }
  };

  const handleToggleStatus = async (inspectorId) => {
    try {
      const response = await api.patch(`/inspectors/${inspectorId}/toggle-status`);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchInspectors();
      }
    } catch (error) {
      toast.error('Failed to update inspector status');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await api.post(`/inspectors/${selectedInspector._id}/reset-password`, {
        newPassword
      });
      if (response.data.success) {
        toast.success('Password reset successfully');
        setShowResetPasswordModal(false);
        setNewPassword('');
        setSelectedInspector(null);
      }
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Access Denied. Admin only.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Manage Inspectors</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <FaUserPlus />
          <span>Add Inspector</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search inspectors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyUp={(e) => e.key === 'Enter' && fetchInspectors()}
            className="input pl-10 w-full md:w-96"
          />
        </div>
      </div>

      {/* Inspectors Table */}
      <div className="card">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inspectors.map((inspector) => (
                  <tr key={inspector._id}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {inspector.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {inspector.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {inspector.phone}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        inspector.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {inspector.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(inspector.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleStatus(inspector._id)}
                          className="text-blue-600 hover:text-blue-800"
                          title={inspector.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {inspector.isActive ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedInspector(inspector);
                            setShowResetPasswordModal(true);
                          }}
                          className="text-orange-600 hover:text-orange-800"
                          title="Reset Password"
                        >
                          <FaKey size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {inspectors.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No inspectors found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Inspector Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Inspector"
      >
        <form onSubmit={handleCreateInspector} className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="input"
              placeholder="Inspector name"
            />
          </div>

          <div>
            <label className="label">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="input"
              placeholder="inspector@example.com"
            />
          </div>

          <div>
            <label className="label">Password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="input"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label className="label">Phone *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="input"
              placeholder="+92-XXX-XXXXXXX"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">City</label>
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => setFormData({
                  ...formData, 
                  address: {...formData.address, city: e.target.value}
                })}
                className="input"
                placeholder="City"
              />
            </div>
            <div>
              <label className="label">State</label>
              <input
                type="text"
                value={formData.address.state}
                onChange={(e) => setFormData({
                  ...formData, 
                  address: {...formData.address, state: e.target.value}
                })}
                className="input"
                placeholder="State/Province"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Create Inspector
            </button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={showResetPasswordModal}
        onClose={() => {
          setShowResetPasswordModal(false);
          setNewPassword('');
          setSelectedInspector(null);
        }}
        title="Reset Inspector Password"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Reset password for: <strong>{selectedInspector?.name}</strong>
          </p>
          
          <div>
            <label className="label">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input"
              placeholder="Minimum 6 characters"
              minLength={6}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => {
                setShowResetPasswordModal(false);
                setNewPassword('');
                setSelectedInspector(null);
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleResetPassword}
              className="btn btn-primary"
            >
              Reset Password
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InspectorsPage;