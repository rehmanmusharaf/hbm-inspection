import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import {
  CheckCircleIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  TruckIcon,
  WrenchIcon
} from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CreateInspectionWorkflow = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      overallRating: 5,
      overallCondition: 'Good',
      overallAssessment: {
        recommendation: 'Recommended',
        majorIssues: [],
        strengths: [],
        weaknesses: []
      }
    }
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [brands, setBrands] = useState([]);
  const [carModels, setCarModels] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdCar, setCreatedCar] = useState(null);
  const [createdInspection, setCreatedInspection] = useState(null);

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
    setSelectedModel('');
  };

  const handleModelChange = (e) => {
    const modelId = e.target.value;
    setSelectedModel(modelId);
    
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

  const handleStep1Submit = async () => {
    if (!selectedBrand || !selectedModel) {
      toast.error('Please select both brand and model');
      return;
    }

    if (!carDetails.registrationNo || !carDetails.chassisNo || !carDetails.mileage || !carDetails.purchaseYear) {
      toast.error('Please fill in all required car details');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Create the car
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

      setCreatedCar(carResponse.data.data);
      setCurrentStep(2);
      toast.success('Car details saved successfully!');
    } catch (error) {
      console.error('Error creating car:', error);
      toast.error(error.response?.data?.message || 'Failed to create car');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (data) => {
    if (!createdCar) {
      toast.error('Please complete step 1 first');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Create inspection report
      const inspectionData = {
        ...data,
        car: createdCar._id
      };

      const inspectionResponse = await axios.post(`${API_URL}/inspections`, inspectionData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCreatedInspection(inspectionResponse.data.data);
      setCurrentStep(3);
      toast.success('Inspection report created successfully!');
    } catch (error) {
      console.error('Error creating inspection:', error);
      toast.error(error.response?.data?.message || 'Failed to create inspection');
    } finally {
      setLoading(false);
    }
  };

  const goToAddParts = () => {
    if (createdInspection) {
      navigate(`/inspections/${createdInspection._id}/add-parts`);
    }
  };

  const goToViewInspection = () => {
    if (createdInspection) {
      navigate(`/inspections/${createdInspection._id}`);
    }
  };

  const steps = [
    { 
      id: 1, 
      title: 'Vehicle Information', 
      icon: TruckIcon,
      description: 'Select brand, model and enter vehicle details'
    },
    { 
      id: 2, 
      title: 'Basic Inspection', 
      icon: DocumentTextIcon,
      description: 'Overall assessment and basic details'
    },
    { 
      id: 3, 
      title: 'Add Parts', 
      icon: WrenchIcon,
      description: 'Add detailed part inspections'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircleIcon className="h-6 w-6" />
                  ) : (
                    <step.icon className="h-6 w-6" />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRightIcon className="h-5 w-5 text-gray-400 mx-6" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Step 1: Vehicle Information */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Vehicle Information</h2>
              
              {/* Brand and Model Selection */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Select Vehicle Brand and Model</h3>
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

              {/* Car Details */}
              {selectedModel && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Vehicle Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleStep1Submit}
                  disabled={loading || !selectedModel || !carDetails.registrationNo}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Next: Basic Inspection'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Basic Inspection */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Inspection Details</h2>
              
              <form onSubmit={handleSubmit(handleStep2Submit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Overall Rating (0-10) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      {...register('overallRating', { 
                        required: true, 
                        min: 0, 
                        max: 10,
                        valueAsNumber: true,
                        validate: value => !isNaN(value) && value >= 0 && value <= 10
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.overallRating && (
                      <p className="text-red-600 text-sm mt-1">Rating is required (0-10)</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Overall Condition *
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
                      Recommendation *
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
                      Estimated Repair Cost (PKR)
                    </label>
                    <input
                      type="number"
                      {...register('overallAssessment.estimatedRepairCost.amount')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mb-6">
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

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Inspection'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Step 3: Success & Next Steps */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Inspection Created Successfully!</h2>
              <p className="text-gray-600 mb-8">
                Your basic inspection report has been created. You can now add detailed part inspections or view the report.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={goToAddParts}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  <WrenchIcon className="h-5 w-5 mr-2" />
                  Add Car Parts
                </button>
                <button
                  onClick={goToViewInspection}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center"
                >
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  View Report
                </button>
              </div>

              {createdInspection && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Report Number:</strong> {createdInspection.reportNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Car:</strong> {createdCar?.make} {createdCar?.model} ({createdCar?.year})
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateInspectionWorkflow;