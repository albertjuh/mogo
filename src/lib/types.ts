
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'supervisor' | 'rider' | 'recruiter';
  phoneNumber: string;
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  plateNumber: string;
  chassisNumber?: string;
  engineNumber?: string;
  shahidiNumber: string; // This is the ID/Shahidi Number
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
  date: string;
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

export interface Transaction {
  id: string;
  loanId: string;
  amount: number;
  transactionDate: string;
  transactionType: 'Payment' | 'Disbursement' | 'Penalty';
  paymentMethod: 'M-Pesa' | 'Airtel Money' | 'Tigo Pesa';
  status: 'Successful' | 'Pending' | 'Failed';
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
