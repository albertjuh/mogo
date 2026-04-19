
export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'supervisor' | 'rider' | 'recruiter';
  createdAt: string;
}

export interface Rider {
  id: string; // This matches the Firebase Auth UID
  name: string;
  phone: string;
  email: string;
  plateNumber: string;
  vehicleType: 'Boda Boda' | 'Bajaji';
  chassisNumber?: string;
  engineNumber?: string;
  engineCapacity?: string; 
  modelNumber?: string; 
  shahidiNumber: string; 
  dailyFee: number;
  paymentFrequency: 'Daily' | 'Weekly' | '10-Day';
  contractStart: string;
  contractTermMonths?: number;
  contractEnd: string;
  guarantorName?: string;
  guarantorPhone?: string;
  witnessName?: string;
  witnessPhone?: string;
  active: boolean;
  bikeId: string;
  createdAt: string;
  notes?: string;
  location?: { lat: number; lng: number };
}

export interface Bike {
  id: string;
  plateNumber: string;
  model: string;
  ownerId: string;
}

export interface Payment {
  id: string;
  riderId: string;
  amount: number;
  selcomRef: string;
  status: 'pending' | 'verified' | 'failed';
  recordedAt: string;
  verifiedBy?: string;
}

export interface Loan {
  id: string;
  clientId: string;
  loanType: 'Boda Boda' | 'Bajaji' | 'Car';
  principalAmount: number;
  outstandingBalance: number;
  interestRate: number;
  loanTermMonths: number;
  startDate: string;
  endDate: string;
  nextPaymentDueDate: string;
  minimumPaymentAmount: number;
  totalAmountPaid: number;
  loanStatus: 'Active' | 'Completed' | 'Defaulted' | 'In Arrears';
  progressPercentage: number;
}

export interface Document {
  id: string;
  clientId: string;
  documentType: 'Logbook' | 'Insurance' | 'Agreement' | 'ID';
  documentName: string;
  fileUrl: string;
  uploadDate: string;
}

export interface SavingInsight {
  id: string;
  mogoInterestRate: number;
  competitorInterestRate: number;
  monthlySavings: number;
  totalSavingsToDate: number;
}

export interface Alert {
    id: string;
    type: 'payment' | 'contract';
    message: string;
    date: string;
    riderId: string;
}
