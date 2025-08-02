import React, { useState, useEffect } from 'react';
import { 
  Search,
  Calendar,
  FileText,
  User,
  Phone,
  Download,
  Eye,
  Plus,
  Trash2,
  Save,
  X,
  UserCheck,
  Users,
  Building
} from 'lucide-react';
import { serviceRecordsAPI, handleAPIError } from '../services/api';

interface ServiceRecord {
  id: string;
  patientName: string;
  patientId: string;
  age: number;
  gender: 'male' | 'female';
  phone: string;
  address: string;
  camp: string;
  visitDate: string;
  services: ServiceItem[];
  createdAt: string;
  doctorName: string;
}

interface ServiceItem {
  id: string;
  serviceName: string;
  serviceDetails: string;
}

const ServiceRecords: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<ServiceRecord | null>(null);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State for patient search (same as HealthRecords)
  const [isEmployeeRelative, setIsEmployeeRelative] = useState<'employee' | 'relative' | 'outsider' | ''>('');
  const [searchPhone, setSearchPhone] = useState('');
  const [foundRelatives, setFoundRelatives] = useState<any[]>([]);
  const [selectedRelativeId, setSelectedRelativeId] = useState('');
  const [showRelativeDropdown, setShowRelativeDropdown] = useState(false);
  const [patientSearchLoading, setPatientSearchLoading] = useState(false);
  
  // State for camp search
  const [showCampDropdown, setShowCampDropdown] = useState(false);
  const [foundCamps, setFoundCamps] = useState<any[]>([]);
  const [campSearchValue, setCampSearchValue] = useState('');
  const [campSearchLoading, setCampSearchLoading] = useState(false);

  // State for services
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [currentService, setCurrentService] = useState({ serviceName: '', serviceDetails: '' });

  // Form state for new record
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    gender: 'male' as 'male' | 'female',
    phone: '',
    address: '',
    camp: '',
    visitDate: '',
  });

  // Load service records from API
  useEffect(() => {
    loadServiceRecords();
  }, [searchTerm]);

  // Function to load service records from API
  const loadServiceRecords = async () => {
    setLoading(true);
    try {
      const result = await serviceRecordsAPI.getServiceRecords({
        searchTerm,
        limit: 50,
        offset: 0
      });

      if (result.success) {
        // Transform API data to match component interface
        const transformedRecords = result.data.records.map((record: any) => {
          // Handle multiple services from JSON data
          const services = [];
          if (record.service_types && record.service_details) {
            for (let i = 0; i < record.service_types.length; i++) {
              services.push({
                id: `${record.id}-${i}`,
                serviceName: record.service_types[i] || '',
                serviceDetails: record.service_details[i] || ''
              });
            }
          }

          return {
            id: record.id.toString(),
            patientName: record.patient_name,
            patientId: record.patient_type === 'employee' ? `EMP-${record.id}` : 
                      record.patient_type === 'relative' ? `REL-${record.id}` : 
                      `OUT-${record.id}`,
            age: record.patient_age || 0,
            gender: record.patient_gender || 'male',
            phone: record.patient_phone || '',
            address: '',
            camp: 'Service Camp', // This can be enhanced later
            visitDate: new Date().toISOString().split('T')[0],
            services: services,
            createdAt: new Date().toISOString(),
            doctorName: 'डॉक्टर'
          };
        });

        setServiceRecords(transformedRecords);
      } else {
        console.error('Failed to load service records:', result.message);
        alert(result.message || 'सेवा रिकॉर्ड लोड करने में त्रुटि हुई');
      }
    } catch (error) {
      console.error('Error loading service records:', error);
      alert('सेवा रिकॉर्ड लोड करने में त्रुटि हुई');
    } finally {
      setLoading(false);
    }
  };

  // Filter records is now handled by API with search term
  const filteredRecords = serviceRecords;

  // Function to handle patient search
  const handlePatientSearch = async () => {
    if (!searchPhone.trim()) {
      alert('कृपया फोन नंबर दर्ज करें');
      return;
    }

    if (!/^\d{10}$/.test(searchPhone.trim())) {
      alert('कृपया 10 अंकों का वैध फोन नंबर दर्ज करें');
      return;
    }

    if (!isEmployeeRelative) {
      alert('कृपया मरीज़ का प्रकार चुनें');
      return;
    }

    setPatientSearchLoading(true);
    try {
      const result = await serviceRecordsAPI.searchPatient(searchPhone.trim(), isEmployeeRelative);

      if (result.success) {
        if (isEmployeeRelative === 'employee') {
          const employeeData = result.data;
          localStorage.setItem('searchedPatient', JSON.stringify(employeeData));
          setFormData(prev => ({
            ...prev,
            patientName: employeeData.name,
            age: employeeData.age.toString(),
            gender: employeeData.gender,
            phone: employeeData.phone,
            address: employeeData.address || ''
          }));
        } else if (isEmployeeRelative === 'relative') {
          localStorage.setItem('searchedPatient', JSON.stringify(result.data));
          setFoundRelatives(result.data.relatives || []);
          setShowRelativeDropdown(result.data.relatives && result.data.relatives.length > 0);
          
          if (result.data.relatives && result.data.relatives.length > 0) {
            alert(`${result.data.relatives.length} रिश्तेदार मिले। कृपया नीचे से एक चुनें।`);
          }
        } else if (isEmployeeRelative === 'outsider') {
          const outsiderData = result.data;
          localStorage.setItem('searchedPatient', JSON.stringify(outsiderData));
          setFormData(prev => ({
            ...prev,
            patientName: outsiderData.name,
            age: outsiderData.age.toString(),
            gender: outsiderData.gender,
            phone: outsiderData.phone,
            address: ''
          }));
        }
      } else {
        alert(result.message || 'मरीज़ खोजते समय त्रुटि हुई');
      }
    } catch (error) {
      console.error('Patient search error:', error);
      alert('मरीज़ खोजते समय त्रुटि हुई');
    } finally {
      setPatientSearchLoading(false);
    }
  };

  // Function to handle relative selection
  const handleRelativeSelection = (relativeId: string) => {
    const selectedRelative = foundRelatives.find(rel => rel.id.toString() === relativeId.toString());
    if (selectedRelative) {
      localStorage.setItem('searchedRelative', JSON.stringify(selectedRelative));
      setFormData(prev => ({
        ...prev,
        patientName: selectedRelative.name,
        age: selectedRelative.age ? selectedRelative.age.toString() : '',
        gender: selectedRelative.gender,
        phone: selectedRelative.phone,
        address: ''
      }));
      setSelectedRelativeId(relativeId);
      setShowRelativeDropdown(false);
      alert(`रिश्तेदार चुना गया: ${selectedRelative.name} (${selectedRelative.relation})`);
    }
  };

  // Function to search for camps
  const handleCampSearch = async () => {
    setCampSearchLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const doctorInfo = JSON.parse(localStorage.getItem('doctorInfo') || '{}');
      
      const userId = userInfo.id || userData.id || doctorInfo.id || '1';
      
      const result = await serviceRecordsAPI.getUserCamps(userId);

      if (result.success) {
        setFoundCamps(result.data.camps || []);
        setShowCampDropdown(result.data.camps && result.data.camps.length > 0);
      } else {
        alert(result.message || 'कैंप खोजते समय त्रुटि हुई');
      }
    } catch (error) {
      console.error('Camp search error:', error);
      alert('कैंप खोजते समय त्रुटि हुई');
    } finally {
      setCampSearchLoading(false);
    }
  };

  // Function to handle camp selection
  const handleCampSelection = (camp: any) => {
    setFormData(prev => ({
      ...prev,
      camp: camp.name,
      visitDate: camp.date
    }));
    setCampSearchValue(camp.name);
    setShowCampDropdown(false);
  };

  // Function to add service
  const addService = () => {
    if (!currentService.serviceName.trim() || !currentService.serviceDetails.trim()) {
      alert('कृपया सेवा का नाम और विवरण दोनों भरें');
      return;
    }

    const newService: ServiceItem = {
      id: Date.now().toString(),
      serviceName: currentService.serviceName.trim(),
      serviceDetails: currentService.serviceDetails.trim()
    };

    setServices(prev => [...prev, newService]);
    setCurrentService({ serviceName: '', serviceDetails: '' });
  };

  // Function to remove service
  const removeService = (serviceId: string) => {
    setServices(prev => prev.filter(service => service.id !== serviceId));
  };

  // Function to reset form
  const resetForm = () => {
    setFormData({
      patientName: '',
      age: '',
      gender: 'male',
      phone: '',
      address: '',
      camp: '',
      visitDate: '',
    });
    setServices([]);
    setCurrentService({ serviceName: '', serviceDetails: '' });
    setIsEmployeeRelative('');
    setSearchPhone('');
    setFoundRelatives([]);
    setSelectedRelativeId('');
    setShowRelativeDropdown(false);
    setShowCampDropdown(false);
    setFoundCamps([]);
    setCampSearchValue('');
  };

  // Function to save service record
  const handleSaveRecord = async () => {
    // Validation
    if (!formData.patientName || !formData.age || !formData.phone) {
      alert('कृपया मरीज़ की सभी आवश्यक जानकारी भरें');
      return;
    }

    if (!formData.camp || !formData.visitDate) {
      alert('कृपया कैंप की जानकारी भरें');
      return;
    }

    if (services.length === 0) {
      alert('कृपया कम से कम एक सेवा जोड़ें');
      return;
    }

    setLoading(true);
    try {
      // Determine patient type and IDs
      let patientType = isEmployeeRelative;
      let patientId = null;
      let relativeId = null;

      // Get patient ID based on type
      if (patientType === 'employee') {
        const userData = JSON.parse(localStorage.getItem('searchedPatient') || '{}');
        patientId = userData.id;
      } else if (patientType === 'relative') {
        const relativeData = JSON.parse(localStorage.getItem('searchedRelative') || '{}');
        relativeId = relativeData.id;
      } else if (patientType === 'outsider') {
        const userData = JSON.parse(localStorage.getItem('searchedPatient') || '{}');
        patientId = userData.id;
      }

      // Prepare services array for API
      const servicesForAPI = services.map(service => ({
        type: service.serviceName,
        detail: service.serviceDetails
      }));

      // Prepare record data for API
      const recordData = {
        patientType,
        patientId,
        relativeId,
        services: servicesForAPI
      };

      const result = await serviceRecordsAPI.addServiceRecord(recordData);

      if (result.success) {
        alert('सेवा रिकॉर्ड सफलतापूर्वक सेव हो गया');
        setShowAddRecord(false);
        resetForm();
        // Reload the records to show the new one
        loadServiceRecords();
      } else {
        alert(result.message || 'सेवा रिकॉर्ड सेव करने में त्रुटि हुई');
      }
    } catch (error) {
      console.error('Add service record error:', error);
      alert('सेवा रिकॉर्ड सेव करने में त्रुटि हुई');
    } finally {
      setLoading(false);
    }
  };

  // Function to export records
  const handleExportRecords = () => {
    try {
      if (filteredRecords.length === 0) {
        alert('एक्सपोर्ट करने के लिए कोई रिकॉर्ड नहीं मिला');
        return;
      }

      let csvContent = 'मरीज़ का नाम,आयु,लिंग,फोन,पता,कैंप,दिनांक,सेवाएं,विवरण\n';
      
      filteredRecords.forEach(record => {
        const servicesText = record.services.map(s => s.serviceName).join('; ');
        const detailsText = record.services.map(s => s.serviceDetails).join('; ');
        
        const row = [
          record.patientName,
          record.age,
          record.gender === 'male' ? 'पुरुष' : 'महिला',
          record.phone,
          record.address,
          record.camp,
          new Date(record.visitDate).toLocaleDateString('hi-IN'),
          servicesText,
          detailsText
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
        
        csvContent += row + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `सेवा_रिकॉर्ड_एक्सपोर्ट_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert(`${filteredRecords.length} सेवा रिकॉर्ड सफलतापूर्वक एक्सपोर्ट हो गए`);
    } catch (error) {
      console.error('Export error:', error);
      alert('रिकॉर्ड एक्सपोर्ट करने में त्रुटि हुई');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-900 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">सेवा रिकॉर्ड प्रबंधन</h1>
            <p className="text-green-100">
              शिविर में उपलब्ध अन्य सेवाओं का रिकॉर्ड
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAddRecord(true)}
              className="bg-white text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors duration-200 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>नया रिकॉर्ड</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card border border-gray-400 bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">कुल सेवा रिकॉर्ड</p>
              <p className="text-2xl font-bold text-green-900">{serviceRecords.length}</p>
            </div>
            <FileText className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="card border border-gray-400 bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">आज के रिकॉर्ड</p>
              <p className="text-2xl font-bold text-green-900">
                {serviceRecords.filter(r => 
                  new Date(r.createdAt).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="card border border-gray-400 bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">कुल सेवाएं</p>
              <p className="text-2xl font-bold text-green-900">
                {serviceRecords.reduce((total, record) => total + record.services.length, 0)}
              </p>
            </div>
            <Building className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Search and Export */}
      <div className="card border border-gray-400">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="मरीज़ का नाम, ID, फोन नंबर या सेवा खोजें..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button 
            onClick={handleExportRecords}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>एक्सपोर्ट</span>
          </button>
        </div>
      </div>

      {/* Service Records Table */}
      <div className="card border border-gray-400">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  मरीज़ की जानकारी
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  कैंप विवरण
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  सेवाएं
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  दिनांक
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  कार्य
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    कोई सेवा रिकॉर्ड नहीं मिला
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {record.patientName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.age} वर्ष • {record.gender === 'male' ? 'पुरुष' : 'महिला'}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {record.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.camp}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(record.visitDate).toLocaleDateString('hi-IN')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {record.services.map((service, index) => (
                          <div key={service.id} className="mb-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {service.serviceName}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.createdAt).toLocaleDateString('hi-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Record Modal */}
      {showAddRecord && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">नया सेवा रिकॉर्ड जोड़ें</h3>
              <button
                onClick={() => setShowAddRecord(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6 max-h-96 overflow-y-auto">
              {/* Patient Search Section */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-green-900 mb-3">मरीज़ की जानकारी</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      मरीज़ का प्रकार *
                    </label>
                    <select
                      value={isEmployeeRelative}
                      onChange={(e) => setIsEmployeeRelative(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">चुनें</option>
                      <option value="employee">कर्मचारी</option>
                      <option value="relative">रिश्तेदार</option>
                      <option value="outsider">बाहरी व्यक्ति</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      फोन नंबर *
                    </label>
                    <input
                      type="tel"
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                      placeholder="10 अंकों का फोन नंबर"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      onClick={handlePatientSearch}
                      disabled={patientSearchLoading}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {patientSearchLoading ? 'खोज रहे हैं...' : 'खोजें'}
                    </button>
                  </div>
                </div>

                {/* Relative Dropdown */}
                {showRelativeDropdown && foundRelatives.length > 0 && (
                  <div className="relative-dropdown-container mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      रिश्तेदार चुनें
                    </label>
                    <div className="border border-gray-300 rounded-md bg-white max-h-32 overflow-y-auto">
                      {foundRelatives.map((relative) => (
                        <div
                          key={relative.id}
                          onClick={() => handleRelativeSelection(relative.id)}
                          className="px-3 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium">{relative.name}</div>
                          <div className="text-sm text-gray-500">{relative.relation} • {relative.age} वर्ष</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Patient Details Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">नाम *</label>
                    <input
                      type="text"
                      value={formData.patientName}
                      onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">आयु *</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">लिंग</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="male">पुरुष</option>
                      <option value="female">महिला</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">फोन</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">पता</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Camp Search Section */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-green-900 mb-3">कैंप की जानकारी</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="camp-dropdown-container">
                    <label className="block text-sm font-medium text-gray-700 mb-1">कैंप *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={campSearchValue || formData.camp}
                        onChange={(e) => setCampSearchValue(e.target.value)}
                        placeholder="कैंप खोजने के लिए क्लिक करें"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 cursor-pointer"
                        onClick={handleCampSearch}
                        readOnly
                      />
                      {showCampDropdown && foundCamps.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                          {foundCamps.map((camp) => (
                            <div
                              key={camp.id}
                              onClick={() => handleCampSelection(camp)}
                              className="px-3 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium">{camp.name}</div>
                              <div className="text-sm text-gray-500">{camp.location} • {camp.date}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">दिनांक *</label>
                    <input
                      type="date"
                      value={formData.visitDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, visitDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Services Section */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-green-900 mb-3">सेवाएं</h4>
                
                {/* Add Service */}
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">सेवा का नाम *</label>
                    <input
                      type="text"
                      value={currentService.serviceName}
                      onChange={(e) => setCurrentService(prev => ({ ...prev, serviceName: e.target.value }))}
                      placeholder="जैसे: आयुष्मान कार्ड पंजीकरण, बैंक खाता समस्या आदि"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">सेवा का विवरण *</label>
                    <textarea
                      value={currentService.serviceDetails}
                      onChange={(e) => setCurrentService(prev => ({ ...prev, serviceDetails: e.target.value }))}
                      placeholder="सेवा के बारे में विस्तार से लिखें..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <button
                    onClick={addService}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>सेवा जोड़ें</span>
                  </button>
                </div>

                {/* Services List */}
                {services.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">जोड़ी गई सेवाएं:</h5>
                    {services.map((service) => (
                      <div key={service.id} className="bg-white p-3 rounded-md border border-green-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h6 className="font-medium text-gray-900">{service.serviceName}</h6>
                            <p className="text-sm text-gray-600 mt-1">{service.serviceDetails}</p>
                          </div>
                          <button
                            onClick={() => removeService(service.id)}
                            className="text-red-600 hover:text-red-800 ml-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowAddRecord(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                रद्द करें
              </button>
              <button
                onClick={handleSaveRecord}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'सेव हो रहा है...' : 'सेव करें'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Record Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">सेवा रिकॉर्ड विवरण</h3>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Patient Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 mb-2">मरीज़ की जानकारी</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">नाम:</span> {selectedRecord.patientName}</div>
                  <div><span className="font-medium">आयु:</span> {selectedRecord.age} वर्ष</div>
                  <div><span className="font-medium">लिंग:</span> {selectedRecord.gender === 'male' ? 'पुरुष' : 'महिला'}</div>
                  <div><span className="font-medium">फोन:</span> {selectedRecord.phone}</div>
                  <div className="col-span-2"><span className="font-medium">पता:</span> {selectedRecord.address}</div>
                </div>
              </div>

              {/* Camp Info */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 mb-2">कैंप विवरण</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">कैंप:</span> {selectedRecord.camp}</div>
                  <div><span className="font-medium">दिनांक:</span> {new Date(selectedRecord.visitDate).toLocaleDateString('hi-IN')}</div>
                </div>
              </div>

              {/* Services */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 mb-2">प्रदान की गई सेवाएं</h4>
                <div className="space-y-3">
                  {selectedRecord.services.map((service, index) => (
                    <div key={service.id} className="bg-white p-3 rounded-md border border-green-200">
                      <h5 className="font-medium text-gray-900">{index + 1}. {service.serviceName}</h5>
                      <p className="text-sm text-gray-600 mt-1">{service.serviceDetails}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Record Info */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 mb-2">रिकॉर्ड जानकारी</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">डॉक्टर:</span> {selectedRecord.doctorName}</div>
                  <div><span className="font-medium">रिकॉर्ड दिनांक:</span> {new Date(selectedRecord.createdAt).toLocaleString('hi-IN')}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceRecords;
