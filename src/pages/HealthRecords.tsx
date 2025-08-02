import React, { useState, useEffect } from 'react';
import { 
  Search,
  Calendar,
  Heart,
  Activity,
  User,
  Phone,
  FileText,
  Download,
  Eye,
  Plus,
  AlertCircle,
  CheckCircle,
  Stethoscope,
  Thermometer
} from 'lucide-react';
import { healthRecordsAPI } from '../services/api';

interface HealthRecord {
  id: string;
  patientName: string;
  patientId: string;
  age: number;
  gender: 'male' | 'female';
  phone: string;
  address: string;
  camp: string;
  visitDate: string;
  checkupType: 'routine' | 'emergency' | 'screening' | 'other';
  vitals: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    weight: number;
    height: number;
    bmi: number;
    customTests: { [key: string]: string };
  };
  symptoms: string[];
  diagnosis: string;
  medications: string[];
  status: 'healthy' | 'stable' | 'needs-attention' | 'critical' | 'स्वस्थ' | 'स्थिर' | 'ध्यान चाहिए' | 'गंभीर';
  doctorNotes: string;
}

const HealthRecords: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [checkupTypeFilter, setCheckupTypeFilter] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    totalRecords: 0,
    healthyPatients: 0,
    stablePatients: 0,
    needsAttention: 0,
    criticalCases: 0
  });
  
  // State for patient search
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

  // State for dynamic vital signs
  const [selectedVitalTest, setSelectedVitalTest] = useState('');
  const [vitalTestValue, setVitalTestValue] = useState('');
  const [customVitals, setCustomVitals] = useState<{ [key: string]: string }>({});

  // Form state for new record
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    gender: 'male' as 'male' | 'female',
    phone: '',
    address: '',
    camp: '',
    visitDate: '',
    checkupType: 'routine' as 'routine' | 'emergency' | 'screening' | 'other',
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    weight: '',
    height: '',
    symptoms: '',
    diagnosis: '',
    medications: '',
    status: 'stable' as 'healthy' | 'stable' | 'needs-attention' | 'critical',
    doctorNotes: ''
  });

  // Load health records on component mount and when filters change
  useEffect(() => {
    loadHealthRecords();
  }, [searchTerm, statusFilter, checkupTypeFilter]);

  // Debug: Monitor form data changes
  useEffect(() => {
    console.log('Form data changed:', formData);
  }, [formData]);

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.camp-dropdown-container')) {
        setShowCampDropdown(false);
      }
      if (!target.closest('.relative-dropdown-container')) {
        setShowRelativeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to load health records from API
  const loadHealthRecords = async () => {
    setLoading(true);
    try {
      const result = await healthRecordsAPI.getHealthRecords({
        searchTerm,
        statusFilter: statusFilter === 'all' ? undefined : statusFilter,
        checkupTypeFilter: checkupTypeFilter === 'all' ? undefined : checkupTypeFilter,
        limit: 50,
        offset: 0
      });

      if (result.success) {
        setHealthRecords(result.data.records || []);
        setStatistics(result.data.statistics || {
          totalRecords: 0,
          healthyPatients: 0,
          stablePatients: 0,
          needsAttention: 0,
          criticalCases: 0
        });
      } else {
        console.error('Failed to load health records:', result.message);
        alert(result.message || 'स्वास्थ्य रिकॉर्ड लोड करने में त्रुटि हुई');
      }
    } catch (error) {
      console.error('Error loading health records:', error);
      alert('स्वास्थ्य रिकॉर्ड लोड करने में त्रुटि हुई');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Function to search for patient/employee
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
      const result = await healthRecordsAPI.searchPatient(searchPhone.trim(), isEmployeeRelative);

      if (result.success) {
        if (isEmployeeRelative === 'employee') {
          const employeeData = result.data;
          console.log('Employee data received:', employeeData); // Debug log
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
          console.log('Found relatives:', result.data.relatives); // Debug log
          console.log('Employee data:', result.data); // Debug employee data
          setFoundRelatives(result.data.relatives || []);
          setShowRelativeDropdown(result.data.relatives && result.data.relatives.length > 0);
          
          if (result.data.relatives && result.data.relatives.length > 0) {
            console.log('First relative sample:', result.data.relatives[0]); // Debug first relative
            alert(`${result.data.relatives.length} रिश्तेदार मिले। कृपया नीचे से एक चुनें।`);
          }
        } else if (isEmployeeRelative === 'outsider') {
          const outsiderData = result.data;
          console.log('Outsider data received:', outsiderData); // Debug log
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
    console.log('Trying to select relative with ID:', relativeId);
    console.log('Available relatives:', foundRelatives);
    
    // Convert relativeId to number for comparison since backend sends r_id as number
    const selectedRelative = foundRelatives.find(rel => rel.id.toString() === relativeId.toString());
    
    if (selectedRelative) {
      console.log('Selected relative data:', selectedRelative); // Debug log
      localStorage.setItem('searchedRelative', JSON.stringify(selectedRelative));
      
      // Set form data with relative information
      setFormData(prev => {
        const newData = {
          ...prev,
          patientName: selectedRelative.name || '',
          age: selectedRelative.age ? selectedRelative.age.toString() : '',
          gender: selectedRelative.gender || 'male',
          phone: selectedRelative.phone || '',
          address: '' // Relatives don't have address in DB, so keep it empty for manual entry
        };
        console.log('Setting new form data:', newData);
        return newData;
      });
      
      setSelectedRelativeId(relativeId);
      setShowRelativeDropdown(false);
      
      // Show success message
      alert(`रिश्तेदार चुना गया: ${selectedRelative.name} (${selectedRelative.relation})`);
      
    } else {
      console.error('Relative not found with ID:', relativeId);
      alert('रिश्तेदार चुनने में त्रुटि हुई। कृपया दोबारा कोशिश करें।');
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
      
      const result = await healthRecordsAPI.getUserCamps(userId);

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

  // Function to reset patient search
  const resetPatientSearch = () => {
    setIsEmployeeRelative('');
    setSearchPhone('');
    setFoundRelatives([]);
    setSelectedRelativeId('');
    setShowRelativeDropdown(false);
    setShowCampDropdown(false);
    setFoundCamps([]);
    setCampSearchValue('');
    setFormData(prev => ({
      ...prev,
      patientName: '',
      age: '',
      gender: 'male',
      phone: '',
      address: '',
      camp: '',
      visitDate: ''
    }));
  };

  // Function to calculate BMI
  const calculateBMI = (weight: number, height: number): number => {
    const heightInMeters = height / 100;
    return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
  };

  // Available vital sign tests
  const availableVitalTests = [
    { value: 'bloodPressure', label: 'रक्तचाप (Blood Pressure)', unit: 'mmHg' },
    { value: 'heartRate', label: 'हृदय गति (Heart Rate)', unit: 'bpm' },
    { value: 'temperature', label: 'तापमान (Temperature)', unit: '°F' },
    { value: 'weight', label: 'वजन (Weight)', unit: 'kg' },
    { value: 'height', label: 'कद (Height)', unit: 'cm' },
    { value: 'bloodSugar', label: 'रक्त शुगर (Blood Sugar)', unit: 'mg/dL' },
  ];

  // Function to add a vital test
  const addVitalTest = () => {
    if (selectedVitalTest && vitalTestValue.trim()) {
      const testInfo = availableVitalTests.find(test => test.value === selectedVitalTest);
      if (testInfo) {
        setCustomVitals(prev => ({
          ...prev,
          [selectedVitalTest]: `${vitalTestValue.trim()} ${testInfo.unit}`
        }));
        setSelectedVitalTest('');
        setVitalTestValue('');
      }
    }
  };

  // Function to remove a vital test
  const removeVitalTest = (testKey: string) => {
    setCustomVitals(prev => {
      const updated = { ...prev };
      delete updated[testKey];
      return updated;
    });
  };

  // Function to add new health record
  const handleAddRecord = async () => {
    // Validation
    if (!formData.patientName || !formData.age || !formData.phone) {
      alert('कृपया मरीज़ की सभी आवश्यक जानकारी भरें');
      return;
    }

    if (!formData.camp || !formData.visitDate) {
      alert('कृपया कैंप की जानकारी भरें');
      return;
    }

    if (!formData.diagnosis) {
      alert('कृपया निदान भरें');
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
        const employeeData = JSON.parse(localStorage.getItem('searchedPatient') || '{}');
        relativeId = relativeData.id;
        patientId = employeeData.employeeId || employeeData.id;
      } else if (patientType === 'outsider') {
        const userData = JSON.parse(localStorage.getItem('searchedPatient') || '{}');
        patientId = userData.id;
      }

      // Get selected camp info
      const selectedCamp = foundCamps.find(camp => camp.name === formData.camp);
      const campId = selectedCamp?.id || null;

      // Get doctor name from logged in user
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const doctorInfo = JSON.parse(localStorage.getItem('doctorInfo') || '{}');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      console.log('userInfo:', userInfo);
      console.log('doctorInfo:', doctorInfo);
      console.log('userData:', userData);
      
      const doctorName = userInfo.name || doctorInfo.name || userData.name || 
                        userInfo.fullname || doctorInfo.fullname || userData.fullname ||
                        userInfo.full_name || doctorInfo.full_name || userData.full_name ||
                        userInfo.doctor_name || doctorInfo.doctor_name || userData.doctor_name ||
                        'डॉक्टर';

      // Prepare vitals data
      const vitals = {
        bloodPressure: formData.bloodPressure || null,
        heartRate: formData.heartRate ? Number(formData.heartRate) : null,
        temperature: formData.temperature ? Number(formData.temperature) : null,
        weight: formData.weight ? Number(formData.weight) : null,
        height: formData.height ? Number(formData.height) : null,
        bloodSugar: customVitals.bloodSugar ? parseFloat(customVitals.bloodSugar.split(' ')[0]) : null,
        ...customVitals
      };

      // Prepare record data for API
      const recordData = {
        patientType,
        patientId,
        relativeId,
        campId,
        campName: formData.camp,
        campDate: formData.visitDate,
        reportType: formData.checkupType === 'routine' ? 'नियमित' : 
                   formData.checkupType === 'emergency' ? 'आपातकाल' :
                   formData.checkupType === 'screening' ? 'स्क्रीनिंग' : 'अन्य',
        doctorName,
        symptoms: formData.symptoms,
        diagnosis: formData.diagnosis,
        medicines: formData.medications,
        conditions: formData.status === 'healthy' ? 'स्वस्थ' :
                   formData.status === 'stable' ? 'स्थिर' :
                   formData.status === 'needs-attention' ? 'ध्यान चाहिए' : 'गंभीर',
        notes: formData.doctorNotes,
        vitals
      };

      const result = await healthRecordsAPI.addHealthRecord(recordData);

      if (result.success) {
        alert('स्वास्थ्य रिकॉर्ड सफलतापूर्वक सेव हो गया');
        setShowAddRecord(false);
        
        // Reset form and reload records
        resetForm();
        loadHealthRecords();
      } else {
        alert(result.message || 'स्वास्थ्य रिकॉर्ड सेव करने में त्रुटि हुई');
      }
    } catch (error) {
      console.error('Add health record error:', error);
      alert('स्वास्थ्य रिकॉर्ड सेव करने में त्रुटि हुई');
    } finally {
      setLoading(false);
    }
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
      checkupType: 'routine',
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: '',
      symptoms: '',
      diagnosis: '',
      medications: '',
      status: 'stable',
      doctorNotes: ''
    });
    
    // Reset custom vitals and patient search
    setCustomVitals({});
    setSelectedVitalTest('');
    setVitalTestValue('');
    resetPatientSearch();
    localStorage.removeItem('searchedPatient');
    localStorage.removeItem('searchedRelative');
  };

  // Function to download individual health record as PDF
  const handleDownloadRecord = (record: HealthRecord) => {
    try {
      // Create a formatted content for the health record
      const content = `
चिकित्सा रिपोर्ट
========================================

मरीज़ की जानकारी:
नाम: ${record.patientName}
आयु: ${record.age} वर्ष
लिंग: ${record.gender === 'male' ? 'पुरुष' : 'महिला'}
फोन: ${record.phone}
पता: ${record.address}

चिकित्सा जानकारी:
कैंप: ${record.camp}
दिनांक: ${new Date(record.visitDate).toLocaleDateString('hi-IN')}
चेकअप प्रकार: ${record.checkupType}

वाइटल साइन्स:
रक्तचाप: ${record.vitals?.bloodPressure || 'N/A'}
हृदय गति: ${record.vitals?.heartRate || 'N/A'} bpm
तापमान: ${record.vitals?.temperature || 'N/A'} °F
वजन: ${record.vitals?.weight || 'N/A'} kg
कद: ${record.vitals?.height || 'N/A'} cm
BMI: ${record.vitals?.bmi || 'N/A'}

लक्षण: ${record.symptoms?.join(', ') || 'कोई विशेष लक्षण नहीं'}
निदान: ${record.diagnosis}
दवाइयां: ${record.medications?.join(', ') || 'कोई दवाई नहीं'}
स्थिति: ${record.status}
डॉक्टर की टिप्पणी: ${record.doctorNotes}

========================================
रिपोर्ट जेनरेट की गई: ${new Date().toLocaleString('hi-IN')}
`;

      // Create and download the file
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `चिकित्सा_रिपोर्ट_${record.patientName}_${record.visitDate}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Show success message
      alert(`${record.patientName} की चिकित्सा रिपोर्ट डाउनलोड हो गई`);
    } catch (error) {
      console.error('Download error:', error);
      alert('रिपोर्ट डाउनलोड करने में त्रुटि हुई');
    }
  };

  // Function to export all filtered records
  const handleExportRecords = () => {
    try {
      if (healthRecords.length === 0) {
        alert('एक्सपोर्ट करने के लिए कोई रिकॉर्ड नहीं मिला');
        return;
      }

      // Create CSV content
      let csvContent = 'मरीज़ का नाम,आयु,लिंग,फोन,पता,कैंप,दिनांक,चेकअप प्रकार,रक्तचाप,हृदय गति,तापमान,वजन,कद,BMI,लक्षण,निदान,दवाइयां,स्थिति,डॉक्टर की टिप्पणी\n';
      
      healthRecords.forEach(record => {
        const row = [
          record.patientName,
          record.age,
          record.gender === 'male' ? 'पुरुष' : 'महिला',
          record.phone,
          record.address,
          record.camp,
          new Date(record.visitDate).toLocaleDateString('hi-IN'),
          record.checkupType,
          record.vitals?.bloodPressure || '',
          record.vitals?.heartRate || '',
          record.vitals?.temperature || '',
          record.vitals?.weight || '',
          record.vitals?.height || '',
          record.vitals?.bmi || '',
          record.symptoms?.join('; ') || '',
          record.diagnosis,
          record.medications?.join('; ') || '',
          record.status,
          record.doctorNotes
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
        
        csvContent += row + '\n';
      });

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `स्वास्थ्य_रिकॉर्ड_एक्सपोर्ट_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Show success message
      alert(`${healthRecords.length} स्वास्थ्य रिकॉर्ड सफलतापूर्वक एक्सपोर्ट हो गए`);
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
            <h1 className="text-2xl font-bold mb-2">स्वास्थ्य रिकॉर्ड प्रबंधन</h1>
            <p className="text-green-100">
              मरीज़ों की संपूर्ण स्वास्थ्य जानकारी और चिकित्सा इतिहास
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card border border-gray-400 bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">कुल रिकॉर्ड</p>
              <p className="text-2xl font-bold text-blue-900">{statistics.totalRecords}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="card border border-gray-400 bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">स्वस्थ मरीज़</p>
              <p className="text-2xl font-bold text-green-900">{statistics.healthyPatients}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="card border border-gray-400 bg-yellow-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600 mb-1">ध्यान चाहिए</p>
              <p className="text-2xl font-bold text-yellow-900">{statistics.needsAttention}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="card border border-gray-400 bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 mb-1">गंभीर केस</p>
              <p className="text-2xl font-bold text-red-900">{statistics.criticalCases}</p>
            </div>
            <Heart className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card border border-gray-400">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-600">स्वास्थ्य रिकॉर्ड लोड हो रहे हैं...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Search and Filters */}
          <div className="card border border-gray-400">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="मरीज़ का नाम, ID या फोन नंबर खोजें..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">सभी स्थिति</option>
                  <option value="स्वस्थ">स्वस्थ</option>
                  <option value="स्थिर">स्थिर</option>
                  <option value="ध्यान चाहिए">ध्यान चाहिए</option>
                  <option value="गंभीर">गंभीर</option>
                </select>
              </div>
              
              <div>
                <select
                  value={checkupTypeFilter}
                  onChange={(e) => setCheckupTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">सभी चेकअप टाइप</option>
                  <option value="नियमित">नियमित</option>
                  <option value="आपातकाल">आपातकाल</option>
                  <option value="स्क्रीनिंग">स्क्रीनिंग</option>
                  <option value="अन्य">अन्य</option>
                </select>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={handleExportRecords}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>एक्सपोर्ट</span>
                </button>
              </div>
            </div>
          </div>

          {/* Health Records Table */}
          <div className="card border border-gray-400">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      मरीज़ की जानकारी
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      विजिट विवरण
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      महत्वपूर्ण संकेतक
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      निदान
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      स्थिति
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      कार्य
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {healthRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              record.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                            }`}>
                              <User className="h-5 w-5" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{record.patientName}</div>
                            <div className="text-sm text-gray-500">ID: {record.patientId} • आयु: {record.age}</div>
                            <div className="text-xs text-gray-400 flex items-center mt-1">
                              <Phone className="h-3 w-3 mr-1" />
                              {record.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            {new Date(record.visitDate).toLocaleDateString('hi-IN')}
                          </div>
                          <div className="text-sm text-gray-500">{record.checkupType}</div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1 text-xs">
                          {record.vitals.bloodPressure && (
                            <div className="flex items-center">
                              <Stethoscope className="h-3 w-3 mr-1 text-gray-400" />
                              BP: {record.vitals.bloodPressure}
                            </div>
                          )}
                          {record.vitals.heartRate && (
                            <div className="flex items-center">
                              <Heart className="h-3 w-3 mr-1 text-red-400" />
                              HR: {record.vitals.heartRate} bpm
                            </div>
                          )}
                          {record.vitals.temperature && (
                            <div className="flex items-center">
                              <Thermometer className="h-3 w-3 mr-1 text-yellow-400" />
                              Temp: {record.vitals.temperature}°F
                            </div>
                          )}
                          {Object.entries(record.vitals.customTests || {}).slice(0, 2).map(([testKey, value]) => (
                            <div key={testKey} className="flex items-center">
                              <Activity className="h-3 w-3 mr-1 text-blue-400" />
                              {testKey}: {value}
                            </div>
                          ))}
                          {(!record.vitals.bloodPressure && !record.vitals.heartRate && !record.vitals.temperature && 
                           (!record.vitals.customTests || Object.keys(record.vitals.customTests).length === 0)) && (
                            <div className="text-gray-400 text-xs">कोई टेस्ट रिपोर्ट नहीं</div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{record.diagnosis}</div>
                        {record.symptoms.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            लक्षण: {record.symptoms.join(', ')}
                          </div>
                        )}
                        {record.medications.length > 0 && (
                          <div className="text-xs text-blue-600 mt-1">
                            दवाई: {record.medications.slice(0, 2).join(', ')}
                            {record.medications.length > 2 && '...'}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            record.status === 'healthy' || record.status === 'स्वस्थ' ? 'bg-green-100 text-green-800' :
                            record.status === 'stable' || record.status === 'स्थिर' ? 'bg-blue-100 text-blue-800' :
                            record.status === 'needs-attention' || record.status === 'ध्यान चाहिए' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {record.status}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="विवरण देखें"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadRecord(record)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="डाउनलोड करें"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {healthRecords.length === 0 && (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">कोई रिकॉर्ड नहीं मिला</h3>
                <p className="mt-1 text-sm text-gray-500">आपके खोज मापदंड से मेल खाने वाला कोई स्वास्थ्य रिकॉर्ड नहीं मिला।</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Record Modal will be added in next part... */}
      {showAddRecord && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-gray-900">नया स्वास्थ्य रिकॉर्ड जोड़ें</h3>
                <button
                  onClick={() => setShowAddRecord(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <form className="space-y-6">
                {/* Patient Search Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">मरीज़ खोजें</h4>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        मरीज़ का प्रकार *
                      </label>
                      <select
                        value={isEmployeeRelative}
                        onChange={(e) => setIsEmployeeRelative(e.target.value as 'employee' | 'relative' | 'outsider')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      >
                        <option value="">चयन करें</option>
                        <option value="employee">कर्मचारी</option>
                        <option value="relative">कर्मचारी का रिश्तेदार</option>
                        <option value="outsider">अन्य (फोन नंबर से खोजें)</option>
                      </select>
                    </div>

                    {isEmployeeRelative && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            फोन नंबर *
                          </label>
                          <input
                            type="tel"
                            value={searchPhone}
                            onChange={(e) => setSearchPhone(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="10 अंकों का मोबाइल नंबर"
                            pattern="[0-9]{10}"
                            maxLength={10}
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={handlePatientSearch}
                            disabled={patientSearchLoading}
                            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
                          >
                            <Search className="h-4 w-4" />
                            <span>{patientSearchLoading ? 'खोज रहे हैं...' : 'खोजें'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Relatives Dropdown */}
                    {showRelativeDropdown && foundRelatives.length > 0 && (
                      <div className="relative-dropdown-container">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          रिश्तेदार चुनें *
                        </label>
                        <select
                          value={selectedRelativeId}
                          onChange={(e) => {
                            setSelectedRelativeId(e.target.value);
                            if (e.target.value) {
                              handleRelativeSelection(e.target.value);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        >
                          <option value="">रिश्तेदार चुनें</option>
                          {foundRelatives.map((relative) => (
                            <option key={relative.id} value={relative.id}>
                              {relative.name} ({relative.relation}) - {relative.age} वर्ष {relative.bloodGroup ? `- ${relative.bloodGroup}` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Success indicator when relative is selected */}
                  {selectedRelativeId && formData.patientName && (
                    <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                      <div className="flex items-center text-green-700">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        <span className="font-medium">रिश्तेदार चुना गया: {formData.patientName}</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        मरीज़ की जानकारी स्वचालित रूप से भर गई है। कृपया नीचे की जानकारी चेक करें।
                      </p>
                    </div>
                  )}

                  {/* Patient Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        मरीज़ का नाम *
                      </label>
                      <input
                        type="text"
                        name="patientName"
                        value={formData.patientName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="पूरा नाम दर्ज करें"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        आयु *
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        required
                        min="1"
                        max="120"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="वर्षों में"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        लिंग *
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="male">पुरुष</option>
                        <option value="female">महिला</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        फोन नंबर *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        pattern="[0-9]{10}"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="10 अंकों का नंबर"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        पता *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="पूरा पता"
                      />
                    </div>
                  </div>
                </div>

                {/* Visit Information */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">कैंप की जानकारी</h4>
                  
                  <div className="mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2 relative camp-dropdown-container">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          कैंप का नाम *
                        </label>
                        <input
                          type="text"
                          value={campSearchValue || formData.camp}
                          onChange={(e) => {
                            setCampSearchValue(e.target.value);
                            setFormData(prev => ({ ...prev, camp: e.target.value }));
                          }}
                          onClick={handleCampSearch}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                          placeholder="कैंप खोजने के लिए क्लिक करें"
                          readOnly
                        />
                        
                        {/* Camp Dropdown */}
                        {showCampDropdown && foundCamps.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {foundCamps.map((camp, index) => (
                              <div
                                key={index}
                                onClick={() => handleCampSelection(camp)}
                                className="px-3 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium text-gray-900">{camp.name}</div>
                                <div className="text-sm text-gray-500">
                                  तारीख: {new Date(camp.date).toLocaleDateString('hi-IN')} • स्थान: {camp.location}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={handleCampSearch}
                          disabled={campSearchLoading}
                          className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Search className="h-4 w-4" />
                          <span>{campSearchLoading ? 'खोज रहे हैं...' : 'कैंप खोजें'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        कैंप की तारीख *
                      </label>
                      <input
                        type="date"
                        name="visitDate"
                        value={formData.visitDate}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        चेकअप का प्रकार *
                      </label>
                      <select
                        name="checkupType"
                        value={formData.checkupType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="routine">नियमित चेकअप</option>
                        <option value="emergency">आपातकाल</option>
                        <option value="screening">स्क्रीनिंग</option>
                        <option value="other">अन्य</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Vital Signs */}
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">महत्वपूर्ण संकेतक</h4>
                  
                  {/* Add New Vital Test */}
                  <div className="mb-6 p-4 bg-white rounded-lg border border-yellow-200">
                    <h5 className="font-medium text-gray-800 mb-3">नया टेस्ट जोड़ें</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <select
                          value={selectedVitalTest}
                          onChange={(e) => setSelectedVitalTest(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">टेस्ट चुनें</option>
                          {availableVitalTests.map((test) => (
                            <option key={test.value} value={test.value}>
                              {test.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {selectedVitalTest && (
                        <div>
                          <input
                            type="text"
                            value={vitalTestValue}
                            onChange={(e) => setVitalTestValue(e.target.value)}
                            placeholder={`मान दर्ज करें (${availableVitalTests.find(t => t.value === selectedVitalTest)?.unit})`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      )}
                      
                      {selectedVitalTest && vitalTestValue && (
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={addVitalTest}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                          >
                            <Plus className="h-4 w-4" />
                            <span>जोड़ें</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Display Added Vital Tests */}
                  {Object.keys(customVitals).length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-800 mb-3">जोड़े गए टेस्ट</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.entries(customVitals).map(([testKey, value]) => {
                          const testInfo = availableVitalTests.find(test => test.value === testKey);
                          return (
                            <div key={testKey} className="bg-white p-3 rounded-lg border border-blue-200 flex items-center justify-between">
                              <div>
                                <div className="font-medium text-blue-600">{value}</div>
                                <div className="text-xs text-gray-500">
                                  {testInfo ? testInfo.label.split('(')[0].trim() : testKey}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeVitalTest(testKey)}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="हटाएं"
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* BMI Calculation for Weight and Height */}
                  {customVitals.weight && customVitals.height && (
                    <div className="mt-3 p-3 bg-white rounded-lg border">
                      <div className="text-center">
                        <div className="font-bold text-lg text-purple-600">
                          BMI: {calculateBMI(
                            parseFloat(customVitals.weight.split(' ')[0]), 
                            parseFloat(customVitals.height.split(' ')[0])
                          )}
                        </div>
                        <div className="text-sm text-gray-500">Body Mass Index</div>
                      </div>
                    </div>
                  )}
                  
                  {Object.keys(customVitals).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p>कोई टेस्ट नहीं जोड़ा गया</p>
                      <p className="text-sm">ऊपर से टेस्ट चुनकर रिपोर्ट जोड़ें</p>
                    </div>
                  )}
                </div>

                {/* Medical Information */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">चिकित्सा जानकारी</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        लक्षण
                      </label>
                      <input
                        type="text"
                        name="symptoms"
                        value={formData.symptoms}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="लक्षण कॉमा से अलग करें"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        निदान *
                      </label>
                      <input
                        type="text"
                        name="diagnosis"
                        value={formData.diagnosis}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="निदान दर्ज करें"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        दवाइयां
                      </label>
                      <input
                        type="text"
                        name="medications"
                        value={formData.medications}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="दवाइयों को कॉमा से अलग करें"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        स्थिति *
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="healthy">स्वस्थ</option>
                        <option value="stable">स्थिर</option>
                        <option value="needs-attention">ध्यान चाहिए</option>
                        <option value="critical">गंभीर</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      डॉक्टर के नोट्स
                    </label>
                    <textarea
                      name="doctorNotes"
                      value={formData.doctorNotes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="अतिरिक्त नोट्स..."
                    />
                  </div>
                </div>

                {/* Rest of the form sections will continue... */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddRecord(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="button"
                    onClick={handleAddRecord}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors duration-200"
                  >
                    {loading ? 'सेव हो रहा है...' : 'सेव करें'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">स्वास्थ्य रिकॉर्ड विवरण</h3>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Patient Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">मरीज़ की जानकारी</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">नाम:</span>
                      <span className="ml-2 font-medium">{selectedRecord.patientName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">आयु:</span>
                      <span className="ml-2 font-medium">{selectedRecord.age} वर्ष</span>
                    </div>
                    <div>
                      <span className="text-gray-500">लिंग:</span>
                      <span className="ml-2 font-medium">{selectedRecord.gender === 'male' ? 'पुरुष' : 'महिला'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">फोन:</span>
                      <span className="ml-2 font-medium">{selectedRecord.phone}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">पता:</span>
                      <span className="ml-2 font-medium">{selectedRecord.address}</span>
                    </div>
                  </div>
                </div>

                {/* Vitals */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">महत्वपूर्ण संकेतक</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {/* Custom vitals */}
                    {selectedRecord.vitals.customTests && Object.entries(selectedRecord.vitals.customTests).map(([testKey, value]) => {
                      const testInfo = availableVitalTests.find(test => test.value === testKey);
                      return (
                        <div key={testKey} className="text-center">
                          <div className="font-bold text-lg text-teal-600">{value}</div>
                          <div className="text-gray-500 text-xs">
                            {testInfo ? testInfo.label.split('(')[0].trim() : testKey}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Show message if no vitals */}
                  {(!selectedRecord.vitals.customTests || Object.keys(selectedRecord.vitals.customTests).length === 0) && (
                    <div className="text-center py-4 text-gray-500">
                      <Activity className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p>कोई टेस्ट रिपोर्ट उपलब्ध नहीं है</p>
                    </div>
                  )}
                </div>

                {/* Diagnosis & Treatment */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">लक्षण</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecord.symptoms.map((symptom, index) => (
                        <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">निदान</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedRecord.diagnosis}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">निर्धारित दवाइयां</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {selectedRecord.medications.map((medication, index) => (
                        <li key={index}>{medication}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">डॉक्टर के नोट्स</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedRecord.doctorNotes}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                  >
                    बंद करें
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                    प्रिंट करें
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthRecords;