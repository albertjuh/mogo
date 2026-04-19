export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'client' | 'admin';
  phoneNumber: string;
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
