import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  Users,
  Heart,
  FileText,
  UserPlus,
  Stethoscope,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ActivityItem {
  id: string;
  type: 'checkup' | 'registration' | 'followup' | 'family' | 'prescription' | 'camp' | 'record';
  patient: string;
  action: string;
  time: string;
  date: string;
  details: string;
  camp?: string;
  status: 'completed' | 'pending' | 'scheduled';
  priority: 'high' | 'medium' | 'low';
}

const DoctorActivities: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);

  // Show modal when component mounts
  useEffect(() => {
    setShowComingSoonModal(true);
  }, []);

  // Empty activities data - Connect to your backend
  const allActivities: ActivityItem[] = [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'checkup': return Heart;
      case 'registration': return UserPlus;
      case 'followup': return Calendar;
      case 'family': return Users;
      case 'prescription': return Stethoscope;
      case 'camp': return Activity;
      case 'record': return FileText;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'checkup': return 'bg-blue-500';
      case 'registration': return 'bg-green-500';
      case 'followup': return 'bg-orange-500';
      case 'family': return 'bg-purple-500';
      case 'prescription': return 'bg-red-500';
      case 'camp': return 'bg-indigo-500';
      case 'record': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredActivities = allActivities.filter(activity => {
    const matchesSearch = activity.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || activity.type === selectedFilter;
    
    const matchesDate = !selectedDate || activity.date === selectedDate;
    
    return matchesSearch && matchesFilter && matchesDate;
  });

  const filterOptions = [
    { value: 'all', label: 'सभी गतिविधि', count: allActivities.length },
    { value: 'checkup', label: 'स्वास्थ्य जांच', count: allActivities.filter(a => a.type === 'checkup').length },
    { value: 'registration', label: 'पंजीकरण', count: allActivities.filter(a => a.type === 'registration').length },
    { value: 'followup', label: 'फॉलो-अप', count: allActivities.filter(a => a.type === 'followup').length },
    { value: 'family', label: 'पारिवारिक जांच', count: allActivities.filter(a => a.type === 'family').length },
    { value: 'prescription', label: 'दवाई निर्धारण', count: allActivities.filter(a => a.type === 'prescription').length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/doctor/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">सभी गतिविधियां</h1>
            <p className="text-gray-600">डॉक्टर की दैनिक गतिविधियों का विस्तृत विवरण</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="h-8 w-8 text-green-600" />
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card border border-gray-400">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="मरीज़ का नाम या गतिविधि खोजें..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Date Filter */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            {(searchTerm || selectedFilter !== 'all' || selectedDate) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedFilter('all');
                  setSelectedDate('');
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                साफ़ करें
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-6 border-t border-gray-200 pt-4">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedFilter(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  selectedFilter === option.value
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="card border border-gray-400">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            गतिविधि सूची ({filteredActivities.length})
          </h3>
          <Filter className="h-5 w-5 text-gray-400" />
        </div>

        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">कोई गतिविधि नहीं मिली</h3>
            <p className="text-gray-600">अपने खोज मापदंड बदलने की कोशिश करें</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity) => {
              const IconComponent = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start space-x-4">
                    {/* Activity Icon */}
                    <div className={`flex-shrink-0 p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>

                    {/* Activity Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {activity.action}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(activity.priority)}`}>
                            {activity.priority === 'high' ? 'उच्च' : 
                             activity.priority === 'medium' ? 'मध्यम' : 'कम'} प्राथमिकता
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(activity.status)}`}>
                            {activity.status === 'completed' ? 'पूर्ण' :
                             activity.status === 'pending' ? 'लंबित' : 'निर्धारित'}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-2">
                        <span className="font-medium">मरीज़:</span> {activity.patient}
                      </p>
                      
                      <p className="text-gray-600 mb-3">
                        {activity.details}
                      </p>

                      {activity.camp && (
                        <p className="text-sm text-gray-500 mb-2">
                          <span className="font-medium">शिविर स्थान:</span> {activity.camp}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{new Date(activity.date).toLocaleDateString('hi-IN')}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{activity.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card border border-gray-400 text-center">
          <Heart className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-600">
            {allActivities.filter(a => a.type === 'checkup').length}
          </p>
          <p className="text-sm text-gray-600">कुल स्वास्थ्य जांच</p>
        </div>
        
        <div className="card border border-gray-400 text-center">
          <UserPlus className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-600">
            {allActivities.filter(a => a.type === 'registration').length}
          </p>
          <p className="text-sm text-gray-600">नए पंजीकरण</p>
        </div>
        
        <div className="card border border-gray-400 text-center">
          <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-orange-600">
            {allActivities.filter(a => a.type === 'followup').length}
          </p>
          <p className="text-sm text-gray-600">फॉलो-अप विजिट</p>
        </div>
        
        <div className="card border border-gray-400 text-center">
          <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-purple-600">
            {allActivities.filter(a => a.type === 'family').length}
          </p>
          <p className="text-sm text-gray-600">पारिवारिक जांच</p>
        </div>
      </div>

      {/* Coming Soon Modal */}
      {showComingSoonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  जल्द ही सेवा में
                </h3>
                <p className="text-gray-600">
                  यह सुविधा जल्द ही उपलब्ध होगी। कृपया बाद में प्रयास करें।
                </p>
              </div>
              <button
                onClick={() => {
                  setShowComingSoonModal(false);
                  navigate('/doctor-dashboard');
                }}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ठीक है
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorActivities;
