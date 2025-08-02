import React, { useEffect, useState } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import UnifiedLogin from '../pages/UnifiedLogin';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Camps from '../pages/Camps';
import Doctors from '../pages/Doctors';
import Users from '../pages/Users';
import Schemes from '../pages/Schemes';
import Reports from '../pages/Reports';
import Activities from '../pages/Activities';
import AdminLayout from '../layouts/AdminLayout';
import { isUserAuthenticated } from '../utils/authUtils';

// Doctor Portal imports
import DoctorLogin from '../pages/DoctorLogin';
import DoctorDashboard from '../pages/DoctorDashboard';
// import NewCamp from '../pages/NewCamp';
import PatientsManagement from '../pages/PatientsManagement';
import DoctorActivities from '../pages/DoctorActivities';
import HealthRecords from '../pages/HealthRecords';
import ServiceRecords from '../pages/ServiceRecords';
import DoctorProfile from '../pages/DoctorProfile';
import DoctorLayout from '../layouts/DoctorLayout';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await isUserAuthenticated();
        setIsAuthenticated(auth.isAdmin);
      } catch (error) {
        console.error('Auth check error:', error);
        // Fallback to localStorage
        const fallback = localStorage.getItem('isAuthenticated') === 'true';
        setIsAuthenticated(fallback);
      }
    };
    
    checkAuth();
  }, []);
  
  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Doctor Protected Route Component
const DoctorProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDoctorAuthenticated, setIsDoctorAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await isUserAuthenticated();
        setIsDoctorAuthenticated(auth.isDoctor);
      } catch (error) {
        console.error('Auth check error:', error);
        // Fallback to localStorage
        const fallback = localStorage.getItem('isDoctorAuthenticated') === 'true';
        setIsDoctorAuthenticated(fallback);
      }
    };
    
    checkAuth();
  }, []);
  
  // Show loading while checking authentication
  if (isDoctorAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!isDoctorAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Router Configuration
export const router = createBrowserRouter([
  {
    path: '/',
    element: <UnifiedLogin />,
  },
  {
    path: '/old-login',
    element: <Login />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'camps',
        element: <Camps />,
      },
      {
        path: 'doctors',
        element: <Doctors />,
      },
      {
        path: 'users',
        element: <Users />,
      },
      {
        path: 'schemes',
        element: <Schemes />,
      },
      {
        path: 'reports',
        element: <Reports />,
      },
      {
        path: 'activities',
        element: <Activities />,
      },
    ],
  },
  // Doctor Portal Routes
  {
    path: '/doctor/old-login',
    element: <DoctorLogin />,
  },
  {
    path: '/doctor',
    element: (
      <DoctorProtectedRoute>
        <DoctorLayout />
      </DoctorProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/doctor/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DoctorDashboard />,
      },
      // Placeholder routes - will create these pages next
      {
        path: 'patients',
        element: <PatientsManagement />,
      },
      {
        path: 'service-records',
        element: <ServiceRecords />,
      },
      {
        path: 'health-records',
        element: <HealthRecords />,
      },
      {
        path: 'activities',
        element: <DoctorActivities />,
      },
      {
        path: 'profile',
        element: <DoctorProfile />,
      },
    ],
  },
  // Legacy routes for backward compatibility
  {
    path: '/dashboard',
    element: <Navigate to="/admin/dashboard" replace />,
  },
  {
    path: '/camps',
    element: <Navigate to="/admin/camps" replace />,
  },
  {
    path: '/doctors',
    element: <Navigate to="/admin/doctors" replace />,
  },
  {
    path: '/users',
    element: <Navigate to="/admin/users" replace />,
  },
  {
    path: '/schemes',
    element: <Navigate to="/admin/schemes" replace />,
  },
  {
    path: '/reports',
    element: <Navigate to="/admin/reports" replace />,
  },
  // Catch all route
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;
