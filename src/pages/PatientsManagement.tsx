import React, { useState,useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import serverUrl from './Server';
import axios from 'axios';
import type{ Patient } from '../types/interfaces';
import { 
  Users, 
  Search, 
  Plus, 
  Heart,
  Calendar,
  Phone,
  MapPin,
  UserPlus,
  Edit,
  Eye
} from 'lucide-react';




const PatientsManagement: React.FC = () => {
  // const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPatient, setShowAddPatient] = useState(false);
  // const [selectedFilter, setSelectedFilter] = useState('all');
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  // const [dateOfBirthInput, setDateOfBirthInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilterField, setSelectedFilterField] = useState('');
  const [selectedFilterValue, setSelectedFilterValue] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
const [showPatientDetailsModal, setShowPatientDetailsModal] = useState(false);
const [showAddPatientForm, setShowAddPatientForm] = useState(false);
const [personType, setPersonType] = useState<'employee' | 'relative' | 'outsider' | ''>('');
const [relativePhone, setRelativePhone] = useState('');
const [relation, setRelation] = useState('');
const [statistics, setStatistics] = useState({
  totalOutsiders: 0,
  totalAyushmanBeneficiaries: 0,
  totalEmployees: 0,
  totalRelatives: 0
});
const [newPatientData, setNewPatientData] = useState({
  name: '',
  dateOfBirth: '',
  age: '',
  bloodGroup: '',
  gender: 'male' as 'male' | 'female' | 'other',
  phone: '',
  email: '',
  address: '',
  department: '',
  familyMembers: '',
  hasAbhaId: 'no' as 'yes' | 'no',
  hasAyushmanCard: 'no' as 'yes' | 'no'
});



  const [newPatient, setNewPatient] = useState({
    id:'0',
    email: '',
    phone: '',
    password: '',
    dateOfBirth: '',
    name: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other',
    bloodGroup: '',
    address: '',
    familyMembers: '',
    department: '',
    hasAbhaId: 'no' as 'yes' | 'no',
    hasAyushmanCard: 'no' as 'yes' | 'no'
  });

 const resetForm = () => {
  setNewPatient({
     id:'0',
    email: '',
    phone: '',
    password: '',
    dateOfBirth: '',
    name: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other',
    bloodGroup: '',
    address: '',
    familyMembers: '',
    department: '',
    hasAbhaId: 'no' as 'yes' | 'no',
    hasAyushmanCard: 'no' as 'yes' | 'no'
  });
};

const resetPatientForm = () => {
  setNewPatientData({
    name: '',
    dateOfBirth: '',
    age: '',
    bloodGroup: '',
    gender: 'male' as 'male' | 'female' | 'other',
    phone: '',
    email: '',
    address: '',
    department: '',
    familyMembers: '',
    hasAbhaId: 'no' as 'yes' | 'no',
    hasAyushmanCard: 'no' as 'yes' | 'no'
  });
  setPersonType('');
  setRelativePhone('');
  setRelation('');
};

// Load statistics from backend
const loadStatistics = async () => {
  try {
    // Get outsiders and ayushman stats
    const endpoint = `${serverUrl}get_outsiders_ayushman_stats.php`;
    const response = await axios.post(endpoint, {});
    const data = response.data;

    // Get total employees count from users table
    const employeesEndpoint = `${serverUrl}get_employees_count.php`;
    const employeesResponse = await axios.post(employeesEndpoint, {});
    const employeesData = employeesResponse.data;

    // Get total relatives count from relatives table
    const relativesEndpoint = `${serverUrl}get_relatives_count.php`;
    const relativesResponse = await axios.post(relativesEndpoint, {});
    const relativesData = relativesResponse.data;

    if (data.success && employeesData.success && relativesData.success) {
      setStatistics({
        totalOutsiders: data.data.totalOutsiders,
        totalAyushmanBeneficiaries: data.data.totalAyushmanBeneficiaries,
        totalEmployees: employeesData.data.count,
        totalRelatives: relativesData.data.count
      });
    }
  } catch (error) {
    console.error('Error loading statistics:', error);
  }
};

//========================
useEffect(() => {
  const fetchPatients = async () => {
    try {
      const endpoint = `${serverUrl}show_Patients.php`;
      const response = await axios.post(endpoint, {});
      const data = response.data;

      const loadedPatients: Patient[] = data.posts.map((post: any) => ({
      id: post.id,
      email: post.email,
      phone: post.phone,
      password: post.password,
      dateOfBirth: post.dateOfBirth,
      name: post.name,
      age: parseInt(post.age),
      gender: post.gender,
      bloodGroup: post.bloodGroup,
      address: post.address,
      lastVisit: post.date,
      healthStatus: post.healthStatus,
      familyMembers: parseInt(post.familyMembers) || 0,
      department: post.department,
      hasAbhaId: post.hasAbhaId,
      hasAyushmanCard: post.hasAyushmanCard
      }));

      setPatients(loadedPatients);
    } catch (error) {
      console.error('Error loading Patient:', error);
    }
  };

  fetchPatients(); // ✅ Make sure to call the async function here
  loadStatistics(); // ✅ Load statistics from backend
}, []);


const openEditModal = (patient: Patient) => {
  setEditingPatient(patient);
  setNewPatient({
      id: patient.id,
      email: patient.email,
      phone: patient.phone,
      password: patient.password,
      dateOfBirth: patient.dateOfBirth,
      name: patient.name,
      age: ""+patient.age,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      address: patient.address,
      

      familyMembers: ""+patient.familyMembers,
      department: patient.department,
      hasAbhaId: patient.hasAbhaId,
      hasAyushmanCard: patient.hasAyushmanCard
  });
  setShowAddPatient(true);
};
const openDetailsModal = (patient: Patient) => {
  setSelectedPatient(patient);
  setShowPatientDetailsModal(true);
};

//============================


  // Function to auto-generate password
  const generatePassword = (name: string, phone: string) => {
    if (name.length >= 4 && phone.length >= 4) {
      const firstFourLetters = name.substring(0, 4);
      const lastFourDigits = phone.slice(-4);
      return firstFourLetters + lastFourDigits;
    }
    return '';
  };

  // Function to calculate age from date of birth
  const calculateAge = (dateOfBirth: string): string => {
    if (!dateOfBirth) return '';
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  };

  // Function to format date to DD/MM/YYYY
  // const formatDateToDDMMYYYY = (dateString: string) => {
  //   if (!dateString) return '';
  //   const date = new Date(dateString);
  //   const day = date.getDate().toString().padStart(2, '0');
  //   const month = (date.getMonth() + 1).toString().padStart(2, '0');
  //   const year = date.getFullYear();
  //   return `${day}/${month}/${year}`;
  // };

  // Function to parse DD/MM/YYYY back to YYYY-MM-DD for input
  // const parseDDMMYYYYToDate = (ddmmyyyy: string) => {
  //   if (!ddmmyyyy || ddmmyyyy.length !== 10) return '';
  //   const [day, month, year] = ddmmyyyy.split('/');
  //   return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  // };

  // Empty patients data - Connect to your backend
  const [patients, setPatients] = useState<Patient[]>([]);

const filteredPatients = patients.filter((patient) => {
  const searchTermLower = searchTerm.toLowerCase();

  const matchesSearch =
    patient.name.toLowerCase().includes(searchTermLower) ||
    patient.phone.includes(searchTerm) ||
    patient.address.toLowerCase().includes(searchTermLower);

  let matchesFilter = true;

  if (!selectedFilterField || selectedFilterField === '') {
    matchesFilter = true; // no filter selected
  } else if (selectedFilterField === 'recent') {
    const lastVisit = new Date(patient.lastVisit);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastVisit.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    matchesFilter = diffDays <= 7;
  } else if (selectedFilterField === 'gender') {
    matchesFilter = patient.gender === selectedFilterValue;
  } else if (selectedFilterField === 'healthStatus') {
    matchesFilter = patient.healthStatus === selectedFilterValue;
  } else if (selectedFilterField === 'hasAbhaId') {
    matchesFilter = patient.hasAbhaId === selectedFilterValue;
  } else if (selectedFilterField === 'hasAyushmanCard') {
    matchesFilter = patient.hasAyushmanCard === selectedFilterValue;
  } else if (selectedFilterField === 'bloodGroup') {
    matchesFilter = patient.bloodGroup === selectedFilterValue;
  } else {
    matchesFilter = true; // fallback
  }

  return matchesSearch && matchesFilter;
});


  // const getHealthStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'good':
  //       return 'bg-green-100 text-green-800';
  //     case 'fair':
  //       return 'bg-yellow-100 text-yellow-800';
  //     case 'poor':
  //       return 'bg-red-100 text-red-800';
  //     default:
  //       return 'bg-gray-100 text-gray-800';
  //   }
  // };

  // const getHealthStatusText = (status: string) => {
  //   switch (status) {
  //     case 'good':
  //       return 'अच्छी';
  //     case 'fair':
  //       return 'सामान्य';
  //     case 'poor':
  //       return 'खराब';
  //     default:
  //       return 'अज्ञात';
  //   }
  // };

  


  
  // Function to handle adding a new patient

  const handleAddPatient = async(e: React.FormEvent) => {
    e.preventDefault();
    
    // yaha se changes start hue hai
    // Validation
    if (!newPatient.name || !newPatient.phone || !newPatient.password || !newPatient.dateOfBirth || !newPatient.address || !newPatient.department) {
      alert('कृपया सभी आवश्यक फ़ील्ड भरें');
      return;
    }
    // Email validation (only if email is provided)
    if (newPatient.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newPatient.email)) {
      alert('कृपया एक वैध ईमेल पता दर्ज करें');
      return;
    }
    // Phone number must be exactly 10 digits
    if (!/^\d{10}$/.test(newPatient.phone)) {
      alert('फोन नंबर 10 अंकों का होना चाहिए');
      return;
    }
    // Password validation
    if (newPatient.password.length < 6) {
      alert('पासवर्ड कम से कम 6 अक्षर का होना चाहिए');
      return;
    }
    // niche yaha tak hue hai

//===============================================
const endpoint = `${serverUrl}add_patient.php`;

  const response = await axios.post(endpoint, {
     id: '0',
      email: newPatient.email||' ',
      phone: newPatient.phone,
      password: newPatient.password,
      dateOfBirth: newPatient.dateOfBirth,
      name: newPatient.name,
      age: parseInt(newPatient.age),
      gender: newPatient.gender,
      bloodGroup: newPatient.bloodGroup,
      address: newPatient.address,
      

      familyMembers: parseInt(newPatient.familyMembers) || 0,
      department: newPatient.department,
      hasAbhaId: newPatient.hasAbhaId,
      hasAyushmanCard: newPatient.hasAyushmanCard
  });


  
  const data = response.data;
 

  const patient: Patient[] = data.posts.map((post: any) => ({
     id: post.id,
      email: post.email,
      phone: post.phone,
      password: post.password,
      dateOfBirth: post.dateOfBirth,
      name: post.name,
      age: parseInt(post.age),
      gender: post.gender,
      bloodGroup: post.bloodGroup,
      address: post.address,
      lastVisit: post.date,
      healthStatus: post.healthStatus,
      familyMembers: parseInt(post.familyMembers) || 0,
      department: post.department,
      hasAbhaId: post.hasAbhaId,
      hasAyushmanCard: post.hasAyushmanCard
  }));

//==================================================





    // Add patient to list
    setPatients(patient);

    
    
    // Close modal
    setShowAddPatient(false);
      setEditingPatient(null);
    alert('मरीज़ सफलतापूर्वक जोड़ा गया!');
  };

  const handleAddNewPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation based on person type
    if (!personType) {
      alert('कृपया व्यक्ति का प्रकार चुनें');
      return;
    }

    if (!newPatientData.name || !newPatientData.dateOfBirth || !newPatientData.age || !newPatientData.gender) {
      alert('कृपया सभी आवश्यक फ़ील्ड भरें');
      return;
    }

    // Employee specific validation
    if (personType === 'employee') {
      if (!newPatientData.address || !newPatientData.department) {
        alert('कृपया पता और विभाग दर्ज करें');
        return;
      }
      // Email validation (only if email is provided)
      if (newPatientData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newPatientData.email)) {
        alert('कृपया एक वैध ईमेल पता दर्ज करें');
        return;
      }
    }

    // For employees, phone is required; for outsiders, phone is required
    if (personType === 'employee' && !newPatientData.phone) {
      alert('कृपया फोन नंबर दर्ज करें');
      return;
    }
    
    if (personType === 'outsider' && !newPatientData.phone) {
      alert('कृपया फोन नंबर दर्ज करें');
      return;
    }

    // Phone number validation if provided
    if (newPatientData.phone && !/^\d{10}$/.test(newPatientData.phone)) {
      alert('फोन नंबर 10 अंकों का होना चाहिए');
      return;
    }

    // Relative validation - only employee phone and relation required, patient phone is optional
    if (personType === 'relative') {
      if (!relativePhone || !relation) {
        alert('कृपया कर्मचारी का मोबाइल नंबर और रिश्ता दर्ज करें');
        return;
      }
      if (!/^\d{10}$/.test(relativePhone)) {
        alert('कर्मचारी का फोन नंबर 10 अंकों का होना चाहिए');
        return;
      }
    }

    try {
      setIsLoading(true);
      
      let endpoint = '';
      let payload: any = {};

      if (personType === 'employee') {
        // Use existing employee API
        endpoint = `${serverUrl}add_patient.php`;
        
        // Generate password for employee
        const autoPassword = newPatientData.name.length >= 4 && newPatientData.phone.length >= 4 
          ? generatePassword(newPatientData.name, newPatientData.phone) 
          : '';

        payload = {
          id: '0',
          email: newPatientData.email || '',
          phone: newPatientData.phone,
          password: autoPassword,
          dateOfBirth: newPatientData.dateOfBirth,
          name: newPatientData.name,
          age: parseInt(newPatientData.age),
          gender: newPatientData.gender,
          bloodGroup: newPatientData.bloodGroup,
          address: newPatientData.address,
          familyMembers: parseInt(newPatientData.familyMembers) || 0,
          department: newPatientData.department,
          hasAbhaId: newPatientData.hasAbhaId,
          hasAyushmanCard: newPatientData.hasAyushmanCard
        };
      } else {
        // Use patient API for relatives and outsiders
        endpoint = `${serverUrl}add_patient_new.php`;
        payload = {
          name: newPatientData.name,
          dateOfBirth: newPatientData.dateOfBirth,
          age: newPatientData.age,
          bloodGroup: newPatientData.bloodGroup,
          gender: newPatientData.gender,
          phone: newPatientData.phone,
          isRelative: personType === 'relative' ? 'yes' : 'no',
          relativePhone: personType === 'relative' ? relativePhone : '',
          relation: personType === 'relative' ? relation : ''
        };
      }

      console.log('Sending payload:', payload);

      const response = await axios.post(endpoint, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('API Response:', response.data);

      if (response.data.success || response.data.posts) {
        // Success - show appropriate message
        if (personType === 'employee') {
          alert('कर्मचारी सफलतापूर्वक जोड़ा गया!');
          
          // Update patients list for employee
          if (response.data.posts) {
            const newPatients: Patient[] = response.data.posts.map((post: any) => ({
              id: post.id,
              email: post.email,
              phone: post.phone,
              password: post.password,
              dateOfBirth: post.dateOfBirth,
              name: post.name,
              age: parseInt(post.age),
              gender: post.gender,
              bloodGroup: post.bloodGroup,
              address: post.address,
              lastVisit: post.date,
              healthStatus: post.healthStatus,
              familyMembers: parseInt(post.familyMembers) || 0,
              department: post.department,
              hasAbhaId: post.hasAbhaId,
              hasAyushmanCard: post.hasAyushmanCard
            }));
            setPatients(newPatients);
          }
        } else if (personType === 'relative') {
          alert(`रिश्तेदार (${relation}) सफलतापूर्वक जोड़ा गया!\nकर्मचारी: ${response.data.data?.employeeName || ''}`);
        } else {
          alert('नया मरीज़ सफलतापूर्वक जोड़ा गया!');
        }

        // Reset form and close modal
        setShowAddPatientForm(false);
        resetPatientForm();
        
      } else {
        alert(response.data.message || 'व्यक्ति जोड़ते समय त्रुटि हुई।');
      }
      
    } catch (error: any) {
      console.error('Error adding person:', error);
      
      // Check if it's an API error with response
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert('व्यक्ति जोड़ते समय त्रुटि हुई। कृपया फिर से कोशिश करें।');
      }
    } finally {
      setIsLoading(false);
    }
  };

  //=====================================


  // Function to handle  Updating an existing patient


  const handleEditPatient = async () => {
  if (!editingPatient) return;

  setIsLoading(true);

  // ✅ Match your backend PHP column names here
  const payload = {
  id: editingPatient.id,
  name: newPatient.name,
  email: newPatient.email,
  phone: newPatient.phone,
  password: newPatient.password,
  dateOfBirth: newPatient.dateOfBirth,
  age: parseInt(newPatient.age),
  gender: newPatient.gender,
  bloodGroup: newPatient.bloodGroup,
  department: newPatient.department,
  address: newPatient.address,
  familyMembers: parseInt(newPatient.familyMembers),
  hasAbhaId: newPatient.hasAbhaId,
  hasAyushmanCard: newPatient.hasAyushmanCard,
  updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
};


  try {
    const endpoint = `${serverUrl}update_patient.php`;
    const response = await axios.post(endpoint, payload);
    const data = response.data;

    if (!data.posts) {
      throw new Error("Invalid response from server");
    }

    const updatedPatients: Patient[] = data.posts.map((post: any) => ({
      id: post.id,
      name: post.name, // `fullname` in DB
      email: post.email,
      phone: post.phone, // `phoneNumber` in DB
      password: post.password,
      dateOfBirth: post.dateOfBirth,
      age: parseInt(post.age),
      gender: post.gender,
      bloodGroup: post.bloodGroup,
      department: post.department,
      address: post.address,
      familyMembers: parseInt(post.familyMembers),
      hasAbhaId: post.hasAbhaId,
      hasAyushmanCard: post.hasAyushmanCard,
      // lastVisit: '', // if you want to support this in future
      // healthStatus: 'good' // default value (not in DB)
    }));

    setPatients(updatedPatients);
    setEditingPatient(null);
    setShowAddPatient(false);
    resetForm();
    alert('मरीज़ की जानकारी सफलतापूर्वक अपडेट की गई!');
  } catch (error) {
    console.error("❌ Error updating patient:", error);
    alert("मरीज़ अपडेट करते समय त्रुटि हुई।");
  } finally {
    setIsLoading(false);
  }
};

  //=====================================








  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/doctor/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>वापस डैशबोर्ड पर जाएं</span>
          </button>
        </div>
      </div> */}

      {/* Page Title */}
      <div className="bg-gradient-to-r from-green-700 to-green-900 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">मरीज़ प्रबंधन</h1>
              <p className="text-green-100 mt-1">
                सभी मरीजों की जानकारी और स्वास्थ्य रिकॉर्ड देखें
              </p>
            </div>
          </div>
          {/* <div className="text-right">
            <p className="text-2xl font-bold">{patients.length}</p>
            <p className="text-green-100 text-sm">कुल मरीज़</p>
          </div> */}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card border border-gray-400 text-center">
          <div className="p-6">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{statistics.totalEmployees}</div>
            <div className="text-sm text-gray-600">कुल कर्मचारी</div>
          </div>
        </div>
        
        <div className="card border border-gray-400 text-center">
          <div className="p-6">
            <Heart className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {statistics.totalOutsiders}
            </div>
            <div className="text-sm text-gray-600">कुल बाहरी व्यक्ति</div>
          </div>  
        </div>
        
        <div className="card border border-gray-400 text-center">
          <div className="p-6">
            <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {statistics.totalAyushmanBeneficiaries}
            </div>
            <div className="text-sm text-gray-600">कुल आयुष्मान लाभार्थी</div>
          </div>
        </div>
        
        <div className="card border border-gray-400 text-center">
          <div className="p-6">
            <UserPlus className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {statistics.totalRelatives}
            </div>
            <div className="text-sm text-gray-600">कुल पारिवारिक सदस्य</div>
          </div>
        </div>
      </div>

      {/* Search and Add Patient */}
      <div className="card border border-gray-400">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="मरीज़ खोजें..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center space-x-4">
  {/* Field Selection */}
  <select
    value={selectedFilterField}
    onChange={(e) => {
      setSelectedFilterField(e.target.value);
      setSelectedFilterValue(''); // Reset attribute when field changes
    }}
    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
  >
    <option value="">फ़िल्टर चुनें</option>
    <option value="gender">लिंग</option>
    <option value="healthStatus">स्वास्थ्य स्थिति</option>
    <option value="hasAbhaId">ABHA ID</option>
    <option value="hasAyushmanCard">आयुष्मान कार्ड</option>
    <option value="bloodGroup">रक्त समूह</option>
    <option value="recent">हाल के मरीज़</option>
  </select>

  {/* Attribute Selection */}
  {selectedFilterField && selectedFilterField !== 'recent' && (
    <select
      value={selectedFilterValue}
      onChange={(e) => setSelectedFilterValue(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
    >
      <option value="">-- चयन करें --</option>
      {selectedFilterField === 'gender' && (
        <>
          <option value="male">पुरुष</option>
          <option value="female">महिला</option>
          <option value="other">अन्य</option>
        </>
      )}
      {selectedFilterField === 'healthStatus' && (
        <>
          <option value="good">स्वस्थ</option>
          <option value="fair">सामान्य</option>
          <option value="poor">अस्वस्थ</option>
        </>
      )}
      {selectedFilterField === 'hasAbhaId' && (
        <>
          <option value="yes">हां</option>
          <option value="no">नहीं</option>
        </>
      )}
      {selectedFilterField === 'hasAyushmanCard' && (
        <>
          <option value="yes">हां</option>
          <option value="no">नहीं</option>
        </>
      )}
      {selectedFilterField === 'bloodGroup' &&
        ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
          <option key={bg} value={bg}>
            {bg}
          </option>
        ))}
    </select>
  )}

  {selectedFilterField === 'recent' && (
    <span className="text-sm text-gray-700">पिछले 7 दिनों के मरीज़</span>
  )}

  {/* Clear Filters */}
  {(searchTerm || selectedFilterField || selectedFilterValue) && (
    <button
      onClick={() => {
        setSearchTerm('');
        setSelectedFilterField('');
        setSelectedFilterValue('');
      }}
      className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
    >
      साफ़ करें
    </button>
  )}

  {/* Add Patient Button */}
  <button
    onClick={() => {
      setShowAddPatientForm(true);
    }}
    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
  >
    <Plus className="h-4 w-4" />
    <span>नया व्यक्ति जोड़ें</span>
  </button>
</div>


        </div>
      </div>

      {/* Patients List */}
      <div className="card border border-gray-400">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            मरिज़ो की सूची ({filteredPatients.length} परिणाम)
          </h3>
        </div>

        <div className="space-y-4">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{patient.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{patient.age} वर्ष • {patient.gender === 'male' ? 'पुरुष' : patient.gender === 'female' ? 'महिला' : 'अन्य'}</span>
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3" />
                          <span>{patient.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{patient.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm">
  <div className="flex items-center space-x-2">
    <UserPlus className="h-4 w-4 text-gray-400" />
    <span className="text-gray-600">{patient.familyMembers} पारिवारिक सदस्य</span>
  </div>

  <div className="flex items-center space-x-4">
    <div className="flex items-center space-x-1">
      <span className="text-gray-600">ABHA:</span>
      <span className={`px-2 py-1 text-xs font-medium rounded ${patient.hasAbhaId === 'yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {patient.hasAbhaId === 'yes' ? 'हाँ' : 'नहीं'}
      </span>
    </div>
    <div className="flex items-center space-x-1">
      <span className="text-gray-600">आयुष्मान:</span>
      <span className={`px-2 py-1 text-xs font-medium rounded ${patient.hasAyushmanCard === 'yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {patient.hasAyushmanCard === 'yes' ? 'हाँ' : 'नहीं'}
      </span>
    </div>
  </div>
</div>

                </div>
                
                <div className="flex items-center space-x-2">
  <button
  onClick={() => openDetailsModal(patient)}
  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
  title="स्वास्थ्य रिकॉर्ड देखें"
  type="button"
>
  <Eye className="h-4 w-4" />
</button>

  <button
    onClick={() => openEditModal(patient)}
    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
    title="संपादित करें"
    type="button"
  >
    <Edit className="h-4 w-4" />
  </button>
{showPatientDetailsModal && selectedPatient && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 transition-all duration-300 ease-in-out">
    <div className="relative bg-white shadow-2xl rounded-2xl w-full max-w-3xl p-8 border border-gray-200 animate-fade-in-up">
      
      {/* Close Button */}
      <button
        onClick={() => setShowPatientDetailsModal(false)}
        className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-2xl"
        aria-label="Close"
      >
        ✕
      </button>

      {/* Header */}
      <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
        👤 मरीज की जानकारी
      </h2>

      {/* Table Layout */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-300 text-sm text-left text-gray-800">
          <tbody>
            <tr className="border-b">
              <td className="p-2 font-semibold">नाम:</td>
              <td className="p-2">{selectedPatient.name}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-semibold">ईमेल:</td>
              <td className="p-2">{selectedPatient.email}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-semibold">फोन नंबर:</td>
              <td className="p-2">{selectedPatient.phone}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-semibold">लिंग:</td>
              <td className="p-2">
                {selectedPatient.gender === "male"
                  ? "पुरुष"
                  : selectedPatient.gender === "female"
                  ? "महिला"
                  : "अन्य"}
              </td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-semibold">जन्म तिथि:</td>
              <td className="p-2">{selectedPatient.dateOfBirth}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-semibold">आयु:</td>
              <td className="p-2">{selectedPatient.age}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-semibold">पता:</td>
              <td className="p-2">{selectedPatient.address}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-semibold">पारिवारिक सदस्य:</td>
              <td className="p-2">{selectedPatient.familyMembers}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-semibold">विभाग:</td>
              <td className="p-2">{selectedPatient.department}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-semibold">ABHA आईडी:</td>
              <td className="p-2">{selectedPatient.hasAbhaId === "yes" ? "हाँ" : "नहीं"}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-semibold">आयुष्मान कार्ड:</td>
              <td className="p-2">{selectedPatient.hasAyushmanCard === "yes" ? "हाँ" : "नहीं"}</td>
            </tr>
            <tr>
              <td className="p-2 font-semibold">रक्त समूह:</td>
              <td className="p-2">{selectedPatient.bloodGroup}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <button
          onClick={() => setShowPatientDetailsModal(false)}
          className="px-6 py-2 bg-green-600 text-white text-sm rounded-full hover:bg-green-700 transition"
        >
          बंद करें
        </button>
      </div>
    </div>
  </div>
)}
</div>







              </div>
            </div>
          ))}

          {filteredPatients.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">कोई मरीज़ नहीं मिला</h3>
              <p className="text-gray-600">
                आपके खोज मापदंड के अनुसार कोई मरीज़ नहीं मिला।
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">नया मरीज़ जोड़ें</h3>
              <button
                onClick={() => {
                  resetForm();
                  setShowAddPatient(false)
                setEditingPatient(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPatient} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  मरीज़ का नाम *
                </label>
                <input
                  type="text"
                  value={newPatient.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setNewPatient({...newPatient, name: newName});
                    
                    // Auto-generate password when name is entered
                    if (newName.length >= 4 && newPatient.phone.length >= 4) {
                      const autoPassword = generatePassword(newName, newPatient.phone);
                      setNewPatient(prev => ({...prev, name: newName, password: autoPassword}));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="पूरा नाम दर्ज करें"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ईमेल पता
                </label>
                <input
                  type="email"
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="example@email.com (वैकल्पिक)"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  फोन नंबर *
                </label>
                <input
                  type="tel"
                  value={newPatient.phone}
                  onChange={(e) => {
                    const newPhone = e.target.value;
                    setNewPatient({...newPatient, phone: newPhone});
                    
                    // Auto-generate password when phone number is entered
                    if (newPhone.length >= 4 && newPatient.name.length >= 4) {
                      const autoPassword = generatePassword(newPatient.name, newPhone);
                      setNewPatient(prev => ({...prev, phone: newPhone, password: autoPassword}));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="10 अंकों का मोबाइल नंबर"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  पासवर्ड * (स्वचालित जेनरेट)
                </label>
                <input
                  type="text"
                  value={newPatient.password}
                  onChange={(e) => setNewPatient({...newPatient, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                  placeholder="नाम + फोन नंबर से जेनरेट होगा"
                  minLength={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">नाम के पहले 4 अक्षर + फोन के अंतिम 4 अंक</p>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  जन्म तिथि * (MM/DD/YYYY)
                </label>
                <input
  type="date"
  value={newPatient.dateOfBirth}
  onChange={(e) => setNewPatient({...newPatient, dateOfBirth: e.target.value})}
     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
/>

              </div>

              {/* Age (Auto-calculated) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  उम्र (स्वचालित गणना)
                </label>
                <input
                  type="text"
                  value={newPatient.age}
                    onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                    placeholder="जन्म तिथि से गणना होगी"
                  
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  लिंग *
                </label>
                <select
                  value={newPatient.gender}
                  onChange={(e) => setNewPatient({...newPatient, gender: e.target.value as 'male' | 'female' | 'other'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="male">पुरुष</option>
                  <option value="female">महिला</option>
                  <option value="other">अन्य</option>
                </select>
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  रक्त समूह
                </label>
                <select
                  value={newPatient.bloodGroup}
                  onChange={(e) => setNewPatient({...newPatient, bloodGroup: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">रक्त समूह चुनें (वैकल्पिक)</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              {/* Department Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  विभाग चुनें *
                </label>
                <select
                  value={newPatient.department}
                  onChange={(e) => setNewPatient({...newPatient, department: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">विभाग चुनें</option>
                  <option value="सामान्य प्रशासन विभाग">सामान्य प्रशासन विभाग</option>
                  <option value="गृह विभाग">गृह विभाग</option>
                  <option value="वित्त विभाग">वित्त विभाग</option>
                  <option value="स्वास्थ्य एवं परिवार कल्याण विभाग">स्वास्थ्य एवं परिवार कल्याण विभाग</option>
                  <option value="स्कूल शिक्षा विभाग">स्कूल शिक्षा विभाग</option>
                  <option value="उच्च शिक्षा विभाग">उच्च शिक्षा विभाग</option>
                  <option value="तकनीकी शिक्षा विभाग">तकनीकी शिक्षा विभाग</option>
                  <option value="वन विभाग">वन विभाग</option>
                  <option value="राजस्व एवं आपदा प्रबंधन विभाग">राजस्व एवं आपदा प्रबंधन विभाग</option>
                  <option value="खाद्य, नागरिक आपूर्ति एवं उपभोक्ता संरक्षण विभाग">खाद्य, नागरिक आपूर्ति एवं उपभोक्ता संरक्षण विभाग</option>
                  <option value="कृषि विभाग">कृषि विभाग</option>
                  <option value="पंचायत एवं ग्रामीण विकास विभाग">पंचायत एवं ग्रामीण विकास विभाग</option>
                  <option value="श्रम विभाग">श्रम विभाग</option>
                  <option value="महिला एवं बाल विकास विभाग">महिला एवं बाल विकास विभाग</option>
                  <option value="जनजातीय कार्य विभाग">जनजातीय कार्य विभाग</option>
                  <option value="अनुसूचित जाति एवं अन्य पिछड़ा वर्ग विकास विभाग">अनुसूचित जाति एवं अन्य पिछड़ा वर्ग विकास विभाग</option>
                  <option value="ऊर्जा विभाग">ऊर्जा विभाग</option>
                  <option value="जल संसाधन विभाग">जल संसाधन विभाग</option>
                  <option value="लोक निर्माण विभाग">लोक निर्माण विभाग</option>
                  <option value="परिवहन विभाग">परिवहन विभाग</option>
                  <option value="नगर प्रशासन विभाग">नगर प्रशासन विभाग</option>
                  <option value="सूचना प्रौद्योगिकी विभाग">सूचना प्रौद्योगिकी विभाग</option>
                  <option value="पर्यटन विभाग">पर्यटन विभाग</option>
                  <option value="खेल एवं युवा कल्याण विभाग">खेल एवं युवा कल्याण विभाग</option>
                  <option value="उद्योग विभाग">उद्योग विभाग</option>
                </select>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  पता *
                </label>
                <textarea
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="पूरा पता दर्ज करें"
                  rows={2}
                  required
                />
              </div>

              {/* Family Members */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  पारिवारिक सदस्यों की संख्या
                </label>
                <input
                  type="number"
                  value={newPatient.familyMembers}
                  onChange={(e) => setNewPatient({...newPatient, familyMembers: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="कुल पारिवारिक सदस्य"
                  min="0"
                  max="20"
                />
              </div>

              {/* ABHA ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  क्या आपका ABHA ID बना है? *
                </label>
                <select
                  value={newPatient.hasAbhaId}
                  onChange={(e) => setNewPatient({...newPatient, hasAbhaId: e.target.value as 'yes' | 'no'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="no">नहीं</option>
                  <option value="yes">हाँ</option>
                </select>
              </div>

              {/* Ayushman Card */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  क्या आपका आयुष्मान कार्ड बना है? *
                </label>
                <select
                  value={newPatient.hasAyushmanCard}
                  onChange={(e) => setNewPatient({...newPatient, hasAyushmanCard: e.target.value as 'yes' | 'no'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="no">नहीं</option>
                  <option value="yes">हाँ</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() =>{ 
                  setShowAddPatient(false)
                
                    setEditingPatient(null);
                   
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={editingPatient ? handleEditPatient : handleAddPatient}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  मरीज़ जोड़ें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Person Form Modal */}
      {showAddPatientForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">नया व्यक्ति जोड़ें</h3>
              <button
                onClick={() => {
                  resetPatientForm();
                  setShowAddPatientForm(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewPatient} className="space-y-4">
              {/* Person Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  व्यक्ति का प्रकार *
                </label>
                <select
                  value={personType}
                  onChange={(e) => setPersonType(e.target.value as 'employee' | 'relative' | 'outsider')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">चयन करें</option>
                  <option value="employee">कर्मचारी</option>
                  <option value="relative">कर्मचारी का रिश्तेदार</option>
                  <option value="outsider">बाहरी व्यक्ति</option>
                </select>
              </div>

              {/* Employee Mobile Number - Only if relative */}
              {personType === 'relative' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    कर्मचारी का मोबाइल नंबर *
                  </label>
                  <input
                    type="tel"
                    value={relativePhone}
                    onChange={(e) => setRelativePhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="10 अंकों का मोबाइल नंबर"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    required
                  />
                </div>
              )}

              {/* Relation - Only if relative */}
              {personType === 'relative' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    रिश्ता *
                  </label>
                  <input
                    type="text"
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="रिश्ता दर्ज करें (जैसे: पत्नी, पति, बेटा, बेटी आदि)"
                    required
                  />
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {personType === 'employee' ? 'कर्मचारी का नाम' : 'व्यक्ति का नाम'} *
                </label>
                <input
                  type="text"
                  value={newPatientData.name}
                  onChange={(e) => setNewPatientData({...newPatientData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="पूरा नाम दर्ज करें"
                  required
                />
              </div>

              {/* Phone Number - Required for employee and outsider, optional for relative */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  फोन नंबर {personType === 'employee' || personType === 'outsider' ? '*' : '*'}
                </label>
                <input
                  type="tel"
                  value={newPatientData.phone}
                  onChange={(e) => setNewPatientData({...newPatientData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="10 अंकों का मोबाइल नंबर"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required={personType === 'employee' || personType === 'outsider'}
                />
              </div>

              {/* Email - Only for employee (optional) */}
              {personType === 'employee' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ईमेल पता 
                  </label>
                  <input
                    type="email"
                    value={newPatientData.email || ''}
                    onChange={(e) => setNewPatientData({...newPatientData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="example@email.com"
                  />
                </div>
              )}

              {/* Department - Only for employee */}
              {personType === 'employee' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    विभाग चुनें *
                  </label>
                  <select
                    value={newPatientData.department || ''}
                    onChange={(e) => setNewPatientData({...newPatientData, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">विभाग चुनें</option>
                    <option value="सामान्य प्रशासन विभाग">सामान्य प्रशासन विभाग</option>
                    <option value="गृह विभाग">गृह विभाग</option>
                    <option value="वित्त विभाग">वित्त विभाग</option>
                    <option value="स्वास्थ्य एवं परिवार कल्याण विभाग">स्वास्थ्य एवं परिवार कल्याण विभाग</option>
                    <option value="स्कूल शिक्षा विभाग">स्कूल शिक्षा विभाग</option>
                    <option value="उच्च शिक्षा विभाग">उच्च शिक्षा विभाग</option>
                    <option value="तकनीकी शिक्षा विभाग">तकनीकी शिक्षा विभाग</option>
                    <option value="वन विभाग">वन विभाग</option>
                    <option value="राजस्व एवं आपदा प्रबंधन विभाग">राजस्व एवं आपदा प्रबंधन विभाग</option>
                    <option value="खाद्य, नागरिक आपूर्ति एवं उपभोक्ता संरक्षण विभाग">खाद्य, नागरिक आपूर्ति एवं उपभोक्ता संरक्षण विभाग</option>
                    <option value="कृषि विभाग">कृषि विभाग</option>
                    <option value="पंचायत एवं ग्रामीण विकास विभाग">पंचायत एवं ग्रामीण विकास विभाग</option>
                    <option value="श्रम विभाग">श्रम विभाग</option>
                    <option value="महिला एवं बाल विकास विभाग">महिला एवं बाल विकास विभाग</option>
                    <option value="जनजातीय कार्य विभाग">जनजातीय कार्य विभाग</option>
                    <option value="अनुसूचित जाति एवं अन्य पिछड़ा वर्ग विकास विभाग">अनुसूचित जाति एवं अन्य पिछड़ा वर्ग विकास विभाग</option>
                    <option value="ऊर्जा विभाग">ऊर्जा विभाग</option>
                    <option value="जल संसाधन विभाग">जल संसाधन विभाग</option>
                    <option value="लोक निर्माण विभाग">लोक निर्माण विभाग</option>
                    <option value="परिवहन विभाग">परिवहन विभाग</option>
                    <option value="नगर प्रशासन विभाग">नगर प्रशासन विभाग</option>
                    <option value="सूचना प्रौद्योगिकी विभाग">सूचना प्रौद्योगिकी विभाग</option>
                    <option value="पर्यटन विभाग">पर्यटन विभाग</option>
                    <option value="खेल एवं युवा कल्याण विभाग">खेल एवं युवा कल्याण विभाग</option>
                    <option value="उद्योग विभाग">उद्योग विभाग</option>
                  </select>
                </div>
              )}

              {/* Address - Only for employee */}
              {personType === 'employee' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    पता *
                  </label>
                  <textarea
                    value={newPatientData.address || ''}
                    onChange={(e) => setNewPatientData({...newPatientData, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="पूरा पता दर्ज करें"
                    rows={2}
                    required
                  />
                </div>
              )}

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  जन्म तिथि *
                </label>
                <input
                  type="date"
                  value={newPatientData.dateOfBirth}
                  onChange={(e) => {
                    const newDateOfBirth = e.target.value;
                    const calculatedAge = calculateAge(newDateOfBirth);
                    setNewPatientData({
                      ...newPatientData, 
                      dateOfBirth: newDateOfBirth,
                      age: calculatedAge
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Age (Auto-calculated) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  उम्र (स्वचालित गणना)
                </label>
                <input
                  type="number"
                  value={newPatientData.age}
                  onChange={(e) => setNewPatientData({...newPatientData, age: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                  placeholder="जन्म तिथि से गणना होगी"
                  min="0"
                  max="120"
                  required
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">यह जन्म तिथि से स्वचालित रूप से गणना की जाती है</p>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  लिंग *
                </label>
                <select
                  value={newPatientData.gender}
                  onChange={(e) => setNewPatientData({...newPatientData, gender: e.target.value as 'male' | 'female' | 'other'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="male">पुरुष</option>
                  <option value="female">महिला</option>
                  <option value="other">अन्य</option>
                </select>
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  रक्त समूह (वैकल्पिक)
                </label>
                <select
                  value={newPatientData.bloodGroup}
                  onChange={(e) => setNewPatientData({...newPatientData, bloodGroup: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">रक्त समूह चुनें (वैकल्पिक)</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              {/* Family Members - Only for employee */}
              {personType === 'employee' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    पारिवारिक सदस्यों की संख्या
                  </label>
                  <input
                    type="number"
                    value={newPatientData.familyMembers || '0'}
                    onChange={(e) => setNewPatientData({...newPatientData, familyMembers: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="कुल पारिवारिक सदस्य"
                    min="0"
                    max="20"
                  />
                </div>
              )}

              {/* ABHA ID - Only for employee */}
              {personType === 'employee' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    क्या आपका ABHA ID बना है? *
                  </label>
                  <select
                    value={newPatientData.hasAbhaId || 'no'}
                    onChange={(e) => setNewPatientData({...newPatientData, hasAbhaId: e.target.value as 'yes' | 'no'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="no">नहीं</option>
                    <option value="yes">हाँ</option>
                  </select>
                </div>
              )}

              {/* Ayushman Card - Only for employee */}
              {personType === 'employee' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    क्या आपका आयुष्मान कार्ड बना है? *
                  </label>
                  <select
                    value={newPatientData.hasAyushmanCard || 'no'}
                    onChange={(e) => setNewPatientData({...newPatientData, hasAyushmanCard: e.target.value as 'yes' | 'no'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="no">नहीं</option>
                    <option value="yes">हाँ</option>
                  </select>
                </div>
              )}

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPatientForm(false);
                    resetPatientForm();
                  }}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'जोड़ा जा रहा है...' : 
                   personType === 'employee' ? 'कर्मचारी जोड़ें' :
                   personType === 'relative' ? 'रिश्तेदार जोड़ें' : 
                   'मरीज़ जोड़ें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsManagement;