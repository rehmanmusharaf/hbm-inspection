import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  WrenchScrewdriverIcon,
  SparklesIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { CheckIcon, XMarkIcon, MinusIcon } from '@heroicons/react/24/solid';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PublicReportPage = () => {
  const { shareableLink } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchReport();
  }, [shareableLink]);

  const fetchReport = async () => {
    try {
      const response = await axios.get(`${API_URL}/inspections/public/${shareableLink}`);
      setReport(response.data.data);
      setLoading(false);
    } catch (error) {
      setError('Report not found or access denied');
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const response = await axios.get(`${API_URL}/inspections/download/${shareableLink}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inspection-report-${report.reportNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
  };

  const shareReport = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `Car Inspection Report - ${report.reportNumber}`,
        text: `Check out this detailed car inspection report`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getConditionColor = (condition) => {
    switch(condition) {
      case 'Excellent':
      case 'Good':
      case 'Working':
        return 'text-green-600';
      case 'Fair':
      case 'Worn':
        return 'text-yellow-600';
      case 'Poor':
      case 'Not Working':
      case 'Failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getConditionIcon = (condition) => {
    if (!condition || condition === 'N/A') return <MinusIcon className="w-5 h-5 text-gray-400" />;
    
    switch(condition) {
      case 'Excellent':
      case 'Good':
      case 'Working':
        return <CheckIcon className="w-5 h-5 text-green-600" />;
      case 'Fair':
      case 'Worn':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      case 'Poor':
      case 'Not Working':
      case 'Failed':
        return <XMarkIcon className="w-5 h-5 text-red-600" />;
      default:
        return <MinusIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const renderCheckpoint = (label, value, level = 0) => {
    if (!value || value === 'N/A') return null;
    
    return (
      <div className={`flex items-center justify-between py-2 px-${level * 4} border-b border-gray-100 hover:bg-gray-50`}>
        <span className="text-sm text-gray-700">{label}</span>
        <div className="flex items-center gap-2">
          {getConditionIcon(value)}
          <span className={`text-sm font-medium ${getConditionColor(value)}`}>{value}</span>
        </div>
      </div>
    );
  };

  const renderCategorySection = (title, data, icon) => {
    if (!data) return null;
    
    const isExpanded = expandedCategories[title];
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
        <button
          onClick={() => toggleCategory(title)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {icon}
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          {isExpanded ? (
            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRightIcon className="w-5 h-5 text-gray-500" />
          )}
        </button>
        
        {isExpanded && (
          <div className="border-t border-gray-200">
            {Object.entries(data).map(([key, value]) => {
              if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                return (
                  <div key={key} className="border-b border-gray-100 last:border-0">
                    <div className="px-6 py-3 bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                    </div>
                    <div>
                      {Object.entries(value).map(([subKey, subValue]) => {
                        if (subKey === 'notes' || subKey === 'images' || !subValue) return null;
                        
                        if (typeof subValue === 'object' && subValue !== null) {
                          return Object.entries(subValue).map(([detailKey, detailValue]) => 
                            renderCheckpoint(
                              `${subKey.replace(/([A-Z])/g, ' $1').trim()} - ${detailKey.replace(/([A-Z])/g, ' $1').trim()}`,
                              detailValue,
                              1
                            )
                          );
                        }
                        
                        return renderCheckpoint(
                          subKey.replace(/([A-Z])/g, ' $1').trim(),
                          subValue
                        );
                      })}
                    </div>
                  </div>
                );
              }
              
              if (key !== 'notes' && key !== 'images' && value) {
                return renderCheckpoint(
                  key.replace(/([A-Z])/g, ' $1').trim(),
                  value
                );
              }
            })}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inspection report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">{error}</h2>
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">Car Inspection Report</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {report.reportNumber}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={shareReport}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ShareIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Overall Rating */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold mb-4">
                {report.car?.make} {report.car?.model} ({report.car?.year})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-blue-200 text-sm">Registration</p>
                  <p className="font-semibold">{report.car?.registrationNo}</p>
                </div>
                <div>
                  <p className="text-blue-200 text-sm">Mileage</p>
                  <p className="font-semibold">{report.car?.mileage?.toLocaleString()} km</p>
                </div>
                <div>
                  <p className="text-blue-200 text-sm">Fuel Type</p>
                  <p className="font-semibold">{report.car?.fuelType || 'Petrol'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Inspected on {new Date(report.inspectionDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{report.inspectionLocation?.city || 'Location N/A'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
                <div className="w-32 h-32 mx-auto">
                  <CircularProgressbar
                    value={report.overallRating * 10}
                    text={`${report.overallRating}/10`}
                    styles={buildStyles({
                      textSize: '24px',
                      pathColor: report.overallRating >= 8 ? '#10b981' : report.overallRating >= 6 ? '#f59e0b' : '#ef4444',
                      textColor: '#fff',
                      trailColor: 'rgba(255,255,255,0.2)'
                    })}
                  />
                </div>
                <p className="mt-4 text-xl font-bold">{report.overallCondition}</p>
                <p className="text-blue-200">Overall Condition</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 overflow-x-auto">
          <div className="flex">
            {['overview', 'exterior', 'interior', 'engine', 'transmission', 'suspension', 'brakes', 'wheels', 'electrical', 'assessment', 'images'].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`px-6 py-3 font-medium capitalize whitespace-nowrap transition-colors ${
                  activeSection === section
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {section}
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {activeSection === 'overview' && (
            <>
              {/* Summary Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Passed</p>
                      <p className="text-2xl font-bold text-green-600">
                        {report.inspectionSummary?.passedCheckpoints || 0}
                      </p>
                    </div>
                    <CheckCircleIcon className="w-10 h-10 text-green-200" />
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Failed</p>
                      <p className="text-2xl font-bold text-red-600">
                        {report.inspectionSummary?.failedCheckpoints || 0}
                      </p>
                    </div>
                    <XCircleIcon className="w-10 h-10 text-red-200" />
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Warnings</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {report.inspectionSummary?.warningCheckpoints || 0}
                      </p>
                    </div>
                    <ExclamationTriangleIcon className="w-10 h-10 text-yellow-200" />
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Checks</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {report.inspectionSummary?.totalCheckpoints || 200}
                      </p>
                    </div>
                    <WrenchScrewdriverIcon className="w-10 h-10 text-gray-200" />
                  </div>
                </div>
              </div>

              {/* Major Issues */}
              {report.overallAssessment?.majorIssues?.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-red-900 mb-4">Major Issues Found</h3>
                  <div className="space-y-3">
                    {report.overallAssessment.majorIssues.map((issue, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <XCircleIcon className="w-5 h-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-red-900">{issue.category}: {issue.issue}</p>
                          <p className="text-sm text-red-700">
                            Severity: {issue.severity} | Urgency: {issue.repairUrgency}
                            {issue.estimatedCost && ` | Est. Cost: PKR ${issue.estimatedCost.toLocaleString()}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendation */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inspector's Recommendation</h3>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                  report.overallAssessment?.recommendation === 'Highly Recommended' 
                    ? 'bg-green-100 text-green-800'
                    : report.overallAssessment?.recommendation === 'Recommended'
                    ? 'bg-blue-100 text-blue-800'
                    : report.overallAssessment?.recommendation === 'Recommended with Repairs'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  <SparklesIcon className="w-5 h-5" />
                  <span className="font-medium">{report.overallAssessment?.recommendation}</span>
                </div>
                
                {report.overallAssessment?.inspectorNotes && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{report.overallAssessment.inspectorNotes}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeSection === 'exterior' && report.exterior && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Exterior Inspection</h2>
              {renderCategorySection('Body Panels', report.exterior.body, <span className="text-blue-600">🚗</span>)}
              {renderCategorySection('Paint & Finish', report.exterior.paint, <span className="text-green-600">🎨</span>)}
              {renderCategorySection('Glass & Mirrors', report.exterior.glass, <span className="text-cyan-600">🪟</span>)}
              {renderCategorySection('Lights', report.exterior.lights, <span className="text-yellow-600">💡</span>)}
            </div>
          )}

          {activeSection === 'interior' && report.interior && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Interior Inspection</h2>
              {renderCategorySection('Seats', report.interior.seats, <span className="text-brown-600">💺</span>)}
              {renderCategorySection('Dashboard & Controls', report.interior.dashboard, <span className="text-gray-600">🎛️</span>)}
              {renderCategorySection('HVAC System', report.interior.hvac, <span className="text-blue-600">❄️</span>)}
              {renderCategorySection('Electronics', report.interior.electricalAndElectronics, <span className="text-purple-600">📱</span>)}
            </div>
          )}

          {activeSection === 'engine' && report.engine && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Engine Inspection</h2>
              {renderCategorySection('General', report.engine.general, <span className="text-red-600">🔧</span>)}
              {renderCategorySection('Oil System', report.engine.oilSystem, <span className="text-amber-600">🛢️</span>)}
              {renderCategorySection('Cooling System', report.engine.coolingSystem, <span className="text-blue-600">🌡️</span>)}
              {renderCategorySection('Fuel System', report.engine.fuelSystem, <span className="text-green-600">⛽</span>)}
            </div>
          )}

          {activeSection === 'transmission' && report.transmission && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Transmission & Drivetrain</h2>
              {renderCategorySection('General', report.transmission.general, <span className="text-gray-600">⚙️</span>)}
              {renderCategorySection('Fluid', report.transmission.fluid, <span className="text-red-600">🩸</span>)}
              {renderCategorySection('Clutch', report.transmission.clutch, <span className="text-purple-600">🔄</span>)}
              {renderCategorySection('Gear Shifting', report.transmission.gearShifting, <span className="text-blue-600">🎚️</span>)}
            </div>
          )}

          {activeSection === 'suspension' && report.suspension && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Suspension & Steering</h2>
              {renderCategorySection('Front Suspension', report.suspension.frontSuspension, <span className="text-orange-600">🔩</span>)}
              {renderCategorySection('Rear Suspension', report.suspension.rearSuspension, <span className="text-orange-600">🔩</span>)}
              {renderCategorySection('Steering System', report.suspension.steering, <span className="text-gray-600">🎯</span>)}
            </div>
          )}

          {activeSection === 'brakes' && report.brakes && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Brakes Inspection</h2>
              {renderCategorySection('General Performance', report.brakes.general, <span className="text-red-600">🛑</span>)}
              {renderCategorySection('Front Brakes', report.brakes.frontBrakes, <span className="text-orange-600">🔵</span>)}
              {renderCategorySection('Rear Brakes', report.brakes.rearBrakes, <span className="text-orange-600">🔵</span>)}
              {renderCategorySection('Brake Fluid', report.brakes.fluid, <span className="text-yellow-600">💧</span>)}
            </div>
          )}

          {activeSection === 'wheels' && report.wheelsAndTires && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Wheels & Tires</h2>
              {renderCategorySection('Tires', report.wheelsAndTires.tires, <span className="text-gray-600">🛞</span>)}
              {renderCategorySection('Wheels', report.wheelsAndTires.wheels, <span className="text-silver-600">⭕</span>)}
            </div>
          )}

          {activeSection === 'electrical' && report.electrical && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Electrical System</h2>
              {renderCategorySection('Battery', report.electrical.battery, <span className="text-green-600">🔋</span>)}
              {renderCategorySection('Alternator', report.electrical.alternator, <span className="text-yellow-600">⚡</span>)}
              {renderCategorySection('Starter', report.electrical.starter, <span className="text-blue-600">🔌</span>)}
              {renderCategorySection('Wiring & Fuses', report.electrical.wiring, <span className="text-red-600">🔌</span>)}
            </div>
          )}

          {activeSection === 'assessment' && report.overallAssessment && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Overall Assessment</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Value</h3>
                  <p className="text-3xl font-bold text-green-600">
                    PKR {report.overallAssessment.estimatedMarketValue?.amount?.toLocaleString() || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">Estimated market value</p>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Repair Cost</h3>
                  <p className="text-3xl font-bold text-red-600">
                    PKR {report.overallAssessment.estimatedRepairCost?.amount?.toLocaleString() || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">Estimated repair cost</p>
                </div>
              </div>

              {report.overallAssessment.strengths?.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">Strengths</h3>
                  <ul className="space-y-2">
                    {report.overallAssessment.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                        <span className="text-green-800">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {report.overallAssessment.weaknesses?.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-900 mb-4">Weaknesses</h3>
                  <ul className="space-y-2">
                    {report.overallAssessment.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <XCircleIcon className="w-5 h-5 text-red-600 mt-0.5" />
                        <span className="text-red-800">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeSection === 'images' && report.carImages?.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Vehicle Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {report.carImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={image.url}
                      alt={image.caption || `Vehicle image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg shadow-sm group-hover:shadow-lg transition-shadow"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                      <CameraIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {image.category && (
                      <span className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded">
                        {image.category}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage.url}
              alt={selectedImage.caption || 'Vehicle image'}
              className="max-w-full max-h-full rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            This inspection report was generated by Car Inspection System
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Report #{report.reportNumber} | Inspected by {report.inspector?.name}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicReportPage;