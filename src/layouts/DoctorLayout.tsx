import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DoctorSidebar from '../components/DoctorSidebar';
import DoctorHeader from '../components/DoctorHeader';

const DoctorLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (): string => {
    const path = location.pathname;
    switch (path) {
      case '/doctor/dashboard':
        return 'डॉक्टर डैशबोर्ड';
      case '/doctor/new-camp':
        return 'नया शिविर';
      case '/doctor/patients':
        return 'मरीज़ प्रबंधन';
      case '/doctor/health-records':
        return 'स्वास्थ्य रिकॉर्ड';
      case '/doctor/profile':
        return 'प्रोफाइल';
      default:
        return 'डॉक्टर पोर्टल';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <DoctorSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <DoctorHeader
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

export default DoctorLayout;
