import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/admin/dashboard':
        return 'डैशबोर्ड';
      case '/admin/camps':
        return 'स्वास्थ्य शिविर';
      case '/admin/doctors':
        return 'डॉक्टर';
      case '/admin/users':
        return 'मरीज़';
      case '/admin/schemes':
        return 'योजनाएं';
      case '/admin/reports':
        return 'रिपोर्ट';
      case '/admin/activities':
        return 'गतिविधि';
      default:
        return 'प्रबंधन पैनल';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <Header
          title={getPageTitle()}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
