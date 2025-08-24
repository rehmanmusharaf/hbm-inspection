import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Dashboard Pages
import DashboardPage from './pages/DashboardPage';
import CarsPage from './pages/CarsPage';
import BookingsPage from './pages/BookingsPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';

// Inspection Pages
import InspectionsListPage from './pages/inspections/InspectionsListPage';
import CreateInspectionPage from './pages/inspections/CreateInspectionWorkflow';
import ViewInspectionPage from './pages/inspections/ViewInspectionPage';
import AddPartsPage from './pages/inspections/AddPartsPage';
import PublicReportPage from './pages/PublicReportPage';
import PublicInspectionReport from './pages/PublicInspectionReport';

// Car Pages
import CreateCarPage from './pages/cars/CreateCarPage';
import EditCarPage from './pages/cars/EditCarPage';

// Booking Pages
import CreateBookingPage from './pages/bookings/CreateBookingPage';

// Admin Pages
import BrandsPage from './pages/admin/BrandsPage';
import ModelsPage from './pages/admin/ModelsPage';
import EditInspectionPage from './pages/admin/EditInspectionPage';
import InspectorsPage from './pages/admin/InspectorsPage';

const App = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/report/:shareableLink" element={<PublicReportPage />} />
      <Route path="/inspection/:shareableLink" element={<PublicInspectionReport />} />
      <Route path="/public/inspection/:shareableLink" element={<PublicInspectionReport />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Cars */}
          <Route path="/cars" element={<CarsPage />} />
          <Route path="/cars/new" element={<CreateCarPage />} />
          <Route path="/cars/:id/edit" element={<EditCarPage />} />
          
          {/* Bookings */}
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/bookings/new" element={<CreateBookingPage />} />
          
          {/* Inspections */}
          <Route path="/inspections" element={<InspectionsListPage />} />
          <Route path="/inspections/create" element={<CreateInspectionPage />} />
          <Route path="/inspections/:id" element={<ViewInspectionPage />} />
          <Route path="/inspections/:inspectionId/add-parts" element={<AddPartsPage />} />
          
          {/* Admin Routes */}
          <Route path="/users" element={<UsersPage />} />
          <Route path="/admin/inspectors" element={<InspectorsPage />} />
          <Route path="/admin/brands" element={<BrandsPage />} />
          <Route path="/admin/brands/:brandId/models" element={<ModelsPage />} />
          <Route path="/admin/inspections/:id/edit" element={<EditInspectionPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;