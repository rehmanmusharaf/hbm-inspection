import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const CarsPage = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Cars</h1>
        <Link to="/cars/new" className="btn-primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Car
        </Link>
      </div>
      
      <div className="card">
        <div className="card-body text-center py-12">
          <p className="text-secondary-500">No cars registered yet.</p>
          <Link to="/cars/new" className="btn-primary mt-4 inline-flex">
            <PlusIcon className="h-5 w-5 mr-2" />
            Register Your First Car
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CarsPage;