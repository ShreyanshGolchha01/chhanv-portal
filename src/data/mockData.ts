import type { User, Doctor, Camp, HealthRecord, Scheme, KPIData, ChartData, ActivityLog } from '../types/interfaces';

// Empty Users Data - Connect to your backend
export const mockUsers: User[] = [];

// Empty Doctors Data - Connect to your backend
export const mockDoctors: Doctor[] = [];

// Empty Camps Data - Connect to your backend
export const mockCamps: Camp[] = [];

// Empty Health Records - Connect to your backend
export const mockHealthRecords: HealthRecord[] = [];

// Empty Schemes Data - Connect to your backend
export const mockSchemes: Scheme[] = [];

// Empty KPI Data - Connect to your backend
export const mockKPIData: KPIData = {
  totalCamps: 0,
  totalUsers: 0,
  totalSchemes: 0,
  totalDoctors: 0,
  monthlyBeneficiaries: 0,
  approvedSchemes: 0
};

// Empty Chart Data - Connect to your backend
export const mockChartData: ChartData[] = [];

// Empty Activity Logs - Connect to your backend
export const mockActivityLogs: ActivityLog[] = [];

// Utility functions for data filtering and searching
export const getSchemesByStatus = (status: 'pending' | 'approved' | 'rejected') => {
  return mockSchemes.filter(scheme => scheme.status === status);
};

export const getUserHealthRecords = (userId: string) => {
  return mockHealthRecords.filter(record => record.userId === userId);
};

export const getDoctorById = (id: string) => {
  return mockDoctors.find(doctor => doctor.id === id);
};

export const getCampById = (id: string) => {
  return mockCamps.find(camp => camp.id === id);
};

export const searchData = <T extends Record<string, any>>(data: T[], searchTerm: string, fields: (keyof T)[]): T[] => {
  if (!searchTerm) return data;
  
  return data.filter(item =>
    fields.some(field => {
      const value = item[field];
      return typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase());
    })
  );
};
