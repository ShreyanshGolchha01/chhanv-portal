import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Filter, Search, Activity, Clock, User, MapPin } from 'lucide-react';
import { mockActivityLogs } from '../data/mockData';

const Activities: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Filter activities based on search and type
  const filteredActivities = mockActivityLogs.filter(activity => {
    const matchesSearch = activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || activity.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'camp':
        return <MapPin className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      case 'doctor':
        return <Activity className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'camp':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      case 'doctor':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>वापस डैशबोर्ड पर जाएं</span>
          </button>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>
            {new Date().toLocaleDateString('hi-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Page Title */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-3">
          <Activity className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">सभी गतिविधि</h1>
            <p className="text-blue-100 mt-1">
              आपके स्वास्थ्य शिविरों की संपूर्ण गतिविधि का विवरण
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card border border-gray-400">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="गतिविधि खोजें..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">फिल्टर:</span>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">सभी गतिविधि</option>
              <option value="camp">शिविर संबंधी</option>
              <option value="user">मरीज़ संबंधी</option>
              <option value="doctor">डॉक्टर संबंधी</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="card border border-gray-400">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            गतिविधि का इतिहास ({filteredActivities.length} परिणाम)
          </h3>
        </div>

        <div className="space-y-4">
          {filteredActivities.map((activity, index) => (
            <div
              key={activity.id}
              className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* Timeline dot */}
              <div className="flex flex-col items-center">
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                {index < filteredActivities.length - 1 && (
                  <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      {activity.action}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {activity.details}
                    </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{activity.timestamp}</span>
                        </div>
                        {activity.user && (
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{activity.user}</span>
                          </div>
                        )}
                      </div>
                  </div>
                  
                  {/* Status badge */}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActivityColor(activity.type)}`}>
                    {activity.type === 'camp' ? 'शिविर' : 
                     activity.type === 'user' ? 'मरीज़' : 
                     activity.type === 'doctor' ? 'डॉक्टर' : 'सामान्य'}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredActivities.length === 0 && (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">कोई गतिविधि नहीं मिली</h3>
              <p className="text-gray-600">
                आपके खोज मापदंड के अनुसार कोई गतिविधि नहीं मिली।
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card border border-gray-400 text-center">
          <div className="p-6">
            <div className="text-2xl font-bold text-primary-600 mb-2">
              {mockActivityLogs.filter(a => a.type === 'camp').length}
            </div>
            <div className="text-sm text-gray-600">शिविर संबंधी गतिविधि</div>
          </div>
        </div>
        
        <div className="card border border-gray-400 text-center">
          <div className="p-6">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {mockActivityLogs.filter(a => a.type === 'user').length}
            </div>
            <div className="text-sm text-gray-600">मरीज़ संबंधी गतिविधि</div>
          </div>
        </div>
        
        <div className="card border border-gray-400 text-center">
          <div className="p-6">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {mockActivityLogs.filter(a => a.type === 'doctor').length}
            </div>
            <div className="text-sm text-gray-600">डॉक्टर संबंधी गतिविधि</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activities;
