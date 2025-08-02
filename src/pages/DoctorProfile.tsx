import React, { useState, useEffect } from 'react';
import { 
  User,
  Mail,
  Phone,
  // MapPin,
  // Calendar,
  // Award,
  // BookOpen,
  Clock,
  Edit3,
  Save,
  X,
  Stethoscope,
  GraduationCap,
  Building,
  FileText,
  // Star,
  Activity,
  Users,
  Heart
} from 'lucide-react';
import serverUrl from './Server';
import AsyncStorage from '../utils/AsyncStorage';

interface DoctorProfileData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  professionalInfo: {
    registrationNo: string;
    specialization: string;
    qualification: string;
    experience: string;
    currentHospital: string;
    hospitalType: string;
  };
  statistics: {
    totalPatients: number;
    familiesServed: number;
    campsOrganized: number;
    yearsOfService: number;
  };
}

const DoctorProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Get doctor email from AsyncStorage (set during login)
  const [doctorEmail, setDoctorEmail] = useState<string>('');

useEffect(() => {
  const fetchDoctorEmail = async () => {
    try {
      const storedDoctorInfo = await AsyncStorage.getItem('userInfo');
      if (storedDoctorInfo) {
        const userInfo = JSON.parse(storedDoctorInfo);
        if (userInfo?.email) {
          setDoctorEmail(userInfo.email);
          return;
        }
        else{
          // Fallback to phone number if email is not available
          setDoctorEmail('');
          return;
        }
        
      }
      alert('लॉगिन जानकारी नहीं मिली। कृपया फिर से लॉगिन करें।');
    } catch (error) {
      console.error('AsyncStorage error:', error);
      alert('लॉगिन जानकारी प्राप्त करने में त्रुटि हुई।');
    }
  };

  fetchDoctorEmail();
}, []);

  const [doctorData, setDoctorData] = useState<DoctorProfileData>({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
    professionalInfo: {
      registrationNo: '',
      specialization: '',
      qualification: '',
      experience: '',
      currentHospital: '',
      hospitalType: '',
    },
    statistics: {
      totalPatients: 0,
      familiesServed: 0,
      campsOrganized: 0,
      yearsOfService: 0
    }
  });

  const [tempData, setTempData] = useState<DoctorProfileData>(doctorData);

  // Fetch doctor profile data
  const fetchDoctorProfile = async () => {
    try {
      setLoading(true);
      console.log('Fetching profile for email:', doctorEmail); // Debug log
      
      if (!doctorEmail) {
        console.error('No doctor email available for API call');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${serverUrl}/get_doctor_profile.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: doctorEmail })
      });
      
      const data = await response.json();
      console.log('Profile API response:', data); // Debug log
      
      if (data.success) {
        setDoctorData(data.data);
        setTempData(data.data);
      } else {
        console.error('Error fetching profile:', data.message);
        alert('प्रोफाइल लोड करने में त्रुटि: ' + data.message);
      }
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      alert('प्रोफाइल लोड करने में त्रुटि हुई');
    } finally {
      setLoading(false);
    }
  };

  // Load doctor profile when email is available
  useEffect(() => {
    console.log('useEffect triggered with doctorEmail:', doctorEmail); // Debug log
    if (doctorEmail) {
      fetchDoctorProfile();
    }
  }, [doctorEmail]);

  // Also run on component mount
  useEffect(() => {
    if (doctorEmail) {
      fetchDoctorProfile();
    }
  }, []);

  // Handle save changes
  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${serverUrl}/update_doctor_profile.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: doctorEmail,
          personalInfo: tempData.personalInfo,
          professionalInfo: tempData.professionalInfo
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setDoctorData(tempData);
        setIsEditing(false);
        alert('प्रोफाइल सफलतापूर्वक अपडेट हो गई!');
        // Refresh profile data to get updated statistics
        fetchDoctorProfile();
      } else {
        alert('प्रोफाइल अपडेट करने में त्रुटि: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('प्रोफाइल अपडेट करने में त्रुटि हुई');
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel editing
  const handleCancel = () => {
    setTempData(doctorData);
    setIsEditing(false);
  };

  // Update temp data
  const updatePersonalInfo = (field: keyof DoctorProfileData['personalInfo'], value: string) => {
    setTempData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const updateProfessionalInfo = (field: keyof DoctorProfileData['professionalInfo'], value: string | string[]) => {
    setTempData(prev => ({
      ...prev,
      professionalInfo: {
        ...prev.professionalInfo,
        [field]: value
      }
    }));
  };

  if (loading || !doctorEmail) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-200 rounded-2xl p-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
              <div>
                <div className="h-8 bg-gray-300 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-32 mb-1"></div>
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="card border border-gray-400 animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        <div className="card border border-gray-400 animate-pulse">
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
        {!doctorEmail && (
          <div className="text-center">
            <p className="text-gray-500">लॉगिन जानकारी लोड हो रही है...</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-900 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="h-12 w-12 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{doctorData.personalInfo.name}</h1>
              <p className="text-green-100 text-lg">{doctorData.professionalInfo.specialization}</p>
              <p className="text-green-200 text-sm">रजिस्ट्रेशन नं: {doctorData.professionalInfo.registrationNo}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-white text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors duration-200 flex items-center space-x-2"
                disabled={loading}
              >
                <Edit3 className="h-4 w-4" />
                <span>प्रोफाइल संपादित करें</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-white text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className={`h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
                  <span>{saving ? 'सेव हो रहा है...' : 'सेव करें'}</span>
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  <span>रद्द करें</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card border border-gray-400 bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">कुल मरीज़</p>
              <p className="text-2xl font-bold text-blue-900">{doctorData.statistics.totalPatients.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="card border border-gray-400 bg-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">परिवार सेवित</p>
              <p className="text-2xl font-bold text-purple-900">{doctorData.statistics.familiesServed.toLocaleString()}</p>
            </div>
            <Heart className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="card border border-gray-400 bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">शिविर आयोजित</p>
              <p className="text-2xl font-bold text-green-900">{doctorData.statistics.campsOrganized}</p>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="card border border-gray-400 bg-orange-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 mb-1">अनुभव</p>
              <p className="text-2xl font-bold text-orange-900">{doctorData.professionalInfo.experience}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card border border-gray-400">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('personal')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'personal'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              व्यक्तिगत जानकारी
            </button>
            <button
              onClick={() => setActiveTab('professional')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'professional'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              व्यावसायिक जानकारी
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">व्यक्तिगत जानकारी</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-2" />
                    पूरा नाम
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempData.personalInfo.name}
                      onChange={(e) => updatePersonalInfo('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{doctorData.personalInfo.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-2" />
                    ईमेल
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={tempData.personalInfo.email}
                      onChange={(e) => updatePersonalInfo('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{doctorData.personalInfo.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-2" />
                    फोन नंबर
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={tempData.personalInfo.phone}
                      onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{doctorData.personalInfo.phone}</p>
                  )}
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    जन्म तिथि
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={tempData.personalInfo.dateOfBirth}
                      onChange={(e) => updatePersonalInfo('dateOfBirth', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {new Date(doctorData.personalInfo.dateOfBirth).toLocaleDateString('hi-IN')}
                    </p>
                  )}
                </div> */}

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">लिंग</label>
                  {isEditing ? (
                    <select
                      value={tempData.personalInfo.gender}
                      onChange={(e) => updatePersonalInfo('gender', e.target.value as 'male' | 'female' | '')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">चुनें</option>
                      <option value="male">पुरुष</option>
                      <option value="female">महिला</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {doctorData.personalInfo.gender === 'male' ? 'पुरुष' : 
                       doctorData.personalInfo.gender === 'female' ? 'महिला' : ''}
                    </p>
                  )}
                </div> */}

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">रक्त समूह</label>
                  {isEditing ? (
                    <select
                      value={tempData.personalInfo.bloodGroup}
                      onChange={(e) => updatePersonalInfo('bloodGroup', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">चुनें</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{doctorData.personalInfo.bloodGroup}</p>
                  )}
                </div> */}

                {/* <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    पता
                  </label>
                  {isEditing ? (
                    <textarea
                      value={tempData.personalInfo.address}
                      onChange={(e) => updatePersonalInfo('address', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{doctorData.personalInfo.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-2" />
                    आपातकालीन संपर्क
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={tempData.personalInfo.emergencyContact}
                      onChange={(e) => updatePersonalInfo('emergencyContact', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{doctorData.personalInfo.emergencyContact}</p>
                  )}
                </div> */}
              </div>
            </div>
          )}

          {/* Professional Information Tab */}
          {activeTab === 'professional' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">व्यावसायिक जानकारी</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="h-4 w-4 inline mr-2" />
                    रजिस्ट्रेशन नंबर
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempData.professionalInfo.registrationNo}
                      onChange={(e) => updateProfessionalInfo('registrationNo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{doctorData.professionalInfo.registrationNo}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Stethoscope className="h-4 w-4 inline mr-2" />
                    विशेषज्ञता
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempData.professionalInfo.specialization}
                      onChange={(e) => updateProfessionalInfo('specialization', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{doctorData.professionalInfo.specialization}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <GraduationCap className="h-4 w-4 inline mr-2" />
                    योग्यता
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempData.professionalInfo.qualification}
                      onChange={(e) => updateProfessionalInfo('qualification', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{doctorData.professionalInfo.qualification}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="h-4 w-4 inline mr-2" />
                    अनुभव
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempData.professionalInfo.experience}
                      onChange={(e) => updateProfessionalInfo('experience', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="जैसे: 5 वर्ष"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{doctorData.professionalInfo.experience}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="h-4 w-4 inline mr-2" />
                    अस्पताल का प्रकार
                  </label>
                  {isEditing ? (
                    <select
                      value={tempData.professionalInfo.hospitalType}
                      onChange={(e) => updateProfessionalInfo('hospitalType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">चुनें</option>
                      <option value="सरकारी">सरकारी</option>
                      <option value="निजी">निजी</option>
                      <option value="चैरिटी">चैरिटी</option>
                      <option value="अन्य">अन्य</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{doctorData.professionalInfo.hospitalType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="h-4 w-4 inline mr-2" />
                    वर्तमान अस्पताल
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempData.professionalInfo.currentHospital}
                      onChange={(e) => updateProfessionalInfo('currentHospital', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{doctorData.professionalInfo.currentHospital}</p>
                  )}
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Activity className="h-4 w-4 inline mr-2" />
                    आवंटित शिविर
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempData.professionalInfo.assignedCamps}
                      onChange={(e) => updateProfessionalInfo('assignedCamps', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="शिविर के नाम"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{doctorData.professionalInfo.assignedCamps}</p>
                  )}
                </div> */}

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="h-4 w-4 inline mr-2" />
                    वर्तमान अस्पताल
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempData.professionalInfo.currentHospital}
                      onChange={(e) => updateProfessionalInfo('currentHospital', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{doctorData.professionalInfo.currentHospital}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">विभाग</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempData.professionalInfo.department}
                      onChange={(e) => updateProfessionalInfo('department', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{doctorData.professionalInfo.department}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    ज्वाइनिंग तारीख
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={tempData.professionalInfo.joiningDate}
                      onChange={(e) => updateProfessionalInfo('joiningDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {new Date(doctorData.professionalInfo.joiningDate).toLocaleDateString('hi-IN')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BookOpen className="h-4 w-4 inline mr-2" />
                    भाषाएं
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempData.professionalInfo.languages.join(', ')}
                      onChange={(e) => updateProfessionalInfo('languages', e.target.value.split(', '))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="कॉमा से अलग करें"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {doctorData.professionalInfo.languages.join(', ')}
                    </p>
                  )}
                </div> */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;