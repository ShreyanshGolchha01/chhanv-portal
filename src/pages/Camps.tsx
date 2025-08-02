import React, { useState, useEffect } from 'react';
// UPDATED: Added Search, X, Save, ChevronDown icons for new dialog functionality
import { Plus, Calendar, MapPin, Users, Edit, Trash2, Search, X, Save, ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import { mockCamps } from '../data/mockData';
import type { Camp, TableColumn } from '../types/interfaces';
import serverUrl from './Server';
import axios from 'axios';
import type { Doctor } from '../types/interfaces';

const Camps: React.FC = () => {
  const [camps, setCamps] = useState(mockCamps);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCamp, setEditingCamp] = useState<Camp | null>(null);
  const [deletingCamp, setDeletingCamp] = useState<Camp | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);



  // UPDATED: Changed form structure to match NewCamp.tsx layout
  const [formData, setFormData] = useState({
    id:'0',
    campName: '', // NEW: Added camp name field
    location: '',
    address: '',
    date: '',
    startTime: '', // UPDATED: Changed from timeFrom to startTime
    endTime: '', // UPDATED: Changed from timeTo to endTime
    expectedPatients: '', // UPDATED: Changed from expectedBeneficiaries to expectedPatients
    description: '', // NEW: Added description field
    services: [] as string[], // NEW: Added services array
    assignedDoctors: [] as string[] // UPDATED: Changed from doctors to assignedDoctors
  });

  // NEW: Added state variables for enhanced form functionality
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDoctorDialog, setShowDoctorDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatusDropdown, setActiveStatusDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{top: number, left: number} | null>(null);



  // NEW: Added available services list matching NewCamp.tsx
  const availableServices = [
    'सामान्य स्वास्थ्य जांच',
    'रक्तचाप जांच',
    'मधुमेह जांच',
    'आंखों की जांच',
    'दांतों की जांच',
    'टीकाकरण',
    'गर्भवती महिलाओं की जांच',
    'बच्चों की जांच'
  ];

  // NEW: Added doctor search filtering functionality
  const filteredDoctors = doctors.filter((doctor) => {
  const name = doctor?.name?.toLowerCase() || '';
  const specialty = doctor?.specialty?.toLowerCase() || '';
  const qualification = doctor.qualification?.join(' ').toLowerCase();

  return (
    name.includes(searchTerm.toLowerCase()) ||
    specialty.includes(searchTerm.toLowerCase()) ||
    qualification.includes(searchTerm.toLowerCase())
  );
});


  // Handle escape key to close dialog
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDoctorDialog) {
        setShowDoctorDialog(false);
        setSearchTerm('');
      }
      if (e.key === 'Escape' && activeStatusDropdown) {
        setActiveStatusDropdown(null);
        setDropdownPosition(null);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (activeStatusDropdown && !(e.target as Element).closest('.status-dropdown')) {
        setActiveStatusDropdown(null);
        setDropdownPosition(null);
      }
    };

    const handleScroll = () => {
      if (activeStatusDropdown) {
        setActiveStatusDropdown(null);
        setDropdownPosition(null);
      }
    };

    const handleResize = () => {
      if (activeStatusDropdown) {
        setActiveStatusDropdown(null);
        setDropdownPosition(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [showDoctorDialog, activeStatusDropdown]);

  // NEW: Added generic form input handler from NewCamp.tsx
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // NEW: Added service selection toggle function
  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  // NEW: Added doctor selection toggle function from NewCamp.tsx
  const handleDoctorToggle = (doctorId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedDoctors: prev.assignedDoctors.includes(doctorId)
        ? prev.assignedDoctors.filter(d => d !== doctorId)
        : [...prev.assignedDoctors, doctorId]
    }));
    // Clear error when user selects doctors
    if (errors.assignedDoctors) {
      setErrors(prev => ({
        ...prev,
        assignedDoctors: ''
      }));
    }
  };

  // NEW: Added comprehensive form validation from NewCamp.tsx
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.campName.trim()) {
      newErrors.campName = 'शिविर का नाम आवश्यक है';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'स्थान आवश्यक है';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'पूरा पता आवश्यक है';
    }
    if (!formData.date) {
      newErrors.date = 'तारीख आवश्यक है';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'शुरुआती समय आवश्यक है';
    }
    if (!formData.endTime) {
      newErrors.endTime = 'समाप्ति समय आवश्यक है';
    }
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'समाप्ति समय शुरुआती समय से बाद होना चाहिए';
    }
    if (!formData.expectedPatients || parseInt(formData.expectedPatients) < 1) {
      newErrors.expectedPatients = 'अपेक्षित मरीजों की संख्या आवश्यक है';
    }
    if (formData.services.length === 0) {
      newErrors.services = 'कम से कम एक सेवा चुनें';
    }
    if (formData.assignedDoctors.length === 0) {
      newErrors.assignedDoctors = 'कम से कम एक डॉक्टर का चयन आवश्यक है';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // NEW: Function to handle manual status update
  const handleStatusUpdate = async (campId: string, newStatus: string) => {
    try {
      const endpoint = `${serverUrl}update_camp_status.php`;
      const response = await axios.post(endpoint, {
        id: campId,
        status: newStatus
      });

      if (response.data.success) {
        // Update the specific camp in the state
        setCamps(prevCamps => 
          prevCamps.map(camp => 
            camp.id === campId 
              ? { ...camp, status: newStatus }
              : camp
          )
        );
        setActiveStatusDropdown(null); // Close dropdown
        alert(`शिविर की स्थिति "${getStatusLabel(newStatus)}" में बदल दी गई है`);
      } else {
        alert('स्थिति अपडेट करने में त्रुटि: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('स्थिति अपडेट करने में त्रुटि हुई');
    }
  };

  // Helper function to get status label in Hindi
  const getStatusLabel = (status: string) => {
    const statusLabels = {
      scheduled: 'निर्धारित',
      ongoing: 'चल रहा',
      completed: 'पूर्ण',
      cancelled: 'रद्द',
    };
    return statusLabels[status as keyof typeof statusLabels] || status;
  };

  //=================use effect to load data
 useEffect(() => {
  const fetchCamps = async () => {
    try {
      const endpoint = `${serverUrl}show_camp_updated.php`;
      const response = await axios.post(endpoint, {});
      console.log("Raw camp response:", response.data);

      const data = response.data;
      const newCamps: Camp[] = Array.isArray(data.posts)
        ? data.posts.map((post: any) => ({
            id: post.id,
            campName: post.campName || post.location || "अनाम शिविर",
            location: post.location || "स्थान अज्ञात",
            date: post.DATE || '',
            time: `${post.startTime || ''} - ${post.endTime || ''}`,
            address: post.address || '',
            coordinator: post.coordinator || '',
            expectedBeneficiaries: parseInt(post.expectedBeneficiaries || '0', 10),
            doctors: post.doctors ? post.doctors.split(',') : [],
            services: post.services ? post.services.split(',') : [],
            status: post.STATUS || 'scheduled',
            beneficiaries: parseInt(post.beneficiaries || '0', 10),
          }))
        : [];

      setCamps(newCamps);
    } catch (error) {
      console.error("Error fetching camps:", error);
    }
  };

  fetchCamps();
}, []);
// Run only on component mount

  //////end of use effect
useEffect(() => {
  const fetchDoctors = async () => {
    try {
      const endpoint = `${serverUrl}show_doctor.php`;
      const response = await axios.post(endpoint, {});
      const data = response.data;

      const loadedDoctors: Doctor[] = data.posts.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        specialty: doc.specialty,
        phone: doc.phone,
        email: doc.email,
        avatar: doc.avatar || '', // optional
        experience: Number(doc.experience),
        qualification: doc.qualification
          ? doc.qualification.split(',').map((q: string) => q.trim())
          : [],
        assignedCamps: doc.assignedCamps
          ? doc.assignedCamps.split(',').map((c: string) => c.trim())
          : []
      }));

      setDoctors(loadedDoctors);
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  fetchDoctors(); // ✅ Make sure to call the async function here
}, []);




  const handleAddCamp = async () => {
  if (!validateForm()) {
    return;
  }

  setIsLoading(true);

  const endpoint = `${serverUrl}save_camp.php`;

  const response = await axios.post(endpoint, {
    id: Date.now().toString(), // if using string ID
    campName: formData.campName,
    location: formData.location,
    date: formData.date,
    startTime: formData.startTime,
    endTime: formData.endTime,
    address: formData.address,
    description: formData.description,
    expectedBeneficiaries: parseInt(formData.expectedPatients),
    doctors: formData.assignedDoctors.join(','), // send as comma-separated
    services: formData.services.join(','), // send as comma-separated
    coordinator: '', // optional or populate if needed
    status: 'scheduled',
    beneficiaries: '0',
    createdBy: 'admin', // or use dynamic logged-in user
    createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
  });

  alert('Camp has been added successfully!');
  const data = response.data;

  const newCamps: Camp[] = data.posts.map((post: any) => ({
    id: post.id,
    campName: post.campName,
    location: post.location,
    date: post.date,
    time: `${post.startTime} - ${post.endTime}`,
    address: post.address,
    coordinator: post.coordinator,
    expectedBeneficiaries: parseInt(post.expectedBeneficiaries, 10),
    doctors: post.doctors?.split(','),
    services: post.services?.split(','),
    status: post.status,
    beneficiaries: parseInt(post.beneficiaries || '0', 10),
  }));

  // Replace entire camps array with updated data from backend
  setCamps(newCamps);
  setShowAddModal(false);
  setIsLoading(false);
  resetForm();
};


  const handleEditCamp = async () => {
  if (!editingCamp) return;

  if (!validateForm()) {
    return;
  }

  setIsLoading(true);

  const endpoint = `${serverUrl}update_camp.php`;

  const response = await axios.post(endpoint, {
    id: formData.id,
    campName: formData.campName,
    location: formData.location,
    date: formData.date,
    startTime: formData.startTime,
    endTime: formData.endTime,
    address: formData.address,
    description: formData.description,
    expectedBeneficiaries: parseInt(formData.expectedPatients),
    doctors: formData.assignedDoctors.join(','),       // send as comma-separated string
    services: formData.services.join(','),             // send as comma-separated string
    status: 'scheduled',
    beneficiaries: 0,
    updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
  });

  alert('Camp has been updated successfully!');

  const data = response.data;

  const newCamps: Camp[] = data.posts.map((post: any) => ({
    id: post.id,
    campName: post.campName,
    location: post.location,
    date: post.date,
    time: `${post.startTime} - ${post.endTime}`,
    address: post.address,
    coordinator: post.coordinator,
    expectedBeneficiaries: parseInt(post.expectedBeneficiaries, 10),
    doctors: post.doctors?.split(','),
    services: post.services?.split(','),
    status: post.status,
    beneficiaries: parseInt(post.beneficiaries || '0', 10),
  }));

  // Replace entire camps array with updated data from backend
  setCamps(newCamps);
  setShowAddModal(false);
  setIsLoading(false);
  resetForm();
};


  const handleDeleteCamp = async () => {
  if (!deletingCamp) return;

  const endpoint = `${serverUrl}delete_camp.php`;

  const response = await axios.post(endpoint, {
    id: deletingCamp.id,
  });

  alert('Camp has been deleted successfully!');
  const data = response.data;

  const newCamps: Camp[] = data.posts.map((post: any) => ({
    id: post.id,
    campName: post.campName,
    location: post.location,
    date: post.date,
    time: `${post.startTime} - ${post.endTime}`,
    address: post.address,
    coordinator: post.coordinator,
    expectedBeneficiaries: parseInt(post.expectedBeneficiaries, 10),
    doctors: post.doctors?.split(','),
    services: post.services?.split(','),
    status: post.status,
    beneficiaries: parseInt(post.beneficiaries || '0', 10),
  }));

  // setCamps(newCamps); // Replace full list with updated data from backend
  setCamps(newCamps);
  setShowAddModal(false);
  setIsLoading(false);
  resetForm();
};


  const resetForm = () => {
  setFormData({
    id: '', // assuming id is auto-incremented or string for frontend handling
    campName: '',
    location: '',
    address: '',
    date: '',
    startTime: '',
    endTime: '',
    expectedPatients: '', // corresponds to expectedBeneficiaries
    description: '',
    services: [],
    assignedDoctors: []
  });
};

const openEditModal = (camp: Camp) => {
  setEditingCamp(camp);
  setFormData({
    id: camp.id,
    campName: camp.campName || '',
    location: camp.location || '',
    startTime: camp.time?.split(' - ')[0] || '',
    endTime: camp.time?.split(' - ')[1] || '',
    address: camp.address || '',
    date: camp.date || '',
    expectedPatients: camp.expectedBeneficiaries?.toString() || '',
    description: camp.description || '',
    services: camp.services || [],
    assignedDoctors: camp.doctors || []
  });
  setShowAddModal(true);
};




  const getStatusBadge = (status: string, campId: string) => {
    const statusStyles = {
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      ongoing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };

    const statusLabels = {
      scheduled: 'निर्धारित',
      ongoing: 'चल रहा',
      completed: 'पूर्ण',
      cancelled: 'रद्द',
    };

    const allStatuses = [
      { value: 'scheduled', label: 'निर्धारित' },
      { value: 'ongoing', label: 'चल रहा' },
      { value: 'completed', label: 'पूर्ण' },
      { value: 'cancelled', label: 'रद्द' }
    ];

    const handleButtonClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (activeStatusDropdown === campId) {
        setActiveStatusDropdown(null);
        setDropdownPosition(null);
      } else {
        const rect = e.currentTarget.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownHeight = 180; // Approximate height of dropdown
        
        // Check if dropdown would overflow viewport
        const spaceBelow = viewportHeight - rect.bottom;
        const shouldShowAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
        
        setDropdownPosition({
          top: shouldShowAbove 
            ? rect.top + window.scrollY - dropdownHeight - 8
            : rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX + rect.width / 2 - 75
        });
        setActiveStatusDropdown(campId);
      }
    };

    return (
      <>
        <div className="relative status-dropdown">
          <button
            onClick={handleButtonClick}
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer hover:shadow-md transform hover:scale-105 transition-all duration-200 ${
              statusStyles[status as keyof typeof statusStyles]
            }`}
          >
            <span>{statusLabels[status as keyof typeof statusLabels] || status}</span>
            <ChevronDown className={`ml-1.5 h-3 w-3 transition-transform duration-200 ${
              activeStatusDropdown === campId ? 'rotate-180' : ''
            }`} />
          </button>
        </div>

        {/* Portal Dropdown Menu */}
        {activeStatusDropdown === campId && dropdownPosition && createPortal(
          <div 
            className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl z-[9999] min-w-[150px] max-h-[200px] overflow-y-auto py-1 animate-in fade-in slide-in-from-top-2 duration-200"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left
            }}
            onWheel={(e) => e.stopPropagation()} // Prevent page scroll when scrolling inside dropdown
          >
            {allStatuses.map((statusOption) => (
              <button
                key={statusOption.value}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusUpdate(campId, statusOption.value);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-150 flex items-center space-x-2 hover:bg-gray-50 ${
                  status === statusOption.value 
                    ? 'bg-blue-50 text-blue-700 font-semibold' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  statusOption.value === 'scheduled' ? 'bg-blue-500' :
                  statusOption.value === 'ongoing' ? 'bg-yellow-500' :
                  statusOption.value === 'completed' ? 'bg-green-500' :
                  'bg-red-500'
                }`} />
                <span className="flex-1">{statusOption.label}</span>
                {status === statusOption.value && (
                  <span className="text-blue-600 flex-shrink-0">✓</span>
                )}
              </button>
            ))}
          </div>,
          document.body
        )}
      </>
    );
  };

  const columns: TableColumn[] = [
    {
  key: 'campName',
  label: 'शिविर का नाम',
  render: (value, row) => (
    <div>
      <p className="font-medium text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{row.location}</p>
    </div>
  ),
},

    {
      key: 'date',
      label: 'तारीख और समय',
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900">{new Date(value).toLocaleDateString('en-IN')}</p>
          <p className="text-sm text-gray-500">{row.time}</p>
        </div>
      ),
    },
{
  key: 'doctors',
  label: 'डॉक्टर',
  sortable: false,
  render: (value: string[]) => {
    return (
      <div className="space-y-1">
        {value.slice(0, 2).map((doctorId) => {
          const doctor = doctors.find((d) => d.id === doctorId);
          return doctor ? (
            <p key={doctorId} className="text-sm text-gray-900">
              {doctor.name}
            </p>
          ) : (
            <p key={doctorId} className="text-sm text-red-500 italic">
               {doctorId}
            </p>
          );
        })}
        {value.length > 2 && (
          <p className="text-xs text-gray-500">+{value.length - 2} और</p>
        )}
      </div>
    );
  },
},



    
    {
      key: 'status',
      label: 'स्थिति',
      render: (value, row) => getStatusBadge(value, row.id),
    },
    {
      key: 'beneficiaries',
      label: 'लाभार्थी',
      render: (_, row) => (
        <div>
          <p className="font-medium text-gray-900">{row.expectedBeneficiaries}</p>
        </div>
      ),
    },
    
    {
      key: 'actions',
      label: 'कार्य',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          {/* <button
            onClick={() => console.log('View camp:', row.id)}
            className="p-1 text-gray-400 hover:text-primary-600"
          >
            <Eye className="h-4 w-4" />
          </button> */}
          <button
            onClick={() => openEditModal(row)}
            className="p-1 text-gray-400 hover:text-primary-600"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setDeletingCamp(row);
              setShowConfirmDialog(true);
            }}
            className="p-1 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">स्वास्थ्य शिविर</h1>
          <p className="text-gray-600">स्वास्थ्य शिविरों का प्रबंधन और अनुसूची</p>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            setEditingCamp(null);
            resetForm();
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>नया शिविर जोड़ें</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">निर्धारित</p>
              <p className="text-2xl font-bold text-gray-900">
                {camps.filter(camp => camp.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">पूर्ण</p>
              <p className="text-2xl font-bold text-gray-900">
                {camps.filter(camp => camp.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">चल रहा</p>
              <p className="text-2xl font-bold text-gray-900">
                {camps.filter(camp => camp.status === 'ongoing').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">इस महीने</p>
              <p className="text-2xl font-bold text-gray-900">
                {camps.filter(camp => 
                  new Date(camp.date).getMonth() === new Date().getMonth() &&
                  new Date(camp.date).getFullYear() === new Date().getFullYear()
                ).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Camps Table */}
      <DataTable data={camps} columns={columns} />

      {/* Add/Edit Camp Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
                 onClick={() => {
                   setShowAddModal(false);
                   setEditingCamp(null);
                   resetForm();
                 }} />
            
            <div className="inline-block w-full max-w-4xl p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              {/* Modal Header - UPDATED: Changed to admin portal theme colors */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-t-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-8 w-8" />
                    <div>
                      <h1 className="text-2xl font-bold">
                        {editingCamp ? 'स्वास्थ्य शिविर संपादित करें' : 'नया स्वास्थ्य शिविर बनाएं'}
                      </h1>
                      <p className="text-primary-100 mt-1">
                        {editingCamp ? 'शिविर की जानकारी अपडेट करें' : 'नए स्वास्थ्य शिविर की जानकारी दर्ज करें'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingCamp(null);
                      resetForm();
                    }}
                    className="text-primary-100 hover:text-white transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <form className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">बुनियादी जानकारी</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="campName" className="block text-sm font-medium text-gray-700 mb-2">
                          शिविर का नाम *
                        </label>
                        <input
                          type="text"
                          id="campName"
                          name="campName"
                          value={formData.campName}
                          onChange={handleInputChange}
                          className={`input-field ${errors.campName ? 'border-red-500' : ''}`}
                          placeholder="उदाहरण: दुर्ग स्वास्थ्य शिविर"
                        />
                        {errors.campName && (
                          <p className="mt-1 text-sm text-red-600">{errors.campName}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                          स्थान *
                        </label>
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className={`input-field ${errors.location ? 'border-red-500' : ''}`}
                          placeholder="उदाहरण: दुर्ग सामुदायिक केंद्र"
                        />
                        {errors.location && (
                          <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                        पूरा पता *
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        rows={3}
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`input-field resize-none ${errors.address ? 'border-red-500' : ''}`}
                        placeholder="शिविर का पूरा पता लिखें..."
                      />
                      {errors.address && (
                        <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                      )}
                    </div>
                  </div>

                  {/* Doctor Assignment */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">डॉक्टर का चयन</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        नियुक्त डॉक्टर * (एक से अधिक डॉक्टर चुन सकते हैं)
                      </label>
                      
                      {/* Button to open doctor selection dialog */}
                      <button
                        type="button"
                        onClick={() => setShowDoctorDialog(true)}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full md:w-auto"
                      >
                        <Plus className="h-4 w-4" />
                        <span>डॉक्टर चुनें</span>
                      </button>

                      {errors.assignedDoctors && (
                        <p className="mt-2 text-sm text-red-600">{errors.assignedDoctors}</p>
                      )}

                      {/* Selected doctors display - UPDATED: Changed to admin portal theme colors */}
                      {formData.assignedDoctors.length > 0 && (
  <div className="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
    <h4 className="text-sm font-medium text-primary-800 mb-3">
      चयनित डॉक्टर ({formData.assignedDoctors.length}):
    </h4>
    <div className="space-y-2">
      {formData.assignedDoctors.map(doctorId => {
        const doctor = doctors.find(d => d.name === doctorId);
        return doctor ? (
          <div key={doctor.id} className="flex items-center justify-between text-sm bg-white p-3 rounded border shadow-sm">
            <div className="flex-1">
              <div className="font-medium text-gray-900">{doctor.name}</div>
              <div className="text-gray-600">{doctor.specialty}</div>
              <div className="text-xs text-gray-500">
                अनुभव: {doctor.experience} वर्ष | {doctor.qualification?.join(', ')}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDoctorToggle(doctor.id)}
              className="ml-3 text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50"
            >
              हटाएं
            </button>
          </div>
        ) : (
          <div key={doctorId} className="text-sm text-red-500">
            डॉक्टर ID {doctorId} का डेटा नहीं मिला
          </div>
        );
      })}
    </div>
  </div>
)}

                    </div>
                  </div>

                  {/* Date and Time */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">दिनांक और समय</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                          तारीख *
                        </label>
                        <input
                          type="date"
                          id="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                          className={`input-field ${errors.date ? 'border-red-500' : ''}`}
                        />
                        {errors.date && (
                          <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                          शुरुआती समय *
                        </label>
                        <input
                          type="time"
                          id="startTime"
                          name="startTime"
                          value={formData.startTime}
                          onChange={handleInputChange}
                          className={`input-field ${errors.startTime ? 'border-red-500' : ''}`}
                        />
                        {errors.startTime && (
                          <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                          समाप्ति समय *
                        </label>
                        <input
                          type="time"
                          id="endTime"
                          name="endTime"
                          value={formData.endTime}
                          onChange={handleInputChange}
                          className={`input-field ${errors.endTime ? 'border-red-500' : ''}`}
                        />
                        {errors.endTime && (
                          <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="expectedPatients" className="block text-sm font-medium text-gray-700 mb-2">
                          अपेक्षित मरीज़ *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            id="expectedPatients"
                            name="expectedPatients"
                            value={formData.expectedPatients}
                            onChange={handleInputChange}
                            min="1"
                            className={`input-field pr-10 ${errors.expectedPatients ? 'border-red-500' : ''}`}
                            placeholder="50"
                          />
                          <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                        {errors.expectedPatients && (
                          <p className="mt-1 text-sm text-red-600">{errors.expectedPatients}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Services checkbox - UPDATED: Changed to admin portal theme colors */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">उपलब्ध सेवाएं *</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {availableServices.map((service) => (
                        <label key={service} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.services.includes(service)}
                            onChange={() => handleServiceToggle(service)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{service}</span>
                        </label>
                      ))}
                    </div>
                    {errors.services && (
                      <p className="mt-2 text-sm text-red-600">{errors.services}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      अतिरिक्त विवरण
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="input-field resize-none"
                      placeholder="शिविर के बारे में अतिरिक्त जानकारी..."
                    />
                  </div>
                </form>
              </div>

              {/* Modal Footer - UPDATED: Changed save button to admin portal theme colors */}
              <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCamp(null);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={editingCamp ? handleEditCamp : handleAddCamp}
                  disabled={isLoading}
                  className={`px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center space-x-2 ${
                    isLoading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>सहेजा जा रहा है...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>{editingCamp ? 'शिविर अपडेट करें' : 'शिविर बनाएं'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Selection Dialog */}
      {showDoctorDialog && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDoctorDialog(false);
              setSearchTerm('');
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">डॉक्टर चुनें</h3>
              <button
                onClick={() => setShowDoctorDialog(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Search Bar - UPDATED: Changed focus colors to admin portal theme */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="डॉक्टर का नाम, विशेषता या योग्यता खोजें..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Doctor List - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map((doctor) => (
                    <label
                      key={doctor.id}
                      className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.assignedDoctors.includes(doctor.id)}
                        onChange={() => handleDoctorToggle(doctor.id)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                        <div className="text-sm text-gray-600">{doctor.specialty}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          अनुभव: {doctor.experience} वर्ष | {doctor.qualification}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          📞 {doctor.phone} | 📧 {doctor.email}
                        </div>
                      </div>
                    </label>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-sm">कोई डॉक्टर नहीं मिला</div>
                    <div className="text-xs mt-1">अपना खोज शब्द बदलकर पुनः प्रयास करें</div>
                  </div>
                )}
              </div>
            </div>

            {/* Dialog Footer - UPDATED: Changed complete button to admin portal theme colors */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {formData.assignedDoctors.length} डॉक्टर चयनित
                </div>
                <div className="space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowDoctorDialog(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDoctorDialog(false);
                      setSearchTerm('');
                    }}
                    className="px-4 py-2 text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                  >
                    पूर्ण
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDeleteCamp}
        title="शिविर हटाएं"
        message={`क्या आप वाकई ${deletingCamp?.location} स्थान पर शिविर को हटाना चाहते हैं? यह कार्य वापस नहीं किया जा सकता।`}
        type="danger"
        confirmText="हटाएं"
        cancelText="रद्द करें"
      />
    </div>
  );
};

export default Camps;
