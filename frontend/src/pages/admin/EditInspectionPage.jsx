import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import 'react-tabs/style/react-tabs.css';
import {
  CheckIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const EditInspectionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  
  const [loading, setLoading] = useState(false);
  const [inspection, setInspection] = useState(null);
  const [carParts, setCarParts] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    fetchInspection();
    fetchCarParts();
  }, [id]);

  const fetchInspection = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/inspections/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data.data;
      setInspection(data);
      setIsPublished(data.isPublished);
      
      // Populate form with existing data
      setValue('overallRating', data.overallRating);
      setValue('overallCondition', data.overallCondition);
      setValue('overallAssessment.recommendation', data.overallAssessment?.recommendation);
      setValue('overallAssessment.estimatedRepairCost.amount', data.overallAssessment?.estimatedRepairCost?.amount);
      setValue('overallAssessment.inspectorNotes', data.overallAssessment?.inspectorNotes);
      setValue('overallAssessment.strengths', data.overallAssessment?.strengths?.join('\n'));
      setValue('overallAssessment.weaknesses', data.overallAssessment?.weaknesses?.join('\n'));
      setValue('overallAssessment.majorIssues', data.overallAssessment?.majorIssues);
    } catch (error) {
      toast.error('Failed to fetch inspection details');
      navigate('/inspections');
    }
  };

  const fetchCarParts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/car-parts/inspection/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCarParts(response.data.data);
    } catch (error) {
      console.error('Failed to fetch car parts:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Process the data
      const updateData = {
        ...data,
        overallAssessment: {
          ...data.overallAssessment,
          strengths: data.overallAssessment.strengths ? 
            data.overallAssessment.strengths.split('\n').filter(s => s.trim()) : [],
          weaknesses: data.overallAssessment.weaknesses ? 
            data.overallAssessment.weaknesses.split('\n').filter(w => w.trim()) : [],
          majorIssues: data.overallAssessment.majorIssues || []
        }
      };

      await axios.put(`${API_URL}/inspections/${id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Inspection updated successfully!');
      fetchInspection(); // Refresh data
    } catch (error) {
      console.error('Error updating inspection:', error);
      toast.error(error.response?.data?.message || 'Failed to update inspection');
    } finally {
      setLoading(false);
    }
  };

  const togglePublishStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (isPublished) {
        // Unpublish
        await axios.put(`${API_URL}/inspections/${id}`, 
          { isPublished: false },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsPublished(false);
        toast.success('Inspection unpublished');
      } else {
        // Publish
        await axios.post(`${API_URL}/inspections/${id}/publish`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsPublished(true);
        toast.success('Inspection published');
      }
    } catch (error) {
      toast.error('Failed to update publish status');
    }
  };

  const addMajorIssue = () => {
    const currentIssues = watch('overallAssessment.majorIssues') || [];
    setValue('overallAssessment.majorIssues', [
      ...currentIssues,
      {
        category: '',
        issue: '',
        severity: 'Minor',
        repairUrgency: 'Monitor',
        estimatedCost: 0
      }
    ]);
  };

  const removeMajorIssue = (index) => {
    const currentIssues = watch('overallAssessment.majorIssues') || [];
    setValue('overallAssessment.majorIssues', 
      currentIssues.filter((_, i) => i !== index)
    );
  };

  const updateMajorIssue = (index, field, value) => {
    const currentIssues = watch('overallAssessment.majorIssues') || [];
    const updatedIssues = currentIssues.map((issue, i) => 
      i === index ? { ...issue, [field]: value } : issue
    );
    setValue('overallAssessment.majorIssues', updatedIssues);
  };

  const viewPublicReport = () => {
    if (inspection?.shareableLink) {
      window.open(`/inspection/${inspection.shareableLink}`, '_blank');
    }
  };

  if (!inspection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inspection...</p>
        </div>
      </div>
    );
  }

  const majorIssues = watch('overallAssessment.majorIssues') || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/inspections')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Inspection Report</h1>
                <p className="text-gray-600">
                  Report #{inspection.reportNumber} - {inspection.car?.make} {inspection.car?.model}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={viewPublicReport}
                disabled={!isPublished}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <EyeIcon className="h-5 w-5 mr-2" />
                View Public
              </button>
              <button
                onClick={togglePublishStatus}
                className={`px-4 py-2 rounded-lg text-white ${
                  isPublished 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isPublished ? 'Unpublish' : 'Publish'}
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-lg shadow-lg">
            <Tabs selectedIndex={activeTab} onSelect={setActiveTab}>
              <TabList className="flex border-b border-gray-200 px-6">
                <Tab className="px-4 py-4 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-800 hover:border-gray-300 cursor-pointer outline-none selected:text-blue-600 selected:border-blue-500">
                  Basic Information
                </Tab>
                <Tab className="px-4 py-4 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-800 hover:border-gray-300 cursor-pointer outline-none selected:text-blue-600 selected:border-blue-500">
                  Assessment
                </Tab>
                <Tab className="px-4 py-4 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-800 hover:border-gray-300 cursor-pointer outline-none selected:text-blue-600 selected:border-blue-500">
                  Car Parts ({carParts.length})
                </Tab>
              </TabList>

              {/* Basic Information Tab */}
              <TabPanel className="p-6">
                <div className="space-y-6">
                  {/* Vehicle Info (Read-only) */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Vehicle Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div><strong>Make:</strong> {inspection.car?.make}</div>
                      <div><strong>Model:</strong> {inspection.car?.model}</div>
                      <div><strong>Year:</strong> {inspection.car?.year}</div>
                      <div><strong>Registration:</strong> {inspection.car?.registrationNo}</div>
                      <div><strong>Mileage:</strong> {inspection.car?.mileage?.toLocaleString()} km</div>
                      <div><strong>Fuel:</strong> {inspection.car?.fuelType}</div>
                    </div>
                  </div>

                  {/* Overall Assessment */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Overall Assessment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Overall Rating (0-10) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          {...register('overallRating', { required: true, min: 0, max: 10 })}
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
                    </div>
                  </div>

                  {/* Repair Cost */}
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

                  {/* Inspector Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Inspector Notes
                    </label>
                    <textarea
                      {...register('overallAssessment.inspectorNotes')}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter detailed inspection notes..."
                    />
                  </div>
                </div>
              </TabPanel>

              {/* Assessment Tab */}
              <TabPanel className="p-6">
                <div className="space-y-6">
                  {/* Strengths */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Strengths (one per line)
                    </label>
                    <textarea
                      {...register('overallAssessment.strengths')}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter vehicle strengths, one per line..."
                    />
                  </div>

                  {/* Weaknesses */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Areas for Improvement (one per line)
                    </label>
                    <textarea
                      {...register('overallAssessment.weaknesses')}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter areas for improvement, one per line..."
                    />
                  </div>

                  {/* Major Issues */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Major Issues
                      </label>
                      <button
                        type="button"
                        onClick={addMajorIssue}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Issue
                      </button>
                    </div>

                    {majorIssues.map((issue, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Category</label>
                            <input
                              type="text"
                              value={issue.category || ''}
                              onChange={(e) => updateMajorIssue(index, 'category', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="e.g., Engine, Brakes, etc."
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Severity</label>
                            <select
                              value={issue.severity || 'Minor'}
                              onChange={(e) => updateMajorIssue(index, 'severity', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="Minor">Minor</option>
                              <option value="Moderate">Moderate</option>
                              <option value="Major">Major</option>
                              <option value="Critical">Critical</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <label className="block text-sm text-gray-600 mb-1">Issue Description</label>
                          <input
                            type="text"
                            value={issue.issue || ''}
                            onChange={(e) => updateMajorIssue(index, 'issue', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Describe the issue..."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Repair Urgency</label>
                            <select
                              value={issue.repairUrgency || 'Monitor'}
                              onChange={(e) => updateMajorIssue(index, 'repairUrgency', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="Immediate">Immediate</option>
                              <option value="Soon">Soon</option>
                              <option value="Monitor">Monitor</option>
                              <option value="Preventive">Preventive</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Estimated Cost (PKR)</label>
                            <input
                              type="number"
                              value={issue.estimatedCost || 0}
                              onChange={(e) => updateMajorIssue(index, 'estimatedCost', parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                        </div>

                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeMajorIssue(index)}
                            className="text-red-600 hover:text-red-700 text-sm flex items-center"
                          >
                            <TrashIcon className="h-4 w-4 mr-1" />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}

                    {majorIssues.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No major issues added. Click "Add Issue" to add one.</p>
                    )}
                  </div>
                </div>
              </TabPanel>

              {/* Car Parts Tab */}
              <TabPanel className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Car Parts Inspection</h3>
                    <button
                      type="button"
                      onClick={() => navigate(`/inspections/${id}/add-parts`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Add Parts
                    </button>
                  </div>

                  {carParts.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No car parts have been inspected yet.</p>
                      <button
                        type="button"
                        onClick={() => navigate(`/inspections/${id}/add-parts`)}
                        className="mt-2 text-blue-600 hover:text-blue-700"
                      >
                        Start adding parts →
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {carParts.map(part => (
                        <div key={part._id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900">{part.partName}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              part.condition === 'Excellent' ? 'bg-green-100 text-green-800' :
                              part.condition === 'Good' ? 'bg-blue-100 text-blue-800' :
                              part.condition === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {part.condition}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            Category: {part.category}
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            Score: {part.conditionScore}/10
                          </div>
                          
                          {part.issues && part.issues.length > 0 && (
                            <div className="text-sm text-red-600 mb-2">
                              {part.issues.length} issue(s) found
                            </div>
                          )}
                          
                          {part.images && part.images.length > 0 && (
                            <div className="text-sm text-gray-600 mb-2">
                              {part.images.length} image(s)
                            </div>
                          )}

                          <div className="text-xs text-gray-500">
                            Recommendation: {part.recommendation.replace('-', ' ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabPanel>
            </Tabs>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <CheckIcon className="h-5 w-5 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInspectionPage;