import React, { useState } from 'react';
import { Menu, User, LogOut } from 'lucide-react';
import { logout, getUserInfo } from '../utils/authUtils';

interface DoctorHeaderProps {
  title: string;
  onMenuClick: () => void;
}

const DoctorHeader: React.FC<DoctorHeaderProps> = ({ title, onMenuClick }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [doctorInfo] = useState(() => {
    // Try to get user info from cookies/localStorage
    getUserInfo().then(info => {
      if (info) {
        return info;
      }
    }).catch(console.error);
    
    // Fallback to localStorage for backward compatibility
    const stored = localStorage.getItem('doctorInfo');
    return stored ? JSON.parse(stored) : {
      name: '',
      specialization: ''
    };
  });

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback to manual cleanup
      localStorage.removeItem('isDoctorAuthenticated');
      localStorage.removeItem('doctorInfo');
      window.location.href = '/';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Page title */}
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500">छांव स्वास्थ्य शिविर प्रबंधन</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          {/* <div className="hidden md:block relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="मरीज़ खोजें..."
              className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div> */}

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{doctorInfo.name}</p>
                  <p className="text-xs text-gray-500">{doctorInfo.specialization}</p>
                </div>
              </div>
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <a
                    href="/doctor/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="mr-3 h-4 w-4" />
                    प्रोफाइल देखें
                  </a>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    लॉगआउट
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DoctorHeader;
