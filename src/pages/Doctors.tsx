import React, { useState,useEffect } from 'react';
import { Plus, Stethoscope, Award, Phone, Mail, Edit, Trash2 } from 'lucide-react';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import { mockCamps } from '../data/mockData';
import type { Doctor, TableColumn } from '../types/interfaces';
import serverUrl from './Server';
import axios from 'axios';
const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [deletingDoctor, setDeletingDoctor] = useState<Doctor | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showQualificationDropdown, setShowQualificationDropdown] = useState(false);


  const [formData, setFormData] = useState({
    name: '',
    hospitalType: '',
    hospitalName: '',
    specialty: '',
    phone: '',
    email: '',
    password: '',
    experience: '',
    qualification: [] as string[],          // Changed to string[] to match the interface
    assignedCamps: [] as string[],
  });

  //=================use effect to load data
useEffect(() => {
  const fetchDoctors = async () => {
    try {
      const endpoint = `${serverUrl}show_doctor_1.php`;
      const response = await axios.post(endpoint, {});
      const data = response.data;

      const loadedDoctors: Doctor[] = data.posts.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        hospitalType: doc.hospitalType || '',
        hospitalName: doc.hospitalName || '',
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


//////end of use effect

//==============validation function
const validateDoctorForm = () => {
  const nameRegex = /^[a-zA-Z\s\u0900-\u097F]+$/; // Includes Hindi/Devanagari
  const phoneRegex = /^[0-9]{10}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!formData.name.trim() || !nameRegex.test(formData.name)) {
    alert("कृपया मान्य नाम दर्ज करें (केवल अक्षर)।");
    return false;
  }

  if (!formData.specialty.trim()) {
    alert("कृपया विशेषज्ञता चुनें।");
    return false;
  }

  if (!formData.phone.trim() || !phoneRegex.test(formData.phone)) {
    alert("कृपया 10 अंकों का मान्य फ़ोन नंबर दर्ज करें।");
    return false;
  }

  if (!formData.email.trim() || !emailRegex.test(formData.email)) {
    alert("कृपया मान्य ईमेल पता दर्ज करें।");
    return false;
  }

  if (!editingDoctor && (!formData.password.trim() || formData.password.length < 6)) {
    alert("पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।");
    return false;
  }

  if (
    formData.experience === "" ||
    isNaN(Number(formData.experience)) ||
    Number(formData.experience) <= 0
  ) {
    alert("कृपया अनुभव के लिए एक मान्य संख्या (> 0) दर्ज करें।");
    return false;
  }

  if (!formData.qualification || formData.qualification.length === 0) {
    alert("कृपया कम से कम एक योग्यता चुनें।");
    return false;
  }

  return true;
};

//=================


const handleAddDoctor = async () => {
  // Frontend Validation
  const nameRegex = /^[a-zA-Z\s]+$/;
  const phoneRegex = /^[0-9]{10}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!formData.name.trim() || !nameRegex.test(formData.name)) {
    alert('Please enter a valid name (letters only).');
    return;
  }

  if (!formData.specialty.trim()) {
    alert('Specialty is required.');
    return;
  }

  if (!formData.phone.trim() || !phoneRegex.test(formData.phone)) {
    alert('Please enter a valid 10-digit phone number.');
    return;
  }

  if (!formData.email.trim() || !emailRegex.test(formData.email)) {
    alert('Please enter a valid email address.');
    return;
  }

  if (!formData.password.trim() || formData.password.length < 6) {
    alert('Password must be at least 6 characters long.');
    return;
  }

  if (isNaN(Number(formData.experience)) || Number(formData.experience) <= 0) {
    alert('Experience must be 1 or more years.');
    return;
  }

  if (!formData.qualification || formData.qualification.length === 0) {
    alert('Please select at least one qualification.');
    return;
  }

  if (
    formData.assignedCamps &&
    Array.isArray(formData.assignedCamps) &&
    formData.assignedCamps.some((camp) => !camp.trim())
  ) {
    alert('Assigned camps contain empty values.');
    return;
  }

  // Optional: Validate hospitalType and hospitalName if provided
  if (formData.hospitalType && !formData.hospitalType.trim()) {
    alert('Hospital type cannot be just spaces.');
    return;
  }

  if (formData.hospitalName && !formData.hospitalName.trim()) {
    alert('Hospital name cannot be just spaces.');
    return;
  }

  const endpoint = `${serverUrl}add_doctor_1.php`;

  try {
    await axios.post(endpoint, {
      id: '0',
      name: formData.name.trim(),
      hospitalType: formData.hospitalType.trim(),
      hospitalName: formData.hospitalName.trim(),
      specialty: formData.specialty.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      password: formData.password.trim(),
      experience: Number(formData.experience),
      qualification: formData.qualification.join(','),
      assignedCamps: formData.assignedCamps.join(','),
    });

    alert('Doctor has been added!!');

    // Refresh the doctors list by fetching from backend
    const refreshEndpoint = `${serverUrl}show_doctor_1.php`;
    const refreshResponse = await axios.post(refreshEndpoint, {});
    const refreshData = refreshResponse.data;

    const updatedDoctors: Doctor[] = refreshData.posts.map((doc: any) => ({
      id: doc.id,
      name: doc.name,
      hospitalType: doc.hospitalType || '',
      hospitalName: doc.hospitalName || '',
      specialty: doc.specialty,
      phone: doc.phone,
      email: doc.email,
      avatar: doc.avatar || '',
      experience: Number(doc.experience),
      qualification: doc.qualification
        ? doc.qualification.split(',').map((q: string) => q.trim())
        : [],
      assignedCamps: doc.assignedCamps
        ? doc.assignedCamps.split(',').map((c: string) => c.trim())
        : []
    }));

    setDoctors(updatedDoctors);

  } catch (error) {
    console.error('Error adding doctor:', error);
    alert('Failed to add doctor.');
  }

  setShowAddModal(false);
  resetForm();
};



  const handleEditDoctor = async () => {
  if (!editingDoctor) return;

  const endpoint = `${serverUrl}update_doctor_1.php`;

  try {
    await axios.post(endpoint, {
      id: editingDoctor.id,
      name: formData.name,
      hospitalType: formData.hospitalType,
      hospitalName: formData.hospitalName,
      specialty: formData.specialty,
      phone: formData.phone,
      email: formData.email,
      password: formData.password,
      experience: parseInt(formData.experience, 10),
      qualification: formData.qualification.join(','),
      assignedCamps: formData.assignedCamps.join(','),  // ✅ convert to comma-separated string
      status: 'active',
    });

    alert('Doctor details have been updated!!');

    // Refresh the doctors list by fetching from backend
    const refreshEndpoint = `${serverUrl}show_doctor_1.php`;
    const refreshResponse = await axios.post(refreshEndpoint, {});
    const refreshData = refreshResponse.data;

    const updatedDoctors: Doctor[] = refreshData.posts.map((doc: any) => ({
      id: doc.id,
      name: doc.name,
      hospitalType: doc.hospitalType || '',
      hospitalName: doc.hospitalName || '',
      specialty: doc.specialty,
      phone: doc.phone,
      email: doc.email,
      avatar: doc.avatar || '',
      experience: Number(doc.experience),
      qualification: doc.qualification
        ? doc.qualification.split(',').map((q: string) => q.trim())
        : [],
      assignedCamps: doc.assignedCamps
        ? doc.assignedCamps.split(',').map((c: string) => c.trim())
        : []
    }));

    setDoctors(updatedDoctors);

    // Close modal and reset
    setEditingDoctor(null);
    setShowAddModal(false); // ✅ Hide modal after edit
    resetForm();

  } catch (error) {
    console.error('Error updating doctor:', error);
    alert('Failed to update doctor.');
  }
};



  const handleDeleteDoctor = async () => {
  const endpoint = `${serverUrl}delete_doctor.php`;
  if (!deletingDoctor) return;
  
  try {
    await axios.post(endpoint, {
      id: deletingDoctor.id,
    });

    alert('Doctor has been deleted!!');

    // Refresh the doctors list by fetching from backend
    const refreshEndpoint = `${serverUrl}show_doctor_1.php`;
    const refreshResponse = await axios.post(refreshEndpoint, {});
    const refreshData = refreshResponse.data;

    const updatedDoctors: Doctor[] = refreshData.posts.map((doc: any) => ({
      id: doc.id,
      name: doc.name,
      hospitalType: doc.hospitalType || '',
      hospitalName: doc.hospitalName || '',
      specialty: doc.specialty,
      phone: doc.phone,
      email: doc.email,
      avatar: doc.avatar || '',
      experience: Number(doc.experience),
      qualification: doc.qualification
        ? doc.qualification.split(',').map((q: string) => q.trim())
        : [],
      assignedCamps: doc.assignedCamps
        ? doc.assignedCamps.split(',').map((c: string) => c.trim())
        : []
    }));

    setDoctors(updatedDoctors);
    setShowConfirmDialog(false);
    setDeletingDoctor(null);

  } catch (error) {
    console.error('Error deleting doctor:', error);
    alert('Failed to delete doctor.');
  }

  resetForm();
};


  const resetForm = () => {
    setFormData({
      name: '',
      hospitalType: '',
      hospitalName: '',
      specialty: '',
      phone: '',
      email: '',
      password: '',
      experience: '',
      qualification: [],
      assignedCamps: [],
    });
  };

  const openEditModal = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      hospitalType: doctor.hospitalType || '',
      hospitalName: doctor.hospitalName || '',
      specialty: doctor.specialty,
      phone: doctor.phone,
      email: doctor.email,
      password: '', // Empty password for editing
      experience: doctor.experience.toString(),
      qualification: doctor.qualification,
      assignedCamps: doctor.assignedCamps,
    });
    setShowAddModal(true);
  };

  const columns: TableColumn[] = [
    {
      key: 'name',
      label: 'चिकित्सक',
      render: (value, row) => (
        <div className="flex items-center">
          
          <div className="ml-4">
            <p className="font-medium text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{row.qualification.join(', ')}</p>
            {row.hospitalName && (
              <p className="text-xs text-gray-400">
                {row.hospitalType === 'government' ? 'सरकारी' : 'निजी'} - {row.hospitalName}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'specialty',
      label: 'विशेषज्ञता',
      render: (value) => (
        <div className="flex items-center">
          <Stethoscope className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: 'experience',
      label: 'अनुभव',
      render: (value) => (
        <div className="flex items-center">
          <Award className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-gray-900">{value} वर्ष</span>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'संपर्क',
      render: (value) => (
        <div className="space-y-1">
          <div className="flex items-center">
            <Phone className="h-3 w-3 text-gray-400 mr-2" />
            <span className="text-sm text-gray-900">{value}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'ईमेल',
      sortable: false,
      render: (value) => (
        <div className="flex items-center">
          <Mail className="h-3 w-3 text-gray-400 mr-2" />
          <span className="text-sm text-gray-900">{value}</span>
        </div>
      ),
    },

    {
      key: 'actions',
      label: 'कार्य',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-1 text-gray-400 hover:text-primary-600"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setDeletingDoctor(row);
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

//isko english mei kiya hu
 const specialties = [
  'General Medicine',
  'Cardiologist',
  'Orthopedic Specialist',
  'Gynecologist',
  'Pediatrician',
  'Dermatologist',
  'Ophthalmologist',
  'ENT Specialist',
  'Neurologist',
  'Psychiatrist',
];
// Qualifications add kiya hu ----------
const qualifications = [
  'MBBS',
  'MD',
  'MS',
  'BDS',
  'MDS',
  'BAMS',
  'BHMS',
  'BUMS',
  'BNYS',
  'DNB',
  'PhD',
  'MCh',
  'DM'
];
// yaha tak change kiya hu
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">चिकित्सक</h1>
          <p className="text-gray-600">चिकित्सा पेशेवरों का प्रबंधन</p>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            setEditingDoctor(null);
            resetForm();
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>नया चिकित्सक जोड़ें</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Stethoscope className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">कुल चिकित्सक</p>
              <p className="text-2xl font-bold text-gray-900">{doctors.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">औसत अनुभव</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(doctors.reduce((sum, doctor) => sum + doctor.experience, 0) / doctors.length)} वर्ष
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Stethoscope className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">विशेषज्ञताएं</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(doctors.map(doctor => doctor.specialty)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Plus className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">नए चिकित्सक</p>
              <p className="text-2xl font-bold text-gray-900">
                {doctors.filter(doctor => doctor.experience <= 2).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Doctors Table */}
      <DataTable data={doctors} columns={columns} />

      {/* Add/Edit Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
            
            <div className="inline-block w-full max-w-2xl p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingDoctor ? 'चिकित्सक संपादित करें' : 'नया चिकित्सक जोड़ें'}
              </h3>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    पूरा नाम
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="डॉक्टर का पूरा नाम दर्ज करें"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    अस्पताल का प्रकार
                  </label>
                  <select
                    value={formData.hospitalType}
                    onChange={(e) => setFormData({ ...formData, hospitalType: e.target.value })}
                    className="input-field"
                  >
                    <option value="">अस्पताल का प्रकार चुनें</option>
                    <option value="government">सरकारी</option>
                    <option value="private">निजी</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    अस्पताल का नाम
                  </label>
                  <input
                    type="text"
                    value={formData.hospitalName}
                    onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                    className="input-field"
                    placeholder="अस्पताल का नाम दर्ज करें"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    विशेषज्ञता
                  </label>
                  <select
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="input-field"
                  >
                    <option value="">विशेषज्ञता चुनें</option>
                    {specialties.map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      फ़ोन नंबर
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-field"
                      placeholder="फ़ोन नंबर दर्ज करें"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      अनुभव (वर्षों में)
                    </label>
                    <input
                      type="number"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="input-field"
                      placeholder="कितने वर्षों का अनुभव"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ईमेल
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    placeholder="ईमेल पता दर्ज करें"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    पासवर्ड
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field"
                    placeholder={editingDoctor ? "नया पासवर्ड दर्ज करें (खाली छोड़ें यदि नहीं बदलना है)" : "पासवर्ड दर्ज करें"}
                  />
                </div>

               <div className="relative" id="qualification-dropdown">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    योग्यता
  </label>

  {/* Dropdown Button */}
  <button
    type="button"
    onClick={() => setShowQualificationDropdown(!showQualificationDropdown)}
    className="input-field text-left cursor-pointer flex justify-between items-center"
  >
    <span>
      {formData.qualification.length > 0
        ? formData.qualification.join(', ')
        : 'योग्यता चुनें'}
    </span>

    {/* Arrow Icon */}
    <svg
      className={`w-4 h-4 ml-2 transform transition-transform duration-200 ${
        showQualificationDropdown ? 'rotate-180' : 'rotate-0'
      }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {/* Dropdown List */}
  {showQualificationDropdown && (
    <div className="absolute z-10 mt-2 w-full max-h-40 overflow-y-auto rounded-md bg-white border border-gray-300 shadow-lg">
      {qualifications.map((qual) => (
        <label
          key={qual}
          className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
        >
          <input
            type="checkbox"
            checked={formData.qualification.includes(qual)}
            onChange={(e) => {
              if (e.target.checked) {
                setFormData({
                  ...formData,
                  qualification: [...formData.qualification, qual],
                });
              } else {
                setFormData({
                  ...formData,
                  qualification: formData.qualification.filter((q) => q !== qual),
                });
              }
            }}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">{qual}</span>
        </label>
      ))}
    </div>
  )}
</div>



                <div>
                  {/* yaha change kiya hu */}
                  {/* <label className="block text-sm font-medium text-gray-700 mb-1">
                    शिविर नियुक्ति
                  </label> */}
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {mockCamps.filter(camp => camp.status === 'scheduled').map(camp => (
                      <label key={camp.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.assignedCamps.includes(camp.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                assignedCamps: [...formData.assignedCamps, camp.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                assignedCamps: formData.assignedCamps.filter(id => id !== camp.id)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {camp.location} - {new Date(camp.date).toLocaleDateString('en-IN')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingDoctor(null);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  रद्द करें
                </button>
                <button
  onClick={() => {
    if (validateDoctorForm()) {
      editingDoctor ? handleEditDoctor() : handleAddDoctor();
    }
  }}
  className="btn-primary"
>
  {editingDoctor ? 'चिकित्सक अपडेट करें' : 'चिकित्सक जोड़ें'}
</button>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDeleteDoctor}
        title="चिकित्सक हटाएं"
        message={`क्या आप वाकई डॉ. ${deletingDoctor?.name} को हटाना चाहते हैं? इस कार्य को वापस नहीं किया जा सकता.`}
        type="danger"
        confirmText="हटाएं"
        cancelText="रद्द करें"
      />
    </div>
  );
};

export default Doctors;
