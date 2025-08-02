import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin,
  Users, 
  Heart, 
  Calendar, 
  UserPlus,
  RefreshCw
} from 'lucide-react';
import serverUrl from './Server';

const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [doctorInfo] = useState(() => {
    // Clear any existing localStorage data to remove demo content
    localStorage.removeItem('doctorInfo');
    return {
      name: '',
      specialization: '',
      registrationNo: ''
    };
  });

  // Dashboard stats state
  const [todayStats, setTodayStats] = useState({
    totalPatients: 0,
    newPatients: 0,
    followUps: 0,
    activeCamps: 0
  });

  const [loading, setLoading] = useState(true);

  // API functions for dashboard data
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Get total patients count
      const totalPatientsResponse = await fetch(`${serverUrl}/get_total_patients.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const totalPatientsData = await totalPatientsResponse.json();

      // Get today's patients count
      const todayPatientsResponse = await fetch(`${serverUrl}/get_today_patients.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const todayPatientsData = await todayPatientsResponse.json();

      // Get total camps count
      const totalCampsResponse = await fetch(`${serverUrl}/get_total_camps.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const totalCampsData = await totalCampsResponse.json();

      // Get active camps count
      const activeCampsResponse = await fetch(`${serverUrl}/get_active_camps.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const activeCampsData = await activeCampsResponse.json();

      // Update stats
      setTodayStats({
        totalPatients: totalPatientsData.success ? totalPatientsData.data.count : 0,
        newPatients: todayPatientsData.success ? todayPatientsData.data.count : 0,
        followUps: totalCampsData.success ? totalCampsData.data.count : 0,
        activeCamps: activeCampsData.success ? activeCampsData.data.count : 0
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard data on component mount
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // ...existing code...

  const kpiCards = [
    {
      title: 'कुल मरीज़',
      value: todayStats.totalPatients,
      icon: Users,
      color: 'bg-blue-500',
      change: 'सभी रिकॉर्ड',
      changeType: 'neutral' as const,
    },
    {
      title: 'आज के मरीज़',
      value: todayStats.newPatients,
      icon: UserPlus,
      color: 'bg-green-500',
      change: 'आज के रिकॉर्ड',
      changeType: 'neutral' as const,
    },
    {
      title: 'कुल शिविर',
      value: todayStats.followUps,
      icon: Calendar,
      color: 'bg-yellow-500',
      change: 'सभी शिविर',
      changeType: 'neutral' as const,
    },
    {
      title: 'सक्रिय शिविर',
      value: todayStats.activeCamps,
      icon: MapPin,
      color: 'bg-purple-500',
      change: 'चालू शिविर',
      changeType: 'neutral' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-700 to-green-900 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">नमस्कार{doctorInfo.name ? `, ${doctorInfo.name}` : ''}!</h1>
            <p className="text-green-100">
              आज के स्वास्थ्य शिविर में आपका स्वागत है।
            </p>
            {(doctorInfo.specialization || doctorInfo.registrationNo) && (
              <p className="text-green-200 text-sm mt-1">
                {doctorInfo.specialization} {doctorInfo.registrationNo ? `• रजिस्ट्रेशन: ${doctorInfo.registrationNo}` : ''}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchDashboardStats}
              disabled={loading}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>रीफ्रेश</span>
            </button>
            <div className="hidden md:flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-200" />
              <span className="text-green-100">
                {new Date().toLocaleDateString('hi-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="card border border-gray-400">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
          ))
        ) : (
          kpiCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <div key={index} className="card border border-gray-400">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <div className="flex items-center mt-2">
                      <span
                        className={`text-sm font-medium text-gray-600`}
                      >
                        {card.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${card.color}`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Actions */}
      {/* yaha se changes start hue hai */}
      <div className="card border border-gray-400">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">त्वरित कार्य</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/doctor/patients')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors duration-200"
          >
            <div className="text-center">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">मरीज़ प्रबंधन</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/doctor/health-records')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors duration-200"
          >
            <div className="text-center">
              <Heart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">स्वास्थ्य रिकॉर्ड</p>
            </div>
          </button>
        </div>
      </div>
      {/* niche yaha tak hue hai */}

      {/* Main Content Grid */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card border border-gray-400">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">आज की गतिविधि</h3>
          </div>
          <div className="space-y-4">
            {recentActivities.length > 0 ? recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    activity.type === 'checkup' ? 'bg-blue-500' :
                    activity.type === 'registration' ? 'bg-green-500' :
                    activity.type === 'followup' ? 'bg-green-500' : 'bg-purple-500'
                  }`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">मरीज़: {activity.patient}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.details}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <p className="text-gray-500">आज कोई गतिविधि नहीं है</p>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button 
              onClick={() => navigate('/doctor/activities')}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              सभी गतिविधि देखें →
            </button>
          </div>
        </div> */}

        {/* Upcoming Camps */}
        {/* yaha se changes start hue hai */}
        {/* नया शिविर जोड़ें का option हटा दिया गया है */}
        {/* niche yaha tak hue hai */}
      </div>
    // </div>
  );
};

export default DoctorDashboard;
