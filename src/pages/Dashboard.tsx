import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, MapPin, Calendar, Activity, Stethoscope, RefreshCw } from 'lucide-react';
import { dashboardAPI } from '../services/api';

interface KPIData {
  totalCamps: number;
  totalUsers: number;
  totalDoctors: number;
  monthlyBeneficiaries: number;
}

interface ChartDataPoint {
  महीना: string;
  शिविर: number;
  लाभार्थी: number;
}

interface ActivityLog {
  id: number;
  action: string;
  details: string;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState<KPIData>({
    totalCamps: 0,
    totalUsers: 0,
    totalDoctors: 0,
    monthlyBeneficiaries: 0
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Use the optimized single API call to get all dashboard data
      const response = await dashboardAPI.getAllDashboardData();
      
      if (response.success) {
        // Update KPI data
        setKpiData({
          totalCamps: response.data.kpi.totalCamps,
          totalUsers: response.data.kpi.totalPatients,
          totalDoctors: response.data.kpi.totalDoctors,
          monthlyBeneficiaries: response.data.kpi.monthlyBeneficiaries
        });

        // Update chart data
        setChartData(response.data.chartData);

        // Update activity logs
        setActivityLogs(response.data.activities);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to individual API calls if the combined endpoint fails
      try {
        const [
          campsResponse,
          patientsResponse,
          doctorsResponse,
          beneficiariesResponse,
          activitiesResponse,
          chartResponse
        ] = await Promise.all([
          dashboardAPI.getTotalCamps(),
          dashboardAPI.getTotalPatients(),
          dashboardAPI.getTotalDoctors(),
          dashboardAPI.getMonthlyBeneficiaries(),
          dashboardAPI.getRecentActivities(),
          dashboardAPI.getDashboardChartData()
        ]);

        // Update KPI data
        setKpiData({
          totalCamps: campsResponse.success ? campsResponse.data.count : 0,
          totalUsers: patientsResponse.success ? patientsResponse.data.count : 0,
          totalDoctors: doctorsResponse.success ? doctorsResponse.data.count : 0,
          monthlyBeneficiaries: beneficiariesResponse.success ? beneficiariesResponse.data.count : 0
        });

        // Update chart data
        if (chartResponse.success) {
          setChartData(chartResponse.data);
        }

        // Update activity logs
        if (activitiesResponse.success) {
          setActivityLogs(activitiesResponse.data);
        }
      } catch (fallbackError) {
        console.error('Fallback API calls also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const kpiCards = [
    {
      title: 'कुल शिविर',
      value: kpiData.totalCamps,
      icon: MapPin,
      color: 'bg-blue-500',
      // change: '0%',
      changeType: 'neutral' as const,
    },
    {
      title: 'कुल मरीज़',
      value: kpiData.totalUsers,
      icon: Users,
      color: 'bg-green-500',
      // change: '0%',
      changeType: 'neutral' as const,
    },
    {
      title: 'कुल डॉक्टर',
      value: kpiData.totalDoctors,
      icon: Stethoscope,
      color: 'bg-purple-500',
      // change: '0%',
      changeType: 'neutral' as const,
    },
    {
      title: 'मासिक लाभार्थी',
      value: kpiData.monthlyBeneficiaries,
      icon: TrendingUp,
      color: 'bg-orange-500',
      // change: '0%',
      changeType: 'neutral' as const,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">स्वागत है!</h1>
            <p className="text-blue-100">
              आज आपके स्वास्थ्य शिविरों में क्या हो रहा है, देखिए।
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>रीफ्रेश करें</span>
            </button>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-200" />
              <span className="text-blue-100">
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
        {kpiCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div key={index} className="card border border-gray-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  {/* <div className="flex items-center mt-2">
                    <span
                      className={`text-sm font-medium text-gray-600`}
                    >
                      {card.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">पिछले महीने से</span>
                  </div> */}
                </div>
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 card border border-gray-400">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              शिविर बनाम लाभार्थी (पिछले 6 महीने)
            </h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-700 rounded-full mr-2"></div>
                <span className="text-gray-600">शिविर</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-700 rounded-full mr-2"></div>
                <span className="text-gray-600">लाभार्थी</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="महीना" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  label={{ value: 'संख्या', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="शिविर"
                  stroke="#1d4ed8"
                  strokeWidth={3}
                  dot={{ fill: '#1d4ed8', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#1d4ed8', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="लाभार्थी"
                  stroke="#047857"
                  strokeWidth={3}
                  dot={{ fill: '#047857', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#047857', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card border border-gray-400">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">हाल की गतिविधि</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {(showAllActivities ? activityLogs : activityLogs.slice(0, 5)).map((log: ActivityLog) => (
              <div key={log.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{log.action}</p>
                  <p className="text-sm text-gray-600">{log.details}</p>
                  <p className="text-xs text-gray-500 mt-1">{log.timestamp}</p>
                </div>
              </div>
            ))}
            {activityLogs.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">कोई हाल की गतिविधि नहीं मिली</p>
              </div>
            )}
          </div>
          {/* <div className="mt-4 pt-4 border-t border-gray-200">
            <button 
              onClick={() => {
                if (showAllActivities) {
                  setShowAllActivities(false);
                } else {
                  navigate('/admin/activities');
                }
              }}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {showAllActivities ? 'कम गतिविधि दिखाएं' : 'सभी गतिविधि देखें'} →
            </button>
          </div> */}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card border border-gray-400">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">त्वरित कार्य</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/admin/camps')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200"
          >
            <div className="text-center">
              <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">नया शिविर तय करें</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/admin/doctors')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200"
          >
            <div className="text-center">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">नया डॉक्टर जोड़ें</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
