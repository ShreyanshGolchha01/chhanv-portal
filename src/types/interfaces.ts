export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'employee';
  avatar?: string;
  employeeId?: string;
  department?: string;
  joiningDate?: string;
}

export interface Doctor {
  id: string;
  name: string;
  hospitalType?: string;
  hospitalName?: string;
  specialty: string;
  phone: string;
  email: string;
  password?: string;  // optional for new doctor creation
  avatar?: string;
  experience: number;
  qualification: string[];
  assignedCamps: string[];
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  email: string;
  phone: string;
  password: string;
  dateOfBirth: string;
  bloodGroup: string;
  address: string;
  lastVisit: string;
  healthStatus: 'good' | 'fair' | 'poor';
  familyMembers: number;
  department: string;
  hasAbhaId: 'yes' | 'no';
  hasAyushmanCard: 'yes' | 'no';
}



export interface Camp {
  id: string;
  campName?: string;
  location: string;
  address: string;
  date: string;
  time?: string;
  coordinator?: string;
  expectedBeneficiaries?: number;
  doctors?: string[];       // nullable in some backend responses
  services?: string[];      // nullable in some backend responses
  status?: string;
  beneficiaries?: number;
  description?: string;
}


export interface HealthRecord {
  id: string;
  userId: string;
  date: string;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  sugarLevel: number;
  weight: number;
  height: number;
  bmi: number;
  notes?: string;
  campId?: string;
}

export interface Scheme {
  id: string;
  applicantName: string;
  employeeId: string;
  schemeName: string;
  appliedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: string[];
  amount: number;
  reviewedBy?: string;
  reviewDate?: string;
  remarks?: string;
}

export interface KPIData {
  totalCamps: number;
  totalUsers: number;
  totalSchemes: number;
  totalDoctors: number;
  monthlyBeneficiaries: number;
  approvedSchemes: number;
}

export interface ChartData {
  महीना: string;
  शिविर: number;
  लाभार्थी: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
  type: 'camp' | 'user' | 'doctor' | 'general';
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}