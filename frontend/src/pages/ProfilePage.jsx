import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">Profile Settings</h1>
      <div className="card">
        <div className="card-body">
          <div className="space-y-4">
            <div>
              <label className="label">Name</label>
              <div className="text-secondary-900">{user?.name}</div>
            </div>
            <div>
              <label className="label">Email</label>
              <div className="text-secondary-900">{user?.email}</div>
            </div>
            <div>
              <label className="label">Role</label>
              <div className="text-secondary-900 capitalize">{user?.role}</div>
            </div>
            <div>
              <label className="label">Phone</label>
              <div className="text-secondary-900">{user?.phone || 'Not provided'}</div>
            </div>
            <div>
              <label className="label">Email Verified</label>
              <div className="text-secondary-900">
                {user?.isEmailVerified ? (
                  <span className="status-completed">Verified</span>
                ) : (
                  <span className="status-pending">Not Verified</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;