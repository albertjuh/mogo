
export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'supervisor' | 'rider' | 'recruiter';
  createdAt: string;
}

export interface Rider {
  id: string; // Fleet record id -- independent of any login account
  profileId?: string; // Set once this driver has signed up / been linked to a login
  name: string;
  phone: string;
  email: string;
  plateNumber: string;
  vehicleType: 'Bajaji';
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
  bikeId: string; // legacy field name: holds the assigned bajaji's id
  createdAt: string;
  notes?: string;
  location?: { lat: number; lng: number };
}

/** A bajaji in the fleet (interface name kept for existing Firestore data). */
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
  gatewayRef: string; // our AzamPay externalId
  transactionId?: string; // AzamPay's transaction id
  provider?: string; // mobile money network, see payment-providers.ts
  msisdn?: string;
  status: 'pending' | 'verified' | 'failed';
  recordedAt: string;
  verifiedBy?: string;
}

export interface Loan {
  id: string;
  clientId: string;
  loanType: 'Bajaji';
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
  ourInterestRate: number;
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
