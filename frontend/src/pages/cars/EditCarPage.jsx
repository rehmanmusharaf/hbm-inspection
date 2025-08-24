import React from 'react';
import { useParams } from 'react-router-dom';

const EditCarPage = () => {
  const { id } = useParams();

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">Edit Car</h1>
      <div className="card">
        <div className="card-body text-center py-12">
          <p className="text-secondary-500">Car editing form for ID: {id}</p>
          <p className="text-secondary-500 mt-2">Form coming soon.</p>
        </div>
      </div>
    </div>
  );
};

export default EditCarPage;