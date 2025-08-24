import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ModelsPage = () => {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const [brand, setBrand] = useState(null);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Sedan',
    fuelType: [],
    transmission: [],
    engineCapacity: [],
    year: { start: new Date().getFullYear(), end: null },
    isActive: true,
    popularityScore: 0
  });

  const categories = ['Hatchback', 'Sedan', 'SUV', 'Crossover', 'Pickup', 'Van', 'Coupe', 'Convertible', 'Wagon', 'Minivan', 'Truck', 'Other'];
  const fuelTypes = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'CNG', 'LPG'];
  const transmissionTypes = ['Manual', 'Automatic', 'CVT', 'DCT', 'AMT'];
  const engineCapacities = ['0.8L', '1.0L', '1.2L', '1.3L', '1.4L', '1.5L', '1.6L', '1.8L', '2.0L', '2.2L', '2.4L', '2.5L', '2.8L', '3.0L', '3.5L', '4.0L', '5.0L'];

  useEffect(() => {
    if (brandId) {
      fetchBrand();
      fetchModels();
    }
  }, [brandId]);

  const fetchBrand = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/brands/${brandId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBrand(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch brand details');
      navigate('/admin/brands');
    }
  };

  const fetchModels = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/models/brand/${brandId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModels(response.data.data.models);
    } catch (error) {
      toast.error('Failed to fetch models');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const modelData = {
        ...formData,
        brand: brandId
      };
      
      if (editingModel) {
        await axios.put(
          `${API_URL}/models/${editingModel._id}`,
          modelData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Model updated successfully');
      } else {
        await axios.post(
          `${API_URL}/models`,
          modelData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Model created successfully');
      }
      
      setShowModal(false);
      resetForm();
      fetchModels();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save model');
    }
  };

  const handleEdit = (model) => {
    setEditingModel(model);
    setFormData({
      name: model.name,
      category: model.category,
      fuelType: model.fuelType || [],
      transmission: model.transmission || [],
      engineCapacity: model.engineCapacity || [],
      year: model.year || { start: new Date().getFullYear(), end: null },
      isActive: model.isActive,
      popularityScore: model.popularityScore || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this model?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/models/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Model deleted successfully');
      fetchModels();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete model');
    }
  };

  const resetForm = () => {
    setEditingModel(null);
    setFormData({
      name: '',
      category: 'Sedan',
      fuelType: [],
      transmission: [],
      engineCapacity: [],
      year: { start: new Date().getFullYear(), end: null },
      isActive: true,
      popularityScore: 0
    });
  };

  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/brands')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Brands
        </button>
        <div className="flex items-center gap-4">
          {brand?.logo && (
            <img src={brand.logo} alt={brand.name} className="w-16 h-16 object-contain" />
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{brand?.name} Models</h1>
            <p className="text-gray-600 mt-1">Manage car models for {brand?.name}</p>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5" />
            Add Model
          </button>
        </div>
      </div>

      {/* Models Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Model Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fuel Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transmission
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Engine
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredModels.map((model) => (
              <tr key={model._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{model.name}</div>
                  {model.year && (
                    <div className="text-sm text-gray-500">
                      {model.year.start}{model.year.end && ` - ${model.year.end}`}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {model.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {model.fuelType?.join(', ') || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {model.transmission?.join(', ') || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {model.engineCapacity?.join(', ') || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {model.isActive ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-600" />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(model)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(model._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredModels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No models found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingModel ? 'Edit Model' : 'Add New Model'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Year
                  </label>
                  <input
                    type="number"
                    value={formData.year.start}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      year: { ...formData.year, start: parseInt(e.target.value) }
                    })}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Year (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.year.end || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      year: { ...formData.year, end: e.target.value ? parseInt(e.target.value) : null }
                    })}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fuel Types
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {fuelTypes.map(fuel => (
                      <label key={fuel} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.fuelType.includes(fuel)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, fuelType: [...formData.fuelType, fuel] });
                            } else {
                              setFormData({ 
                                ...formData, 
                                fuelType: formData.fuelType.filter(f => f !== fuel) 
                              });
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{fuel}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transmission Types
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {transmissionTypes.map(trans => (
                      <label key={trans} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.transmission.includes(trans)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, transmission: [...formData.transmission, trans] });
                            } else {
                              setFormData({ 
                                ...formData, 
                                transmission: formData.transmission.filter(t => t !== trans) 
                              });
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{trans}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Engine Capacities
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {engineCapacities.map(capacity => (
                      <label key={capacity} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.engineCapacity.includes(capacity)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, engineCapacity: [...formData.engineCapacity, capacity] });
                            } else {
                              setFormData({ 
                                ...formData, 
                                engineCapacity: formData.engineCapacity.filter(c => c !== capacity) 
                              });
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{capacity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Active
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingModel ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelsPage;