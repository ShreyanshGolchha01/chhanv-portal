import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MapPin, 
  Stethoscope, 
  Users, 
  // FileText, 
  // BarChart3,
  LogOut,
  Heart
} from 'lucide-react';
import AsyncStorage from '../utils/AsyncStorage';
import { logout } from '../utils/authUtils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'डैशबोर्ड', path: '/admin/dashboard' },
    { icon: MapPin, label: 'शिविर', path: '/admin/camps' },
    { icon: Stethoscope, label: 'डॉक्टर', path: '/admin/doctors' },
    { icon: Users, label: 'मरीज़', path: '/admin/users' },
    // { icon: FileText, label: 'योजनाएं', path: '/admin/schemes' },
    // { icon: BarChart3, label: 'रिपोर्ट', path: '/admin/reports' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback to manual cleanup
      await AsyncStorage.removeItem('isAuthenticated');
      window.location.href = '/';
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-30 h-full w-64 transform bg-white shadow-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary-500" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">छांव</h1>
              <p className="text-xs text-gray-600">स्वास्थ्य शिविर प्रबंधन</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
                onClick={() => window.innerWidth < 1024 && onClose()}
              >
                <IconComponent
                  className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200`}
                />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="group flex w-full items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-lg transition-colors duration-200 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
            लॉगआउट
          </button>
        </div>

        {/* Powered By Section - Bottom */}
        <div className="p-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">संचालित</p>
            <p className="text-xs font-semibold text-primary-600">SSIPMT, Raipur</p>
            <p className="text-xs text-gray-400 mt-1">स्वास्थ्य एवं परिवार कल्याण मंत्रालय</p>
            <p className="text-xs text-gray-400">संस्करण 1.4.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
