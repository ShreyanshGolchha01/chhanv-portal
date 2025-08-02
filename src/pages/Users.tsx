import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Building,
  Calendar,
  ChevronDown,
  Download,
  FileText,
  Activity
} from 'lucide-react';
import serverUrl from './Server';
import type { Patient } from '../types/interfaces';
import * as XLSX from 'xlsx';

const Users: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ department: '', joiningYear: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showHealthReportModal, setShowHealthReportModal] = useState(false);
  const [selectedPatient] = useState<Patient | null>(null);
  const [healthReportData] = useState<any>(null);
  const [isLoadingReport] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // const openHealthReportPopup = async (patient: Patient) => {
  //   setSelectedPatient(patient);
  //   setIsLoadingReport(true);
  //   setShowHealthReportModal(true);
    
  //   try {
  //     // Fetch complete health reports for this patient
  //     const response = await axios.post(`${serverUrl}get_health_records.php`, {
  //       patient_id: patient.id
  //     });
      
  //     console.log('Health Report Response:', response.data);
      
  //     if (response.data && response.data.posts && response.data.posts.length > 0) {
  //       // Get all reports sorted by date (latest first)
  //       const allReports = response.data.posts.sort((a: any, b: any) => 
  //         new Date(b.date).getTime() - new Date(a.date).getTime()
  //       );
  //       setHealthReportData(allReports);
  //     } else {
  //       setHealthReportData(null);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching health report:', error);
  //     setHealthReportData(null);
  //     alert('स्वास्थ्य रिपोर्ट लोड करने में त्रुटि हुई');
  //   } finally {
  //     setIsLoadingReport(false);
  //   }
  // };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.post(`${serverUrl}show_Patients.php`, {});
        const data = response.data;

        const loadedPatients = data.posts.map((post: any) => ({
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
          hasAyushmanCard: post.hasAyushmanCard,
          // reportSummary: post.reportSummary || '', // ✅ Added this
        }));

        setPatients(loadedPatients);
      } catch (error) {
        console.error('Error loading patients:', error);
      }
    };

    fetchPatients();
  }, []);

  const generatePDF = async (user: Patient) => {
    // Try to fetch health reports for PDF
    let healthReportsForPDF: any[] = [];
    
    try {
      const response = await axios.post(`${serverUrl}get_health_records.php`, {
        patient_id: user.id
      });
      
      if (response.data && response.data.posts && response.data.posts.length > 0) {
        healthReportsForPDF = response.data.posts.sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      }
    } catch (error) {
      console.error('Error fetching health reports for PDF:', error);
    }

    // Create detailed PDF content with health reports
    let pdfContent = `
मरीज़ का संपूर्ण स्वास्थ्य रिपोर्ट
=====================================

व्यक्तिगत जानकारी:
-----------------
नाम: ${user.name}
आयु: ${user.age} वर्ष
लिंग: ${user.gender === 'male' ? 'पुरुष' : user.gender === 'female' ? 'महिला' : 'अन्य'}
रक्त समूह: ${user.bloodGroup || 'अज्ञात'}
जन्म तिथि: ${new Date(user.dateOfBirth).toLocaleDateString('hi-IN')}

संपर्क विवरण:
-----------
फोन: ${user.phone}
ईमेल: ${user.email || 'उपलब्ध नहीं'}
पता: ${user.address || 'उपलब्ध नहीं'}

चिकित्सा जानकारी:
---------------
विभाग: ${user.department || 'अज्ञात'}
अंतिम जांच: ${new Date(user.lastVisit).toLocaleDateString('hi-IN')}
स्वास्थ्य स्थिति: ${user.healthStatus || 'सामान्य'}
परिवारिक सदस्य: ${user.familyMembers || 0}

अन्य विवरण:
----------
ABHA ID: ${user.hasAbhaId === 'yes' ? 'हाँ' : 'नहीं'}
आयुष्मान कार्ड: ${user.hasAyushmanCard === 'yes' ? 'हाँ' : 'नहीं'}

`;

    // Add health reports if available
    if (healthReportsForPDF.length > 0) {
      pdfContent += `
विस्तृत स्वास्थ्य रिपोर्ट्स:
========================

कुल रिपोर्ट्स: ${healthReportsForPDF.length}

`;

      healthReportsForPDF.forEach((report: any, index: number) => {
        pdfContent += `
${index + 1}. रिपोर्ट दिनांक: ${new Date(report.date).toLocaleDateString('hi-IN')}
   -------------------------------------------
   डॉक्टर: ${report.doctor_name || 'अज्ञात'}
   विभाग: ${report.department || user.department || 'अज्ञात'}
   
   जीवन संकेतक:
   तापमान: ${report.temperature || 'दर्ज नहीं'}
   नाड़ी: ${report.pulse || 'दर्ज नहीं'}
   रक्तचाप: ${report.blood_pressure || 'दर्ज नहीं'}
   वजन: ${report.weight || 'दर्ज नहीं'}
   
   निदान: ${report.diagnosis || 'कोई विशेष निदान नहीं'}
   
   उपचार/दवाएं: ${report.treatment || report.medicines || 'कोई विशेष उपचार नहीं'}
   
   ${report.notes ? `डॉक्टर की टिप्पणी: ${report.notes}` : ''}

`;
      });
    } else {
      pdfContent += `
विस्तृत स्वास्थ्य रिपोर्ट्स:
========================

❌ कोई विस्तृत स्वास्थ्य रिपोर्ट उपलब्ध नहीं है।
कृपया नियमित स्वास्थ्य जांच कराएं।

`;
    }

    pdfContent += `
रिपोर्ट तैयार की गई: ${new Date().toLocaleDateString('hi-IN')} ${new Date().toLocaleTimeString('hi-IN')}
----------------------------------------
छांव स्वास्थ्य शिविर - SSIPMT, Raipur
    `;

    // Create and download PDF
    const element = document.createElement('a');
    const file = new Blob([pdfContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${user.name}_Complete_Health_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    alert(`${user.name} की संपूर्ण स्वास्थ्य रिपोर्ट डाउनलोड हो गई!`);
  };

  const filteredData = patients.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);

    const matchesDepartment =
      !filters.department || user.department === filters.department;

    const matchesJoiningYear =
      !filters.joiningYear ||
      new Date(user.lastVisit).getFullYear().toString() === filters.joiningYear;

    return matchesSearch && matchesDepartment && matchesJoiningYear;
  });

  const resetFilters = () => {
    setFilters({ department: '', joiningYear: '' });
  };

  const departments = Array.from(new Set(patients.map((p) => p.department).filter(Boolean)));

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const exportFilteredData = async () => {
    setIsExporting(true);
    try {
      // Use current filtered data
      const dataToExport = filteredData;

      // Prepare formatted user data for Excel
      const formattedUsers = dataToExport.map((user: Patient) => ({
        'नाम': user.name || '',
        'आयु': user.age || '',
        'लिंग': user.gender === 'male' ? 'पुरुष' : user.gender === 'female' ? 'महिला' : user.gender || '',
        'फोन': user.phone || '',
        'ईमेल': user.email || '',
        'पता': user.address || '',
        'रक्त समूह': user.bloodGroup || '',
        'विभाग': user.department || '',
        'स्वास्थ्य स्थिति': user.healthStatus || '',
        'परिवारिक सदस्य': user.familyMembers || 0,
        'ABHA ID': user.hasAbhaId === 'yes' ? 'हाँ' : 'नहीं',
        'आयुष्मान कार्ड': user.hasAyushmanCard === 'yes' ? 'हाँ' : 'नहीं',
        'अंतिम जांच': user.lastVisit ? new Date(user.lastVisit).toLocaleDateString('hi-IN') : '',
        'जन्म तिथि': user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('hi-IN') : ''
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();
      const usersSheet = XLSX.utils.json_to_sheet(formattedUsers);
      XLSX.utils.book_append_sheet(wb, usersSheet, 'फिल्टर किया गया डेटा');

      // Export to Excel
      const fileName = `Chhanv_Filtered_Data_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      alert(`📊 फिल्टर किया गया डेटा सफलतापूर्वक Excel में निर्यात हो गया!\n\n📁 फ़ाइल: ${fileName}\n👥 मरीज़: ${formattedUsers.length}`);
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ डेटा निर्यात करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsExporting(false);
    }
  };

  const exportAllData = async () => {
    setIsExporting(true);
    try {
      // Fetch users
      const usersRes = await axios.post(`${serverUrl}show_Patients.php`, {});
      const users = usersRes.data.posts || [];

      // Fetch relatives
      let relatives = [];
      try {
        const relativesRes = await axios.post(`${serverUrl}get_family_members.php`, {});
        relatives = relativesRes.data.posts || [];
      } catch (error) {
        console.log('Family members API not available');
      }

      // Prepare formatted user data for Excel
      const formattedUsers = users.map((user: any) => ({
        'नाम': user.name || '',
        'आयु': user.age || '',
        'लिंग': user.gender === 'male' ? 'पुरुष' : user.gender === 'female' ? 'महिला' : user.gender || '',
        'फोन': user.phone || '',
        'ईमेल': user.email || '',
        'पता': user.address || '',
        'रक्त समूह': user.bloodGroup || '',
        'विभाग': user.department || '',
        'स्वास्थ्य स्थिति': user.healthStatus || '',
        'परिवारिक सदस्य': user.familyMembers || 0,
        'ABHA ID': user.hasAbhaId === 'yes' ? 'हाँ' : 'नहीं',
        'आयुष्मान कार्ड': user.hasAyushmanCard === 'yes' ? 'हाँ' : 'नहीं',
        'अंतिम जांच': user.date ? new Date(user.date).toLocaleDateString('hi-IN') : '',
        'जन्म तिथि': user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('hi-IN') : ''
      }));

      // Prepare formatted relatives data for Excel
      const formattedRelatives = relatives.map((relative: any) => ({
        'परिवारिक सदस्य का नाम': relative.name || '',
        'आयु': relative.age || '',
        'लिंग': relative.gender === 'male' ? 'पुरुष' : relative.gender === 'female' ? 'महिला' : relative.gender || '',
        'रिश्ता': relative.relationship || '',
        'मुख्य सदस्य ID': relative.main_member_id || '',
        'फोन': relative.phone || '',
        'पता': relative.address || ''
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Add Users sheet
      const usersSheet = XLSX.utils.json_to_sheet(formattedUsers);
      XLSX.utils.book_append_sheet(wb, usersSheet, 'मरीज़ डेटा');

      // Add Relatives sheet if data exists
      if (formattedRelatives.length > 0) {
        const relativesSheet = XLSX.utils.json_to_sheet(formattedRelatives);
        XLSX.utils.book_append_sheet(wb, relativesSheet, 'परिवारिक सदस्य');
      }

      // Export to Excel
      const fileName = `Chhanv_Health_Data_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      alert(`📊 डेटा सफलतापूर्वक Excel में निर्यात हो गया!\n\n📁 फ़ाइल: ${fileName}\n👥 मरीज़: ${formattedUsers.length}\n👨‍👩‍👧‍👦 परिवारिक सदस्य: ${formattedRelatives.length}`);
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ डेटा निर्यात करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">मरीज़ और स्वास्थ्य रिकॉर्ड</h1>
          <p className="text-gray-600">कर्मचारी स्वास्थ्य रिकॉर्ड और परिवार का डेटा देखें</p>
        </div>
        <div className="flex space-x-3">
          {/* Export Filtered Data Button */}
          {filteredData.length !== patients.length && (
            <button 
              className={`btn-secondary flex items-center space-x-2 transition-colors ${
                isExporting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              onClick={exportFilteredData}
              disabled={isExporting}
              title={`वर्तमान फिल्टर किए गए ${filteredData.length} मरीज़ों का डेटा Excel में डाउनलोड करें`}
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>निर्यात हो रहा है...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>🔍 फिल्टर्ड डेटा ({filteredData.length})</span>
                </>
              )}
            </button>
          )}
          
          {/* Export All Data Button */}
          <button 
            className={`btn-primary flex items-center space-x-2 transition-colors ${
              isExporting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            onClick={exportAllData}
            disabled={isExporting}
            title="सभी मरीज़ों का डेटा Excel में डाउनलोड करें"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>निर्यात हो रहा है...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>📊 संपूर्ण डेटा</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="मरीज़ खोजें..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full max-w-md input-field"
                />
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <span>फिल्टर</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>
              {(filters.department || filters.joiningYear) && (
                <button
                  onClick={resetFilters}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  फिल्टर साफ़ करें
                </button>
              )}
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">विभाग</label>
                  <select
                    value={filters.department}
                    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                    className="input-field"
                  >
                    <option value="">सभी विभाग</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">नाम</th>
                <th className="hidden md:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">विभाग</th>
                <th className="hidden lg:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">ब्लड ग्रुप</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">संपर्क</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">कार्रवाई</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {/* Name + Email */}
                  <td className="px-3 py-4">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{row.name}</p>
                      <p className="text-xs text-gray-500">{row.email}</p>
                      {/* Show department and blood group on mobile */}
                      <div className="md:hidden mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 mr-2">
                          <Building className="h-3 w-3 mr-1" />
                          {row.department}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                          {row.bloodGroup}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Department - Hidden on mobile */}
                  <td className="hidden md:table-cell px-3 py-4">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 text-sm">{row.department}</span>
                    </div>
                  </td>

                  {/* Blood Group - Hidden on mobile/tablet */}
                  <td className="hidden lg:table-cell px-3 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 font-medium">
                      {row.bloodGroup}
                    </span>
                  </td>

                  {/* Phone */}
                  <td className="px-3 py-4">
                    <p className="text-sm text-gray-900">{row.phone}</p>
                    <p className="text-xs text-gray-500 hidden sm:block">{row.email}</p>
                  </td>

                  {/* Actions - Responsive buttons */}
                  <td className="px-3 py-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                      {/* PDF Button */}
                      <button
                        onClick={() => generatePDF(row)}
                        className="flex items-center justify-center space-x-1 px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors w-full sm:w-auto"
                        title="विस्तृत PDF रिपोर्ट डाउनलोड करें"
                      >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">PDF</span>
                        <span className="sm:hidden">PDF डाउनलोड</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Health Report Modal */}
        {showHealthReportModal && selectedPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="relative bg-white shadow-2xl rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200">
              <button
                onClick={() => setShowHealthReportModal(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-2xl z-10"
                aria-label="Close"
              >
                ✕
              </button>
              
              <div className="p-6">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-semibold text-gray-800 mb-2">📄 नवीनतम स्वास्थ्य रिपोर्ट</h2>
                  <p className="text-gray-600">{selectedPatient.name} के लिए</p>
                </div>

                {isLoadingReport ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <span className="ml-3 text-gray-600">रिपोर्ट लोड हो रही है...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Patient Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-blue-600" />
                        मरीज़ की जानकारी
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">👤 नाम:</span>
                          <span className="text-gray-800">{selectedPatient.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">🎂 आयु:</span>
                          <span className="text-gray-800">{selectedPatient.age} वर्ष</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">🩸 रक्त समूह:</span>
                          <span className="text-gray-800">{selectedPatient.bloodGroup || 'अज्ञात'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">📞 संपर्क:</span>
                          <span className="text-gray-800">{selectedPatient.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">🏢 विभाग:</span>
                          <span className="text-gray-800">{selectedPatient.department || 'अज्ञात'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Health Report Data */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-green-600" />
                        स्वास्थ्य विवरण
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">📅 अंतिम जांच:</span>
                          <span className="text-gray-800">{new Date(selectedPatient.lastVisit).toLocaleDateString('hi-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">🩺 स्वास्थ्य स्थिति:</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            selectedPatient.healthStatus === 'good' ? 'bg-green-100 text-green-800' :
                            selectedPatient.healthStatus === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {selectedPatient.healthStatus || 'सामान्य'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">👨‍👩‍👧‍👦 परिवारिक सदस्य:</span>
                          <span className="text-gray-800">{selectedPatient.familyMembers || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">🆔 ABHA ID:</span>
                          <span className="text-gray-800">{selectedPatient.hasAbhaId === 'yes' ? '✅ हाँ' : '❌ नहीं'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">💳 आयुष्मान कार्ड:</span>
                          <span className="text-gray-800">{selectedPatient.hasAyushmanCard === 'yes' ? '✅ हाँ' : '❌ नहीं'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Latest Health Report Details */}
                {healthReportData && Array.isArray(healthReportData) && healthReportData.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                      संपूर्ण स्वास्थ्य रिपोर्ट ({healthReportData.length} रिपोर्ट्स)
                    </h3>
                    
                    {/* Latest Report Highlight */}
                    <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                      <h4 className="font-semibold text-blue-800 mb-3">📋 नवीनतम रिपोर्ट</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">📅 तारीख:</span>
                            <span className="text-gray-800">{new Date(healthReportData[0].date).toLocaleDateString('hi-IN')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">👨‍⚕️ डॉक्टर:</span>
                            <span className="text-gray-800">{healthReportData[0].doctor_name || 'डॉ. अज्ञात'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">🏥 विभाग:</span>
                            <span className="text-gray-800">{healthReportData[0].department || selectedPatient.department || 'अज्ञात'}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">🌡️ तापमान:</span>
                            <span className="text-gray-800">{healthReportData[0].temperature || 'सामान्य'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">💗 नाड़ी:</span>
                            <span className="text-gray-800">{healthReportData[0].pulse || 'सामान्य'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">🩸 रक्तचाप:</span>
                            <span className="text-gray-800">{healthReportData[0].blood_pressure || 'सामान्य'}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Diagnosis and Treatment */}
                      <div className="mt-4 space-y-3">
                        <div>
                          <span className="font-medium text-gray-600 block mb-1">🔍 निदान:</span>
                          <p className="text-gray-800 p-3 bg-white rounded border">
                            {healthReportData[0].diagnosis || 'कोई विशेष निदान नहीं'}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600 block mb-1">💊 उपचार/दवाएं:</span>
                          <p className="text-gray-800 p-3 bg-white rounded border">
                            {healthReportData[0].treatment || healthReportData[0].medicines || 'कोई विशेष उपचार नहीं'}
                          </p>
                        </div>
                        {healthReportData[0].notes && (
                          <div>
                            <span className="font-medium text-gray-600 block mb-1">📝 डॉक्टर की टिप्पणी:</span>
                            <p className="text-gray-800 p-3 bg-white rounded border">
                              {healthReportData[0].notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* All Reports Timeline */}
                    {healthReportData.length > 1 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-4">📈 स्वास्थ्य इतिहास</h4>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {healthReportData.map((report: any, index: number) => (
                            <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-800">
                                    📅 {new Date(report.date).toLocaleDateString('hi-IN')}
                                  </span>
                                  {index === 0 && (
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                      नवीनतम
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-gray-500">
                                  👨‍⚕️ {report.doctor_name || 'डॉक्टर'}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                <div>
                                  <span className="font-medium text-gray-600">तापमान:</span>
                                  <span className="text-gray-800 ml-1">{report.temperature || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">नाड़ी:</span>
                                  <span className="text-gray-800 ml-1">{report.pulse || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">रक्तचाप:</span>
                                  <span className="text-gray-800 ml-1">{report.blood_pressure || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">वजन:</span>
                                  <span className="text-gray-800 ml-1">{report.weight || 'N/A'}</span>
                                </div>
                              </div>
                              
                              {report.diagnosis && (
                                <div className="mt-2">
                                  <span className="font-medium text-gray-600 text-xs">निदान:</span>
                                  <p className="text-gray-800 text-xs mt-1 truncate">
                                    {report.diagnosis}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(!healthReportData || (Array.isArray(healthReportData) && healthReportData.length === 0)) && !isLoadingReport && (
                  <div className="mt-6 bg-yellow-50 rounded-lg p-6 text-center">
                    <div className="text-yellow-600 mb-2">⚠️</div>
                    <h4 className="text-lg font-semibold text-yellow-800 mb-2">कोई स्वास्थ्य रिपोर्ट उपलब्ध नहीं</h4>
                    <p className="text-yellow-700 mb-4">
                      {selectedPatient.name} के लिए अभी तक कोई विस्तृत स्वास्थ्य रिपोर्ट दर्ज नहीं की गई है।
                    </p>
                    <div className="text-sm text-yellow-600">
                      <p>• कृपया पहले स्वास्थ्य जांच कराएं</p>
                      <p>• डॉक्टर से मिलकर रिपोर्ट बनवाएं</p>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex justify-center space-x-4">
                  <button
                    onClick={() => generatePDF(selectedPatient)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>PDF डाउनलोड करें</span>
                  </button>
                  <button
                    onClick={() => setShowHealthReportModal(false)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    बंद करें
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-3 border-t text-sm text-gray-700 space-y-2 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4">
              <span>
                {filteredData.length} में से {startIndex + 1} - {Math.min(endIndex, filteredData.length)} परिणाम
              </span>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>📊 कुल: {patients.length} मरीज़</span>
                {filteredData.length !== patients.length && (
                  <span>| 🔍 फिल्टर्ड: {filteredData.length}</span>
                )}
              </div>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                पिछला
              </button>
              <span className="px-2">पृष्ठ {currentPage} / {totalPages}</span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                अगला
              </button>
            </div>
          </div>
        )}

        {/* Footer Stats - Always visible when no pagination */}
        {totalPages <= 1 && (
          <div className="px-6 py-3 border-t bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <span>📊 कुल मरीज़: {patients.length}</span>
                {filteredData.length !== patients.length && (
                  <span>🔍 फिल्टर्ड: {filteredData.length}</span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span>💾 Excel Export उपलब्ध</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
