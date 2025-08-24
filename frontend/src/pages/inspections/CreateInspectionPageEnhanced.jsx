import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import 'react-tabs/style/react-tabs.css';
import {
  CameraIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CreateInspectionPageEnhanced = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      overallRating: 5,
      overallCondition: 'Good',
      exterior: {},
      interior: {},
      engine: {},
      transmission: {},
      suspension: {},
      brakes: {},
      wheelsAndTires: {},
      electrical: {},
      roadTest: {},
      additionalFeatures: {},
      overallAssessment: {
        recommendation: 'Recommended',
        majorIssues: [],
        strengths: [],
        weaknesses: []
      }
    }
  });

  const [activeTab, setActiveTab] = useState(0);
  const [brands, setBrands] = useState([]);
  const [carModels, setCarModels] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [carParts, setCarParts] = useState([]);
  const [showCarForm, setShowCarForm] = useState(false);
  const [showPartForm, setShowPartForm] = useState(false);
  const [currentPart, setCurrentPart] = useState(null);

  // Car details form state
  const [carDetails, setCarDetails] = useState({
    registrationNo: '',
    chassisNo: '',
    engineNo: '',
    mileage: '',
    color: '',
    fuelType: '',
    transmissionType: '',
    engineCapacity: '',
    importDate: '',
    purchaseYear: '',
    variant: ''
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (selectedBrand) {
      fetchCarModels(selectedBrand);
    }
  }, [selectedBrand]);

  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/brands`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBrands(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch brands');
    }
  };

  const fetchCarModels = async (brandId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/models?brand=${brandId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCarModels(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch models');
    }
  };

  const handleBrandChange = (e) => {
    const brandId = e.target.value;
    setSelectedBrand(brandId);
    setSelectedModel(''); // Reset model selection
    setValue('brand', brandId);
  };

  const handleModelChange = (e) => {
    const modelId = e.target.value;
    setSelectedModel(modelId);
    setValue('carModel', modelId);
    
    // Find the selected model and set default values
    const model = carModels.find(m => m._id === modelId);
    if (model) {
      setCarDetails(prev => ({
        ...prev,
        fuelType: model.fuelType[0]?.toLowerCase() || '',
        transmissionType: model.transmission[0]?.toLowerCase() || '',
        engineCapacity: model.engineCapacity[0] || ''
      }));
    }
  };

  const handleCarDetailsChange = (e) => {
    const { name, value } = e.target;
    setCarDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Car Part Management
  const CarPartForm = ({ part, onSave, onCancel }) => {
    const [partData, setPartData] = useState(part || {
      category: '',
      partName: '',
      condition: 'Good',
      conditionScore: 7,
      images: [],
      issues: [],
      notes: '',
      recommendation: 'no-action'
    });
    const [partImages, setPartImages] = useState([]);

    const onPartImageDrop = (acceptedFiles) => {
      const newImages = acceptedFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file)
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

    const handlePartSubmit = () => {
      if (!partData.category || !partData.partName) {
        toast.error('Please fill in required fields');
        return;
      }
      
      const finalPartData = {
        ...partData,
        images: partImages
      };
      
      onSave(finalPartData);
    };

    const addIssue = () => {
      setPartData(prev => ({
        ...prev,
        issues: [...prev.issues, {
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
        issues: prev.issues.filter((_, i) => i !== index)
      }));
    };

    const updateIssue = (index, field, value) => {
      setPartData(prev => ({
        ...prev,
        issues: prev.issues.map((issue, i) => 
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
                Category *
              </label>
              <select
                value={partData.category}
                onChange={(e) => setPartData({ ...partData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                <option value="exterior">Exterior</option>
                <option value="interior">Interior</option>
                <option value="engine">Engine</option>
                <option value="transmission">Transmission</option>
                <option value="suspension">Suspension</option>
                <option value="brakes">Brakes</option>
                <option value="wheels">Wheels & Tires</option>
                <option value="electrical">Electrical</option>
                <option value="safety">Safety</option>
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
            
            {partData.issues.map((issue, index) => (
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {part ? 'Update Part' : 'Add Part'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleAddPart = (partData) => {
    setCarParts([...carParts, { ...partData, id: Date.now() }]);
    setShowPartForm(false);
    toast.success('Part added successfully');
  };

  const handleEditPart = (partData) => {
    setCarParts(carParts.map(p => p.id === currentPart.id ? { ...partData, id: p.id } : p));
    setShowPartForm(false);
    setCurrentPart(null);
    toast.success('Part updated successfully');
  };

  const handleDeletePart = (partId) => {
    if (confirm('Are you sure you want to delete this part?')) {
      setCarParts(carParts.filter(p => p.id !== partId));
      toast.success('Part deleted successfully');
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // First, create the car
      const carData = {
        brand: selectedBrand,
        carModel: selectedModel,
        make: brands.find(b => b._id === selectedBrand)?.name,
        model: carModels.find(m => m._id === selectedModel)?.name,
        year: carDetails.purchaseYear,
        ...carDetails
      };

      const carResponse = await axios.post(`${API_URL}/cars`, carData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const carId = carResponse.data.data._id;

      // Create inspection report
      const inspectionData = {
        ...data,
        car: carId
      };

      const inspectionResponse = await axios.post(`${API_URL}/inspections`, inspectionData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const inspectionId = inspectionResponse.data.data._id;

      // Add car parts
      for (const part of carParts) {
        const partFormData = new FormData();
        partFormData.append('inspectionReportId', inspectionId);
        partFormData.append('category', part.category);
        partFormData.append('partName', part.partName);
        partFormData.append('condition', part.condition);
        partFormData.append('conditionScore', part.conditionScore);
        partFormData.append('notes', part.notes);
        partFormData.append('recommendation', part.recommendation);

        if (part.issues) {
          partFormData.append('issues', JSON.stringify(part.issues));
        }

        // Upload images for each part
        if (part.images && part.images.length > 0) {
          for (const image of part.images) {
            partFormData.append('images', image.file);
          }
        }

        await axios.post(`${API_URL}/car-parts`, partFormData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      toast.success('Inspection created successfully!');
      navigate(`/inspections/${inspectionId}`);
    } catch (error) {
      console.error('Error creating inspection:', error);
      toast.error(error.response?.data?.message || 'Failed to create inspection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Inspection</h1>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Select Brand and Model */}
            <div className="mb-8 p-6 bg-blue-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Step 1: Select Vehicle Brand and Model</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Brand *
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={handleBrandChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">-- Select Brand --</option>
                    {brands.map(brand => (
                      <option key={brand._id} value={brand._id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Model *
                  </label>
                  <select
                    value={selectedModel}
                    onChange={handleModelChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!selectedBrand}
                    required
                  >
                    <option value="">-- Select Model --</option>
                    {carModels.map(model => (
                      <option key={model._id} value={model._id}>
                        {model.name} ({model.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Car Details */}
            {selectedModel && (
              <div className="mb-8 p-6 bg-green-50 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Step 2: Enter Vehicle Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Number *
                    </label>
                    <input
                      type="text"
                      name="registrationNo"
                      value={carDetails.registrationNo}
                      onChange={handleCarDetailsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chassis Number *
                    </label>
                    <input
                      type="text"
                      name="chassisNo"
                      value={carDetails.chassisNo}
                      onChange={handleCarDetailsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Engine Number
                    </label>
                    <input
                      type="text"
                      name="engineNo"
                      value={carDetails.engineNo}
                      onChange={handleCarDetailsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Import Date
                    </label>
                    <input
                      type="date"
                      name="importDate"
                      value={carDetails.importDate}
                      onChange={handleCarDetailsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Purchase Year *
                    </label>
                    <input
                      type="number"
                      name="purchaseYear"
                      value={carDetails.purchaseYear}
                      onChange={handleCarDetailsChange}
                      min="1900"
                      max={new Date().getFullYear()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Mileage (km) *
                    </label>
                    <input
                      type="number"
                      name="mileage"
                      value={carDetails.mileage}
                      onChange={handleCarDetailsChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <input
                      type="text"
                      name="color"
                      value={carDetails.color}
                      onChange={handleCarDetailsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fuel Type *
                    </label>
                    <select
                      name="fuelType"
                      value={carDetails.fuelType}
                      onChange={handleCarDetailsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Fuel Type</option>
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="electric">Electric</option>
                      <option value="cng">CNG</option>
                      <option value="lpg">LPG</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transmission *
                    </label>
                    <select
                      name="transmissionType"
                      value={carDetails.transmissionType}
                      onChange={handleCarDetailsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Transmission</option>
                      <option value="manual">Manual</option>
                      <option value="automatic">Automatic</option>
                      <option value="cvt">CVT</option>
                      <option value="semi-automatic">Semi-Automatic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Engine Capacity
                    </label>
                    <input
                      type="text"
                      name="engineCapacity"
                      value={carDetails.engineCapacity}
                      onChange={handleCarDetailsChange}
                      placeholder="e.g., 1.0L, 1300cc"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Variant
                    </label>
                    <input
                      type="text"
                      name="variant"
                      value={carDetails.variant}
                      onChange={handleCarDetailsChange}
                      placeholder="e.g., VXR, GLI"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Car Parts Inspection */}
            {selectedModel && carDetails.registrationNo && (
              <div className="mb-8 p-6 bg-yellow-50 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Step 3: Car Parts Inspection</h2>
                  <button
                    type="button"
                    onClick={() => setShowPartForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Part
                  </button>
                </div>

                {carParts.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">
                    No parts added yet. Click "Add Part" to start inspecting car parts.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {carParts.map(part => (
                      <div key={part.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{part.partName}</h3>
                            <p className="text-sm text-gray-600">{part.category}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded ${
                            part.condition === 'Excellent' ? 'bg-green-100 text-green-800' :
                            part.condition === 'Good' ? 'bg-blue-100 text-blue-800' :
                            part.condition === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {part.condition}
                          </span>
                        </div>
                        
                        <div className="mb-2">
                          <span className="text-sm text-gray-600">Score: </span>
                          <span className="font-semibold">{part.conditionScore}/10</span>
                        </div>
                        
                        {part.issues.length > 0 && (
                          <div className="mb-2">
                            <span className="text-sm text-gray-600">Issues: </span>
                            <span className="text-sm font-semibold text-red-600">
                              {part.issues.length}
                            </span>
                          </div>
                        )}
                        
                        {part.images.length > 0 && (
                          <div className="mb-2">
                            <span className="text-sm text-gray-600">Images: </span>
                            <span className="text-sm font-semibold">
                              {part.images.length}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex gap-2 mt-3">
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentPart(part);
                              setShowPartForm(true);
                            }}
                            className="flex-1 px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePart(part.id)}
                            className="flex-1 px-2 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Overall Assessment */}
            {selectedModel && carDetails.registrationNo && (
              <div className="mb-8 p-6 bg-purple-50 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Step 4: Overall Assessment</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Overall Rating (0-10)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      {...register('overallRating', { required: true, min: 0, max: 10 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Overall Condition
                    </label>
                    <select
                      {...register('overallCondition', { required: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Very Good">Very Good</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recommendation
                    </label>
                    <select
                      {...register('overallAssessment.recommendation', { required: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Highly Recommended">Highly Recommended</option>
                      <option value="Recommended">Recommended</option>
                      <option value="Recommended with Repairs">Recommended with Repairs</option>
                      <option value="Not Recommended">Not Recommended</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Market Value (PKR)
                    </label>
                    <input
                      type="number"
                      {...register('overallAssessment.estimatedMarketValue.amount')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inspector Notes
                  </label>
                  <textarea
                    {...register('overallAssessment.inspectorNotes')}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter any additional notes about the inspection..."
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            {selectedModel && carDetails.registrationNo && (
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/inspections')}
                  className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Inspection'}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Part Form Modal */}
        {showPartForm && (
          <CarPartForm
            part={currentPart}
            onSave={currentPart ? handleEditPart : handleAddPart}
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

export default CreateInspectionPageEnhanced;