import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import QRCode from 'qrcode';
import {
  DocumentArrowDownIcon,
  ShareIcon,
  CalendarIcon,
  UserIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  EyeIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PublicInspectionReport = () => {
  const { shareableLink } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchReport();
    generateQRCode();
  }, [shareableLink]);

  const fetchReport = async () => {
    try {
      const response = await axios.get(`${API_URL}/inspections/public/${shareableLink}`);
      setReport(response.data.data);
    } catch (error) {
      toast.error('Report not found or not published');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    try {
      const url = window.location.href;
      const qrCode = await QRCode.toDataURL(url);
      setQrCodeUrl(qrCode);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const getConditionColor = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'excellent': return 'text-green-700 bg-green-100';
      case 'good': return 'text-blue-700 bg-blue-100';
      case 'fair': return 'text-yellow-700 bg-yellow-100';
      case 'poor': return 'text-red-700 bg-red-100';
      case 'damaged': return 'text-red-800 bg-red-200';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation?.toLowerCase()) {
      case 'highly recommended': return 'text-green-800 bg-green-100';
      case 'recommended': return 'text-blue-800 bg-blue-100';
      case 'recommended with repairs': return 'text-yellow-800 bg-yellow-100';
      case 'not recommended': return 'text-red-800 bg-red-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const downloadPDF = async () => {
    try {
      // Use the public download endpoint that doesn't require authentication
      const response = await axios.get(`${API_URL}/inspections/download/${shareableLink}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inspection-report-${report.reportNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF. Please try again.');
    }
  };

  const printReport = () => {
    window.print();
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />);
    }

    if (hasHalfStar) {
      stars.push(<StarIcon key="half" className="h-5 w-5 text-yellow-400 fill-current opacity-50" />);
    }

    const remainingStars = 10 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<StarIcon key={`empty-${i}`} className="h-5 w-5 text-gray-300" />);
    }

    return stars;
  };

  const groupPartsByCategory = (parts) => {
    const grouped = {};
    parts?.forEach(part => {
      if (!grouped[part.category]) {
        grouped[part.category] = [];
      }
      grouped[part.category].push(part);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inspection report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <XCircleIcon className="h-32 w-32 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h1>
          <p className="text-gray-600">The inspection report you're looking for doesn't exist or is not published.</p>
        </div>
      </div>
    );
  }

  const partsByCategory = groupPartsByCategory(report.carParts);

  return (
    <div className="min-h-screen bg-gray-50 py-8 print:py-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 print:max-w-none print:px-0">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg mb-6 print:shadow-none print:mb-4">
          <div className="p-6 print:p-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <img 
                    src="/logo.png" 
                    alt="HBM Inspection" 
                    className="h-12 w-12 mr-3"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Vehicle Inspection Report</h1>
                    <p className="text-lg text-blue-600 font-semibold">Report #{report.reportNumber}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {report.car?.brand?.name} {report.car?.carModel?.name} {report.car?.year}
                    </h2>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Registration:</strong> {report.car?.registrationNo}</p>
                      <p><strong>Mileage:</strong> {report.car?.mileage?.toLocaleString()} km</p>
                      <p><strong>Fuel Type:</strong> {report.car?.fuelType}</p>
                      <p><strong>Transmission:</strong> {report.car?.transmissionType}</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        Inspected on {formatDate(report.inspectionDate)}
                      </span>
                    </div>
                    <div className="flex items-center mb-2">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        Inspector: {report.inspector?.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <EyeIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        Views: {report.viewCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code & Actions */}
              <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col items-center print:hidden">
                {qrCodeUrl && (
                  <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24 mb-3" />
                )}
                <div className="flex gap-2">
                  <button
                    onClick={copyLink}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
                  >
                    <ShareIcon className="h-4 w-4 mr-1" />
                    Share
                  </button>
                  <button
                    onClick={downloadPDF}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center text-sm"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                    PDF
                  </button>
                  <button
                    onClick={printReport}
                    className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center text-sm"
                  >
                    <PrinterIcon className="h-4 w-4 mr-1" />
                    Print
                  </button>
                </div>
              </div>
            </div>

            {/* Overall Rating */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {report.overallRating}/10
                  </div>
                  <div className="flex justify-center mb-2">
                    {renderRatingStars(report.overallRating)}
                  </div>
                  <p className="text-sm text-gray-600">Overall Rating</p>
                </div>
                
                <div className="text-center">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(report.overallCondition)}`}>
                    {report.overallCondition}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Overall Condition</p>
                </div>
                
                <div className="text-center">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(report.overallAssessment?.recommendation)}`}>
                    {report.overallAssessment?.recommendation}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Recommendation</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6 print:hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'parts', label: 'Parts Inspection' },
                { id: 'details', label: 'Detailed Report' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg print:shadow-none">
          <div className="p-6 print:p-4">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {report.inspectionSummary?.passedCheckpoints || 0}
                    </div>
                    <div className="text-sm text-gray-600">Passed</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {report.inspectionSummary?.warningCheckpoints || 0}
                    </div>
                    <div className="text-sm text-gray-600">Warnings</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {report.inspectionSummary?.failedCheckpoints || 0}
                    </div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {report.carParts?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Parts Inspected</div>
                  </div>
                </div>

                {/* Major Issues */}
                {report.overallAssessment?.majorIssues?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Major Issues</h3>
                    <div className="space-y-2">
                      {report.overallAssessment.majorIssues.map((issue, index) => (
                        <div key={index} className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-red-800">{issue.issue}</p>
                            <p className="text-sm text-red-600">
                              Category: {issue.category} | Severity: {issue.severity}
                              {issue.estimatedCost && ` | Estimated Cost: PKR ${issue.estimatedCost.toLocaleString()}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {report.overallAssessment?.strengths?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Strengths</h3>
                      <div className="space-y-2">
                        {report.overallAssessment.strengths.map((strength, index) => (
                          <div key={index} className="flex items-center p-2 bg-green-50 rounded-lg">
                            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                            <span className="text-green-800">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {report.overallAssessment?.weaknesses?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Areas for Improvement</h3>
                      <div className="space-y-2">
                        {report.overallAssessment.weaknesses.map((weakness, index) => (
                          <div key={index} className="flex items-center p-2 bg-yellow-50 rounded-lg">
                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0" />
                            <span className="text-yellow-800">{weakness}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Inspector Notes */}
                {report.overallAssessment?.inspectorNotes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Inspector Notes</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">{report.overallAssessment.inspectorNotes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Parts Tab */}
            {activeTab === 'parts' && (
              <div className="space-y-6">
                {Object.entries(partsByCategory).map(([category, parts]) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                      {category} ({parts.length} parts)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {parts.map(part => (
                        <div key={part._id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900">{part.partName}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${getConditionColor(part.condition)}`}>
                              {part.condition}
                            </span>
                          </div>
                          
                          <div className="flex items-center mb-2">
                            <span className="text-sm text-gray-600 mr-2">Score:</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  part.conditionScore >= 8 ? 'bg-green-500' :
                                  part.conditionScore >= 6 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${(part.conditionScore / 10) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium ml-2">{part.conditionScore}/10</span>
                          </div>

                          {part.issues && part.issues.length > 0 && (
                            <div className="mb-2">
                              <span className="text-sm text-red-600 font-medium">
                                {part.issues.length} issue(s) found
                              </span>
                              <div className="mt-1 space-y-1">
                                {part.issues.map((issue, index) => (
                                  <div key={index} className="text-xs text-gray-600">
                                    • {issue.type} ({issue.severity}) - {issue.description}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {part.images && part.images.length > 0 && (
                            <div className="grid grid-cols-3 gap-1 mt-2">
                              {part.images.slice(0, 3).map((image, index) => (
                                <img
                                  key={index}
                                  src={image.url}
                                  alt={`${part.partName} ${index + 1}`}
                                  className="w-full h-16 object-cover rounded"
                                />
                              ))}
                            </div>
                          )}

                          {part.notes && (
                            <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                              {part.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {Object.keys(partsByCategory).length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No detailed part inspections available for this report.</p>
                  </div>
                )}
              </div>
            )}

            {/* Detailed Report Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Inspection Details</h3>
                  
                  {/* This would contain all the detailed inspection data */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600 mb-4">
                      This section contains the complete detailed inspection report including all systems, 
                      components, and technical assessments performed during the inspection.
                    </p>
                    
                    {/* Vehicle Information */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-2">Vehicle Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><strong>Make:</strong> {report.car?.make}</div>
                        <div><strong>Model:</strong> {report.car?.model}</div>
                        <div><strong>Year:</strong> {report.car?.year}</div>
                        <div><strong>Registration:</strong> {report.car?.registrationNo}</div>
                        <div><strong>Chassis No:</strong> {report.car?.chassisNo}</div>
                        <div><strong>Engine No:</strong> {report.car?.engineNo}</div>
                        <div><strong>Mileage:</strong> {report.car?.mileage?.toLocaleString()} km</div>
                        <div><strong>Color:</strong> {report.car?.color}</div>
                        <div><strong>Fuel Type:</strong> {report.car?.fuelType}</div>
                        <div><strong>Transmission:</strong> {report.car?.transmissionType}</div>
                      </div>
                    </div>

                    {/* Inspection Summary */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-2">Inspection Summary</h4>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div><strong>Total Checkpoints:</strong> {report.inspectionSummary?.totalCheckpoints}</div>
                        <div><strong>Passed:</strong> {report.inspectionSummary?.passedCheckpoints}</div>
                        <div><strong>Failed:</strong> {report.inspectionSummary?.failedCheckpoints}</div>
                        <div><strong>Warnings:</strong> {report.inspectionSummary?.warningCheckpoints}</div>
                      </div>
                    </div>

                    {/* Report Metadata */}
                    <div className="text-xs text-gray-500 border-t pt-4">
                      <p><strong>Report Generated:</strong> {formatDate(report.createdAt)}</p>
                      <p><strong>Last Updated:</strong> {formatDate(report.updatedAt)}</p>
                      <p><strong>Report ID:</strong> {report._id}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm print:mt-4">
          <p>© 2024 HBM Inspection Services. All rights reserved.</p>
          <p>This report is generated electronically and is valid without signature.</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body { print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:py-0 { padding-top: 0 !important; padding-bottom: 0 !important; }
          .print\\:px-0 { padding-left: 0 !important; padding-right: 0 !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:mb-4 { margin-bottom: 1rem !important; }
          .print\\:p-4 { padding: 1rem !important; }
          .print\\:mt-4 { margin-top: 1rem !important; }
          .print\\:max-w-none { max-width: none !important; }
        }
      `}</style>
    </div>
  );
};

export default PublicInspectionReport;