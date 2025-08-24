import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const BookingsPage = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Bookings</h1>
        <Link to="/bookings/new" className="btn-primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          New Booking
        </Link>
      </div>
      
      <div className="card">
        <div className="card-body text-center py-12">
          <p className="text-secondary-500">No bookings scheduled.</p>
          <Link to="/bookings/new" className="btn-primary mt-4 inline-flex">
            <PlusIcon className="h-5 w-5 mr-2" />
            Schedule Your First Inspection
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingsPage;