import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import { 
  FaCar, 
  FaClipboardCheck, 
  FaCalendarAlt, 
  FaUsers,
  FaChartLine,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock
} from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentActivity(5)
      ]);
      
      setStats(statsRes.data.data);
      setActivities(activityRes.data.data);
      setError(null);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
      case 'draft':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000); // seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    
    return d.toLocaleDateString();
  };

  // Different dashboard cards based on user role
  const renderDashboardCards = () => {
    if (user?.role === 'admin') {
      return (
        <>
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Cars</p>
                  <h3 className="text-3xl font-bold mt-1">{stats?.totalCars || 0}</h3>
                </div>
                <FaCar className="text-4xl text-blue-200" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Inspections</p>
                  <h3 className="text-3xl font-bold mt-1">{stats?.totalInspections || 0}</h3>
                  <p className="text-xs text-green-200 mt-1">
                    {stats?.publishedInspections || 0} Published
                  </p>
                </div>
                <FaClipboardCheck className="text-4xl text-green-200" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Unpublished Reports</p>
                  <h3 className="text-3xl font-bold mt-1">{stats?.unpublishedInspections || 0}</h3>
                  <p className="text-xs text-purple-200 mt-1">
                    {stats?.publishedPercentage || 0}% Published
                  </p>
                </div>
                <FaExclamationTriangle className="text-4xl text-purple-200" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Total Bookings</p>
                  <h3 className="text-3xl font-bold mt-1">{stats?.totalBookings || 0}</h3>
                  <p className="text-xs text-orange-200 mt-1">
                    {stats?.pendingBookings || 0} Pending
                  </p>
                </div>
                <FaCalendarAlt className="text-4xl text-orange-200" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-teal-500 to-teal-600 text-white">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100 text-sm">Active Users</p>
                  <h3 className="text-3xl font-bold mt-1">{stats?.totalUsers || 0}</h3>
                  <p className="text-xs text-teal-200 mt-1">
                    {stats?.totalInspectors || 0} Inspectors
                  </p>
                </div>
                <FaUsers className="text-4xl text-teal-200" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm">Today's Inspections</p>
                  <h3 className="text-3xl font-bold mt-1">{stats?.todayInspections || 0}</h3>
                  <p className="text-xs text-indigo-200 mt-1">
                    Avg Rating: {stats?.averageRating || 'N/A'}
                  </p>
                </div>
                <FaChartLine className="text-4xl text-indigo-200" />
              </div>
            </div>
          </div>
        </>
      );
    } else if (user?.role === 'inspector') {
      return (
        <>
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">My Inspections</p>
                  <h3 className="text-3xl font-bold mt-1">{stats?.totalInspections || 0}</h3>
                  <p className="text-xs text-blue-200 mt-1">
                    {stats?.publishedPercentage || 0}% Published
                  </p>
                </div>
                <FaClipboardCheck className="text-4xl text-blue-200" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Published Reports</p>
                  <h3 className="text-3xl font-bold mt-1">{stats?.publishedInspections || 0}</h3>
                </div>
                <FaCheckCircle className="text-4xl text-green-200" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Unpublished Reports</p>
                  <h3 className="text-3xl font-bold mt-1">{stats?.unpublishedInspections || 0}</h3>
                </div>
                <FaExclamationTriangle className="text-4xl text-yellow-200" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Assigned Bookings</p>
                  <h3 className="text-3xl font-bold mt-1">{stats?.assignedBookings || 0}</h3>
                  <p className="text-xs text-purple-200 mt-1">
                    {stats?.todayBookings || 0} Today
                  </p>
                </div>
                <FaCalendarAlt className="text-4xl text-purple-200" />
              </div>
            </div>
          </div>
        </>
      );
    } else {
      // Regular user dashboard
      return (
        <>
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">My Cars</p>
                  <h3 className="text-3xl font-bold mt-1">{stats?.totalCars || 0}</h3>
                </div>
                <FaCar className="text-4xl text-blue-200" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Inspections</p>
                  <h3 className="text-3xl font-bold mt-1">{stats?.totalInspections || 0}</h3>
                  <p className="text-xs text-green-200 mt-1">
                    {stats?.publishedReports || 0} Published
                  </p>
                </div>
                <FaClipboardCheck className="text-4xl text-green-200" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">My Bookings</p>
                  <h3 className="text-3xl font-bold mt-1">{stats?.totalBookings || 0}</h3>
                  <p className="text-xs text-orange-200 mt-1">
                    {stats?.pendingBookings || 0} Pending
                  </p>
                </div>
                <FaCalendarAlt className="text-4xl text-orange-200" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Upcoming Bookings</p>
                  <h3 className="text-3xl font-bold mt-1">{stats?.upcomingBookings || 0}</h3>
                </div>
                <FaClock className="text-4xl text-purple-200" />
              </div>
            </div>
          </div>
        </>
      );
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-secondary-600 mt-1">
          Here's what's happening with your car inspection system
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {renderDashboardCards()}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Recent Activity
            </h3>
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {activity.type === 'inspection' && (
                        <FaClipboardCheck className="text-blue-500" />
                      )}
                      {activity.type === 'booking' && (
                        <FaCalendarAlt className="text-orange-500" />
                      )}
                      {activity.type === 'user' && (
                        <FaUsers className="text-green-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-secondary-700">
                        {activity.message}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                        <span className="text-xs text-secondary-500">
                          {formatDate(activity.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary-500 text-sm">No recent activity</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/inspections/create"
                    className="btn btn-primary text-center"
                  >
                    New Inspection
                  </Link>
                  <Link
                    to="/users"
                    className="btn btn-secondary text-center"
                  >
                    Manage Users
                  </Link>
                  <Link
                    to="/bookings"
                    className="btn btn-secondary text-center"
                  >
                    View Bookings
                  </Link>
                  <Link
                    to="/inspections"
                    className="btn btn-secondary text-center"
                  >
                    All Reports
                  </Link>
                </>
              )}
              {user?.role === 'inspector' && (
                <>
                  <Link
                    to="/inspections/create"
                    className="btn btn-primary text-center"
                  >
                    New Inspection
                  </Link>
                  <Link
                    to="/bookings"
                    className="btn btn-secondary text-center"
                  >
                    My Bookings
                  </Link>
                  <Link
                    to="/inspections"
                    className="btn btn-secondary text-center"
                  >
                    My Reports
                  </Link>
                  <Link
                    to="/profile"
                    className="btn btn-secondary text-center"
                  >
                    Profile
                  </Link>
                </>
              )}
              {user?.role === 'user' && (
                <>
                  <Link
                    to="/cars/new"
                    className="btn btn-primary text-center"
                  >
                    Add Car
                  </Link>
                  <Link
                    to="/bookings/new"
                    className="btn btn-secondary text-center"
                  >
                    Book Inspection
                  </Link>
                  <Link
                    to="/cars"
                    className="btn btn-secondary text-center"
                  >
                    My Cars
                  </Link>
                  <Link
                    to="/inspections"
                    className="btn btn-secondary text-center"
                  >
                    My Reports
                  </Link>
                </>
              )}
            </div>

            {/* Next Booking for Users */}
            {user?.role === 'user' && stats?.nextBooking && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Next Booking</p>
                <p className="text-xs text-blue-700 mt-1">
                  {stats.nextBooking.car?.make} {stats.nextBooking.car?.model}
                </p>
                <p className="text-xs text-blue-600">
                  {new Date(stats.nextBooking.scheduledDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Inspections Table */}
      {stats?.recentInspections && stats.recentInspections.length > 0 && (
        <div className="card mt-6">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Recent Inspection Reports
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Car
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Registration
                    </th>
                    {user?.role !== 'inspector' && (
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Inspector
                      </th>
                    )}
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.recentInspections.map((inspection) => (
                    <tr key={inspection._id}>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {inspection.car?.make} {inspection.car?.model}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {inspection.car?.registrationNo}
                      </td>
                      {user?.role !== 'inspector' && (
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {inspection.inspector?.name}
                        </td>
                      )}
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {new Date(inspection.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <Link
                          to={`/inspections/${inspection._id}`}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;