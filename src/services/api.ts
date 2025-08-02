// API Configuration
const PHP_API_BASE_URL = 'http://165.22.208.62:8080/';

// Dashboard API
export const dashboardAPI = {
  // Get total camps
  getTotalCamps: async () => {
    try {
      const response = await fetch(`${PHP_API_BASE_URL}/get_total_camps.php`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get total camps error:', error);
      throw error;
    }
  },

  // Get total patients
  getTotalPatients: async () => {
    try {
      const response = await fetch(`${PHP_API_BASE_URL}/get_total_patients.php`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get total patients error:', error);
      throw error;
    }
  },

  // Get total doctors
  getTotalDoctors: async () => {
    try {
      const response = await fetch(`${PHP_API_BASE_URL}/get_total_doctors.php`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get total doctors error:', error);
      throw error;
    }
  },

  // Get monthly beneficiaries
  getMonthlyBeneficiaries: async () => {
    try {
      const response = await fetch(`${PHP_API_BASE_URL}/get_monthly_beneficiaries.php`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get monthly beneficiaries error:', error);
      throw error;
    }
  },

  // Get recent activities
  getRecentActivities: async () => {
    try {
      const response = await fetch(`${PHP_API_BASE_URL}/get_recent_activities.php`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get recent activities error:', error);
      throw error;
    }
  },

  // Get dashboard chart data
  getDashboardChartData: async () => {
    try {
      const response = await fetch(`${PHP_API_BASE_URL}/get_dashboard_chart_data.php`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get dashboard chart data error:', error);
      throw error;
    }
  },

  // Get all dashboard data in one call (optimized)
  getAllDashboardData: async () => {
    try {
      const response = await fetch(`${PHP_API_BASE_URL}/get_dashboard_all_data.php`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get all dashboard data error:', error);
      throw error;
    }
  },
};

// Health Records API
export const healthRecordsAPI = {
  // Search for patients (employees, relatives, outsiders)
  searchPatient: async (phone: string, patientType: 'employee' | 'relative' | 'outsider') => {
    try {
      const response = await fetch(`${PHP_API_BASE_URL}/search_patient.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone,
          patientType: patientType
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Patient search error:', error);
      throw error;
    }
  },

  // Get user's assigned camps
  getUserCamps: async (userId: string) => {
    try {
      const response = await fetch(`${PHP_API_BASE_URL}/get_user_camps.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get camps error:', error);
      throw error;
    }
  },

  // Add new health record
  addHealthRecord: async (recordData: any) => {
    try {
      const response = await fetch(`${PHP_API_BASE_URL}/add_health_record.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recordData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Add health record error:', error);
      throw error;
    }
  },

  // Get health records with filters
  getHealthRecords: async (filters: {
    searchTerm?: string;
    statusFilter?: string;
    checkupTypeFilter?: string;
    limit?: number;
    offset?: number;
  } = {}) => {
    try {
      const response = await fetch(`${PHP_API_BASE_URL}/get_health_records.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get health records error:', error);
      throw error;
    }
  },
};

// Service Records API
export const serviceRecordsAPI = {
  // Add new service record
  addServiceRecord: async (recordData: any) => {
    try {
      const response = await fetch(`${PHP_API_BASE_URL}/add_service_record.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recordData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Add service record error:', error);
      throw error;
    }
  },

  // Get service records with filters
  getServiceRecords: async (filters: {
    searchTerm?: string;
    patientTypeFilter?: string;
    serviceTypeFilter?: string;
    limit?: number;
    offset?: number;
  } = {}) => {
    try {
      const response = await fetch(`${PHP_API_BASE_URL}/get_service_records.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get service records error:', error);
      throw error;
    }
  },

  // Use existing patient search and camp functions from healthRecordsAPI
  searchPatient: (phone: string, patientType: 'employee' | 'relative' | 'outsider') => {
    return healthRecordsAPI.searchPatient(phone, patientType);
  },

  getUserCamps: (userId: string) => {
    return healthRecordsAPI.getUserCamps(userId);
  }
};

// Error handling utility
export const handleAPIError = async (error: any) => {
  console.error('API Error:', error);
  if (error.message === 'Unauthorized') {
    // Handle logout or redirect to login using AsyncStorage
    const AsyncStorage = (await import('../utils/AsyncStorage')).default;
    await AsyncStorage.removeItem('isAuthenticated');
    await AsyncStorage.removeItem('userType');
    window.location.href = '/login';
    return 'Please login again';
  }
  return error.message || 'Something went wrong';
};
