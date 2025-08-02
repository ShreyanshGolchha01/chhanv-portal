import React, { useState, useEffect } from 'react';
import { Menu, User } from 'lucide-react';
import AsyncStorage from '../utils/AsyncStorage';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

interface UserInfo {
  name: string;
  email: string;
  role: string;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const userInfoStr = await AsyncStorage.getItem('userInfo');
        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr);
          setUserInfo(userInfo);
        }
      } catch (error) {
        console.error('Error getting user info:', error);
      }
    };

    getUserInfo();
  }, []);
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Search bar - hidden on mobile */}
          {/* <div className="hidden md:flex items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="खोजें..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
              />
            </div>
          </div> */}

          {/* Notifications */}
          {/* <button className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button> */}

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-700">
                {userInfo?.name || 'उपयोगकर्ता'}
              </p>
              <p className="text-xs text-gray-500">
                {userInfo?.role === 'Admin' ? 'प्रशासक' : 
                 userInfo?.role === 'doctor' ? 'डॉक्टर' : 'भूमिका'}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
