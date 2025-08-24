import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import {
  PlusIcon,
  TrashIcon,
  XCircleIcon,
  CameraIcon,
  ArrowLeftIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AddPartsPage = () => {
  const { inspectionId } = useParams();
  const navigate = useNavigate();
  
  const [inspection, setInspection] = useState(null);
  const [partTemplates, setPartTemplates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [availableParts, setAvailableParts] = useState([]);
  const [addedParts, setAddedParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPartForm, setShowPartForm] = useState(false);
  const [currentPart, setCurrentPart] = useState(null);

  useEffect(() => {
    fetchInspection();
    fetchPartTemplates();
    fetchAddedParts();
  }, [inspectionId]);

  useEffect(() => {
    if (selectedCategory) {
      const categoryParts = partTemplates.filter(p => p.category === selectedCategory);
      setAvailableParts(categoryParts);
    } else {
      setAvailableParts([]);
    }
  }, [selectedCategory, partTemplates]);

  const fetchInspection = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/inspections/${inspectionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInspection(response.data.data);
    } catch (error) {
      console.error('Error fetching inspection:', error);
      if (error.response?.status === 403) {
        toast.error('You do not have permission to view this inspection report');
      } else if (error.response?.status === 404) {
        toast.error('Inspection report not found');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch inspection details');
      }
      navigate('/inspections');
    }
  };

  const fetchPartTemplates = async () => {
    try {
      const response = await axios.get(`${API_URL}/car-part-templates`);
      setPartTemplates(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch part templates');
    }
  };

  const fetchAddedParts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/car-parts/inspection/${inspectionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddedParts(response.data.data);
    } catch (error) {
      console.error('Failed to fetch added parts:', error);
    }
  };

  const categories = [
    { value: 'exterior', label: 'Exterior', icon: '🚗' },
    { value: 'interior', label: 'Interior', icon: '🪑' },
    { value: 'engine', label: 'Engine', icon: '🔧' },
    { value: 'transmission', label: 'Transmission', icon: '⚙️' },
    { value: 'suspension', label: 'Suspension', icon: '🛞' },
    { value: 'brakes', label: 'Brakes', icon: '🛑' },
    { value: 'wheels', label: 'Wheels & Tires', icon: '🏎️' },
    { value: 'electrical', label: 'Electrical', icon: '🔌' },
    { value: 'safety', label: 'Safety', icon: '🛡️' }
  ];

  const PartForm = ({ part, onSave, onCancel, availableParts = [], inspectionId, onPartAdded }) => {
    const [partData, setPartData] = useState({
      partTemplate: '',
      partName: '',
      category: selectedCategory,
      condition: 'Good',
      conditionScore: 7,
      images: [],
      notes: '',
      recommendation: 'no-action',
      ...part,
      issues: part?.issues || []  // Ensure issues is always an array
    });
    const [partImages, setPartImages] = useState([]);

    const onPartImageDrop = (acceptedFiles) => {
      const newImages = acceptedFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        caption: '',
        angle: 'overview'
      }));
      setPartImages([...partImages, ...newImages]);
    };

    const { getRootProps: getPartRootProps, getInputProps: getPartInputProps } = useDropzone({
      onDrop: onPartImageDrop,
      accept: {
        'image/*': ['.jpeg', '.jpg', '.png', '.webp']
      },
      multiple: true
    });

    const handlePartTemplateChange = (e) => {
      const templateId = e.target.value;
      const template = partTemplates.find(t => t._id === templateId);
      if (template) {
        setPartData(prev => ({
          ...prev,
          partTemplate: templateId,
          partName: template.name,
          category: template.category
        }));
      }
    };

    const handlePartSubmit = async () => {
      if (!partData.partName || !partData.category) {
        toast.error('Please fill in required fields');
        return;
      }

      if (!inspectionId) {
        toast.error('Inspection ID is missing. Please refresh the page.');
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const formData = new FormData();
        formData.append('inspectionReportId', inspectionId);
        formData.append('category', partData.category);
        formData.append('partName', partData.partName);
        formData.append('condition', partData.condition);
        formData.append('conditionScore', partData.conditionScore);
        formData.append('notes', partData.notes);
        formData.append('recommendation', partData.recommendation);

        if (partData.issues && partData.issues.length > 0) {
          formData.append('issues', JSON.stringify(partData.issues));
        }

        // Add images
        partImages.forEach((image, index) => {
          formData.append('images', image.file);
          formData.append(`captions[${index}]`, image.caption);
          formData.append(`angles[${index}]`, image.angle);
        });

        if (part && part._id) {
          // Update existing part
          await axios.put(`${API_URL}/car-parts/${part._id}`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });
          toast.success('Part updated successfully');
        } else {
          // Create new part
          console.log('Creating part with inspectionReportId:', inspectionId);
          
          await axios.post(`${API_URL}/car-parts`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });
          toast.success('Part added successfully');
        }

        if (onPartAdded) onPartAdded();
        onSave();
      } catch (error) {
        console.error('Error saving part:', error);
        toast.error(error.response?.data?.message || 'Failed to save part');
      } finally {
        setLoading(false);
      }
    };

    const addIssue = () => {
      setPartData(prev => ({
        ...prev,
        issues: [...(prev.issues || []), {
          type: 'other',
          severity: 'minor',
          description: '',
          repairNeeded: false
        }]
      }));
    };

    const removeIssue = (index) => {
      setPartData(prev => ({
        ...prev,
        issues: (prev.issues || []).filter((_, i) => i !== index)
      }));
    };

    const updateIssue = (index, field, value) => {
      setPartData(prev => ({
        ...prev,
        issues: (prev.issues || []).map((issue, i) => 
          i === index ? { ...issue, [field]: value } : issue
        )
      }));
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
          <h3 className="text-xl font-bold mb-4">
            {part ? 'Edit Part' : 'Add Car Part'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Part *
              </label>
              <select
                value={partData.partTemplate}
                onChange={handlePartTemplateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Part</option>
                {availableParts.map(template => (
                  <option key={template._id} value={template._id}>
                    {template.name} {template.subCategory && `(${template.subCategory})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Part Name *
              </label>
              <input
                type="text"
                value={partData.partName}
                onChange={(e) => setPartData({ ...partData, partName: e.target.value })}
                placeholder="e.g., Front Left Mirror"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition *
              </label>
              <select
                value={partData.condition}
                onChange={(e) => setPartData({ ...partData, condition: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
                <option value="Damaged">Damaged</option>
                <option value="Missing">Missing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition Score (0-10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={partData.conditionScore}
                onChange={(e) => setPartData({ ...partData, conditionScore: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Issues Section */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Issues Found
              </label>
              <button
                type="button"
                onClick={addIssue}
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Issue
              </button>
            </div>
            
            {(partData.issues || []).map((issue, index) => (
              <div key={index} className="border rounded-lg p-3 mb-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <select
                    value={issue.type}
                    onChange={(e) => updateIssue(index, 'type', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="scratch">Scratch</option>
                    <option value="dent">Dent</option>
                    <option value="rust">Rust</option>
                    <option value="crack">Crack</option>
                    <option value="wear">Wear</option>
                    <option value="leak">Leak</option>
                    <option value="noise">Noise</option>
                    <option value="malfunction">Malfunction</option>
                    <option value="other">Other</option>
                  </select>
                  
                  <select
                    value={issue.severity}
                    onChange={(e) => updateIssue(index, 'severity', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="minor">Minor</option>
                    <option value="moderate">Moderate</option>
                    <option value="major">Major</option>
                    <option value="critical">Critical</option>
                  </select>
                  
                  <button
                    type="button"
                    onClick={() => removeIssue(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                
                <input
                  type="text"
                  value={issue.description}
                  onChange={(e) => updateIssue(index, 'description', e.target.value)}
                  placeholder="Description"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-2"
                />
              </div>
            ))}
          </div>

          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Part Images
            </label>
            <div
              {...getPartRootProps()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500"
            >
              <input {...getPartInputProps()} />
              <CameraIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                Drag & drop images here, or click to select
              </p>
            </div>
            
            {partImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {partImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img.preview}
                      alt={`Part ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => setPartImages(partImages.filter((_, i) => i !== index))}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <XCircleIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={partData.notes}
              onChange={(e) => setPartData({ ...partData, notes: e.target.value })}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes about this part..."
            />
          </div>

          {/* Recommendation */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recommendation
            </label>
            <select
              value={partData.recommendation}
              onChange={(e) => setPartData({ ...partData, recommendation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="no-action">No Action Needed</option>
              <option value="monitor">Monitor</option>
              <option value="service-soon">Service Soon</option>
              <option value="repair-soon">Repair Soon</option>
              <option value="replace-immediately">Replace Immediately</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePartSubmit}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (part ? 'Update Part' : 'Add Part')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleDeletePart = async (partId) => {
    if (!confirm('Are you sure you want to delete this part?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/car-parts/${partId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Part deleted successfully');
      fetchAddedParts();
    } catch (error) {
      toast.error('Failed to delete part');
    }
  };

  if (!inspection) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate(`/inspections/${inspectionId}`)}
                className="mr-4 p-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add Car Parts</h1>
                <p className="text-gray-600">
                  Report: {inspection.reportNumber} - {inspection.car?.make} {inspection.car?.model}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Parts Added: {addedParts.length}</p>
              <button
                onClick={() => navigate(`/inspections/${inspectionId}`)}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Finish & View Report
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Part Categories</h2>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedCategory === category.value
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedCategory ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    {categories.find(c => c.value === selectedCategory)?.label} Parts
                  </h2>
                  <button
                    onClick={() => setShowPartForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Part
                  </button>
                </div>

                {/* Available Parts */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Available Parts to Inspect</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {availableParts.map(template => {
                      const isAdded = addedParts.some(part => part.partName === template.name);
                      return (
                        <button
                          key={template._id}
                          onClick={() => {
                            if (!isAdded) {
                              setCurrentPart({ 
                                partTemplate: template._id,
                                partName: template.name,
                                category: template.category
                              });
                              setShowPartForm(true);
                            }
                          }}
                          disabled={isAdded}
                          className={`p-3 text-left rounded-lg border ${
                            isAdded
                              ? 'bg-green-50 border-green-200 text-green-700 cursor-not-allowed'
                              : 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-700'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{template.name}</span>
                            {isAdded && <CheckCircleIcon className="h-5 w-5 text-green-600" />}
                          </div>
                          {template.subCategory && (
                            <span className="text-sm text-gray-500">{template.subCategory}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Added Parts for this category */}
                {addedParts.filter(part => part.category === selectedCategory).length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Added Parts</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addedParts
                        .filter(part => part.category === selectedCategory)
                        .map(part => (
                          <div key={part._id} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold">{part.partName}</h4>
                                <span className={`inline-block px-2 py-1 text-xs rounded ${
                                  part.condition === 'Excellent' ? 'bg-green-100 text-green-800' :
                                  part.condition === 'Good' ? 'bg-blue-100 text-blue-800' :
                                  part.condition === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {part.condition}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setCurrentPart(part);
                                    setShowPartForm(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-700 text-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeletePart(part._id)}
                                  className="text-red-600 hover:text-red-700 text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-2">
                              Score: {part.conditionScore}/10
                            </div>
                            
                            {part.issues && part.issues.length > 0 && (
                              <div className="text-sm text-red-600">
                                {part.issues.length} issue(s) found
                              </div>
                            )}
                            
                            {part.images && part.images.length > 0 && (
                              <div className="text-sm text-gray-600">
                                {part.images.length} image(s)
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔧</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-600 mb-2">Select a Category</h2>
                <p className="text-gray-500">
                  Choose a part category from the left sidebar to start adding parts to your inspection.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Part Form Modal */}
        {showPartForm && (
          <PartForm
            part={currentPart}
            availableParts={availableParts}
            inspectionId={inspectionId}
            onPartAdded={fetchAddedParts}
            onSave={() => {
              setShowPartForm(false);
              setCurrentPart(null);
            }}
            onCancel={() => {
              setShowPartForm(false);
              setCurrentPart(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AddPartsPage;