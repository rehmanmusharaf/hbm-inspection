import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  UsersIcon,
  UserIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import HBMLogo from './HBMLogo';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Brands & Models', href: '/admin/brands', icon: TagIcon },
  { name: 'Cars', href: '/cars', icon: TruckIcon },
  { name: 'Inspections', href: '/inspections', icon: ClipboardDocumentListIcon },
  { name: 'Bookings', href: '/bookings', icon: CalendarDaysIcon },
];

const adminNavigation = [
  { name: 'Manage Inspectors', href: '/admin/inspectors', icon: UsersIcon },
  { name: 'All Users', href: '/users', icon: UsersIcon },
];

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <HBMLogo className="h-12" textSize="text-xl" />
      </div>

      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                    : 'text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </div>

        {user?.role === 'admin' && (
          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">
              Administration
            </h3>
            <div className="mt-2 space-y-1">
              {adminNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                        : 'text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900'
                    }`
                  }
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                  : 'text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900'
              }`
            }
          >
            <UserIcon className="mr-3 h-5 w-5 flex-shrink-0" />
            Profile
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;