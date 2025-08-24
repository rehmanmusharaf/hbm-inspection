import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import {
  DocumentTextIcon,
  TruckIcon,
  WrenchIcon,
  StarIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import ImageModal from '../../components/ImageModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ViewInspectionPage = () => {
  const { id } = useParams();
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [modalImages, setModalImages] = useState([]);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    fetchInspection();
  }, [id]);

  const fetchInspection = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/inspections/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInspection(response.data.data);
    } catch (error) {
      console.error('Error fetching inspection:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch inspection report');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      if (!inspection?.shareableLink) {
        toast.error('No shareable link available for this report');
        return;
      }

      const response = await axios.get(`${API_URL}/inspections/download/${inspection.shareableLink}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inspection-report-${inspection.reportNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const handleShare = () => {
    if (inspection?.shareableLink) {
      const shareUrl = `${window.location.origin}/public/inspection/${inspection.shareableLink}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success('Share link copied to clipboard');
      }).catch(() => {
        toast.error('Failed to copy link');
      });
    }
  };

  const openImageModal = (images, index = 0) => {
    setModalImages(images);
    setModalImageIndex(index);
    setIsImageModalOpen(true);
  };

  const handlePublish = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/inspections/${id}/publish`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setInspection(response.data.data);
      toast.success('Report published successfully! It can now be viewed publicly.');
    } catch (error) {
      console.error('Error publishing report:', error);
      toast.error(error.response?.data?.message || 'Failed to publish report');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIconSolid key={i} className="h-5 w-5 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <StarIcon className="h-5 w-5 text-gray-300" />
          <StarIconSolid className="absolute inset-0 h-5 w-5 text-yellow-400 clip-path-half" />
        </div>
      );
    }

    const remainingStars = 10 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="h-5 w-5 text-gray-300" />
      );
    }

    return stars;
  };

  const getConditionColor = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'excellent':
        return 'text-green-600 bg-green-100';
      case 'very good':
        return 'text-green-500 bg-green-50';
      case 'good':
        return 'text-blue-600 bg-blue-100';
      case 'fair':
        return 'text-yellow-600 bg-yellow-100';
      case 'poor':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation?.toLowerCase()) {
      case 'highly recommended':
        return 'text-green-600 bg-green-100';
      case 'recommended':
        return 'text-blue-600 bg-blue-100';
      case 'recommended with repairs':
        return 'text-yellow-600 bg-yellow-100';
      case 'not recommended':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inspection report...</p>
        </div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Inspection Report Not Found</h2>
          <p className="text-gray-600 mb-4">The inspection report you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link
            to="/inspections"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Back to Inspections
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { name: 'Overview', icon: DocumentTextIcon },
    { name: 'Vehicle Details', icon: TruckIcon },
    { name: 'Parts Inspection', icon: WrenchIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <DocumentTextIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Inspection Report #{inspection.reportNumber}
                  </h1>
                  <p className="text-gray-600">
                    {inspection.car?.make} {inspection.car?.model} ({inspection.car?.year})
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {new Date(inspection.inspectionDate).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-1" />
                  {inspection.inspector?.name}
                </div>
                {inspection.viewCount && (
                  <div className="flex items-center">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    {inspection.viewCount} views
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
              {!inspection.isPublished && (
                <button
                  onClick={handlePublish}
                  className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Publish
                </button>
              )}
              
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <PrinterIcon className="h-4 w-4 mr-2" />
                Print
              </button>
              
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                PDF
              </button>
              
              {inspection.shareableLink && inspection.isPublished && (
                <button
                  onClick={handleShare}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ShareIcon className="h-4 w-4 mr-2" />
                  Share
                </button>
              )}

              <Link
                to={`/inspections/${inspection._id}/add-parts`}
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                <WrenchIcon className="h-4 w-4 mr-2" />
                Add Parts
              </Link>
            </div>
          </div>

          {/* Overall Rating */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Overall Rating</h3>
                <div className="flex items-center mt-1">
                  <div className="flex items-center mr-3">
                    {renderStars(inspection.overallRating)}
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {inspection.overallRating}/10
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(inspection.overallCondition)}`}>
                  {inspection.overallCondition}
                </span>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(inspection.overallAssessment?.recommendation)}`}>
                    {inspection.overallAssessment?.recommendation}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg">
          <Tab.Group selectedIndex={selectedTabIndex} onChange={setSelectedTabIndex}>
            <Tab.List className="flex space-x-1 rounded-t-lg bg-blue-900/20 p-1">
              {tabs.map((tab, index) => (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${
                      selected
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center justify-center">
                    <tab.icon className="h-5 w-5 mr-2" />
                    {tab.name}
                  </div>
                </Tab>
              ))}
            </Tab.List>

            <Tab.Panels className="p-6">
              {/* Overview Tab */}
              <Tab.Panel>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Key Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Key Information</h3>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Report Number:</span>
                            <p className="text-gray-900">{inspection.reportNumber}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Inspection Date:</span>
                            <p className="text-gray-900">{new Date(inspection.inspectionDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Inspector:</span>
                            <p className="text-gray-900">{inspection.inspector?.name}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Status:</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              inspection.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {inspection.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Assessment Summary */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Assessment Summary</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Overall Rating:</span>
                            <span className="font-medium">{inspection.overallRating}/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Condition:</span>
                            <span className="font-medium">{inspection.overallCondition}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Recommendation:</span>
                            <span className="font-medium">{inspection.overallAssessment?.recommendation}</span>
                          </div>
                          {inspection.overallAssessment?.estimatedRepairCost?.amount && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Estimated Repair Cost:</span>
                              <span className="font-medium">PKR {inspection.overallAssessment.estimatedRepairCost.amount.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Summary */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Vehicle Summary</h3>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {inspection.car?.brand?.name} {inspection.car?.carModel?.name}
                            </h4>
                            <p className="text-gray-600">{inspection.car?.year} • {inspection.car?.variant}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Registration:</span>
                              <p className="text-gray-900">{inspection.car?.registrationNo}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Mileage:</span>
                              <p className="text-gray-900">{inspection.car?.mileage?.toLocaleString()} km</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Fuel Type:</span>
                              <p className="text-gray-900 capitalize">{inspection.car?.fuelType}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Transmission:</span>
                              <p className="text-gray-900 capitalize">{inspection.car?.transmissionType}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Parts Summary */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Parts Inspection Summary</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                              {inspection.carParts?.length || 0}
                            </div>
                            <div className="text-sm text-gray-600">Parts Inspected</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Inspector Notes */}
                  {inspection.overallAssessment?.inspectorNotes && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Inspector Notes</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {inspection.overallAssessment.inspectorNotes}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </Tab.Panel>

              {/* Vehicle Details Tab */}
              <Tab.Panel>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm font-medium text-gray-700">Make:</span>
                              <p className="text-gray-900">{inspection.car?.make}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-700">Model:</span>
                              <p className="text-gray-900">{inspection.car?.model}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-700">Year:</span>
                              <p className="text-gray-900">{inspection.car?.year}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-700">Variant:</span>
                              <p className="text-gray-900">{inspection.car?.variant || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Details</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <span className="text-sm font-medium text-gray-700">Registration Number:</span>
                              <p className="text-gray-900 font-mono">{inspection.car?.registrationNo}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-700">Chassis Number:</span>
                              <p className="text-gray-900 font-mono">{inspection.car?.chassisNo}</p>
                            </div>
                            {inspection.car?.engineNo && (
                              <div>
                                <span className="text-sm font-medium text-gray-700">Engine Number:</span>
                                <p className="text-gray-900 font-mono">{inspection.car?.engineNo}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Specifications</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm font-medium text-gray-700">Engine Capacity:</span>
                              <p className="text-gray-900">{inspection.car?.engineCapacity || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-700">Fuel Type:</span>
                              <p className="text-gray-900 capitalize">{inspection.car?.fuelType}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-700">Transmission:</span>
                              <p className="text-gray-900 capitalize">{inspection.car?.transmissionType}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-700">Color:</span>
                              <p className="text-gray-900">{inspection.car?.color || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-700">Current Mileage:</span>
                              <p className="text-gray-900">{inspection.car?.mileage?.toLocaleString()} km</p>
                            </div>
                            {inspection.car?.purchaseYear && (
                              <div>
                                <span className="text-sm font-medium text-gray-700">Purchase Year:</span>
                                <p className="text-gray-900">{inspection.car?.purchaseYear}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {inspection.car?.importDate && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Information</h3>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div>
                              <span className="text-sm font-medium text-gray-700">Import Date:</span>
                              <p className="text-gray-900">{new Date(inspection.car.importDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Tab.Panel>

              {/* Parts Inspection Tab */}
              <Tab.Panel>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {inspection.carParts && inspection.carParts.length > 0 ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Parts Inspection ({inspection.carParts.length} parts)
                        </h3>
                        <Link
                          to={`/inspections/${inspection._id}/add-parts`}
                          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                        >
                          <WrenchIcon className="h-4 w-4 mr-2" />
                          Add More Parts
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {inspection.carParts.map((part, index) => (
                          <div key={part._id || index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{part.name}</h4>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                part.condition === 'Excellent' ? 'bg-green-100 text-green-800' :
                                part.condition === 'Good' ? 'bg-blue-100 text-blue-800' :
                                part.condition === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                                part.condition === 'Poor' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {part.condition}
                              </span>
                            </div>
                            
                            <div className="text-sm text-gray-600 space-y-1">
                              <p><span className="font-medium">Rating:</span> {part.rating}/10</p>
                              {part.issues && part.issues.length > 0 && (
                                <p><span className="font-medium">Issues:</span> {part.issues.length}</p>
                              )}
                              {part.repairCost?.amount && (
                                <p><span className="font-medium">Repair Cost:</span> PKR {part.repairCost.amount.toLocaleString()}</p>
                              )}
                            </div>

                            {part.images && part.images.length > 0 && (
                              <div className="mt-3">
                                <div className="flex space-x-2">
                                  {part.images.slice(0, 3).map((image, imgIndex) => (
                                    <img
                                      key={imgIndex}
                                      src={image.url}
                                      alt={`${part.name} ${imgIndex + 1}`}
                                      className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={() => openImageModal(part.images, imgIndex)}
                                    />
                                  ))}
                                  {part.images.length > 3 && (
                                    <button
                                      onClick={() => openImageModal(part.images, 3)}
                                      className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-600 hover:bg-gray-300 transition-colors"
                                    >
                                      +{part.images.length - 3}
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <WrenchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Parts Inspected Yet</h3>
                      <p className="text-gray-600 mb-4">
                        Start adding detailed part inspections to complete your report.
                      </p>
                      <Link
                        to={`/inspections/${inspection._id}/add-parts`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <WrenchIcon className="h-5 w-5 mr-2" />
                        Add Parts
                      </Link>
                    </div>
                  )}
                </motion.div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>

        {/* QR Code and Share Section */}
        {inspection.shareableLink && inspection.isPublished && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <QrCodeIcon className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Public Report Link</h3>
                  <p className="text-gray-600 text-sm">Share this report with others</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ShareIcon className="h-4 w-4 mr-2" />
                  Copy Link
                </button>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-600 font-mono break-all">
                {window.location.origin}/public/inspection/{inspection.shareableLink}
              </p>
            </div>
          </div>
        )}
        
        {/* Unpublished Notice */}
        {!inspection.isPublished && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-semibold text-yellow-800">Report Not Published</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  This report is currently in draft mode and cannot be viewed publicly. 
                  Click the "Publish" button above to make it available for public viewing and sharing.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      <ImageModal
        images={modalImages}
        currentIndex={modalImageIndex}
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onNavigate={(index) => setModalImageIndex(index)}
      />
    </div>
  );
};

export default ViewInspectionPage;