
import type { Loan, Transaction, Document, SavingInsight, Rider, Payment, Bike } from "./types";
import { subDays, addDays, formatISO } from 'date-fns';

const today = new Date();

export const initialRiders: Rider[] = [
  { 
    id: "rider-1", 
    name: "Juma Hassan", 
    phone: "0712345678", 
    plateNumber: "T 123 BCD", 
    shahidiNumber: "SH-9988", 
    dailyFee: 10000, 
    paymentFrequency: 'Daily', 
    contractStart: formatISO(subDays(today, 5)), 
    contractEnd: formatISO(addDays(today, 535)), 
    active: true, 
    bikeId: "bike-1", 
    createdAt: formatISO(subDays(today, 5)),
    location: { lat: -6.7924, lng: 39.2083 }
  },
  { 
    id: "rider-2", 
    name: "Ally Ramadhan", 
    phone: "0788112233", 
    plateNumber: "T 445 DEF", 
    shahidiNumber: "SH-1122", 
    dailyFee: 70000, 
    paymentFrequency: 'Weekly', 
    contractStart: formatISO(subDays(today, 14)), 
    contractEnd: formatISO(addDays(today, 512)), 
    active: true, 
    bikeId: "bike-2", 
    createdAt: formatISO(subDays(today, 14)),
    location: { lat: -6.8234, lng: 39.2694 }
  },
  { 
    id: "rider-3", 
    name: "Sofia Said", 
    phone: "0655443322", 
    plateNumber: "T 789 GHI", 
    shahidiNumber: "SH-4455", 
    dailyFee: 10000, 
    paymentFrequency: 'Daily', 
    contractStart: formatISO(subDays(today, 3)), 
    contractEnd: formatISO(addDays(today, 537)), 
    active: true, 
    bikeId: "bike-3", 
    createdAt: formatISO(subDays(today, 3)),
    location: { lat: -6.7724, lng: 39.2383 }
  },
  { 
    id: "rider-4", 
    name: "Baraka Mwangi", 
    phone: "0711998877", 
    plateNumber: "T 119 HJL", 
    shahidiNumber: "SH-7766", 
    dailyFee: 10000, 
    paymentFrequency: 'Daily', 
    contractStart: formatISO(subDays(today, 7)), 
    contractEnd: formatISO(addDays(today, 533)), 
    active: true, 
    bikeId: "bike-4", 
    createdAt: formatISO(subDays(today, 7)),
    location: { lat: -6.8024, lng: 39.2183 }
  },
  { 
    id: "rider-5", 
    name: "Amina Saleh", 
    phone: "0622334455", 
    plateNumber: "T 042 GFK", 
    shahidiNumber: "SH-3344", 
    dailyFee: 70000, 
    paymentFrequency: 'Weekly', 
    contractStart: formatISO(subDays(today, 21)), 
    contractEnd: formatISO(addDays(today, 519)), 
    active: true, 
    bikeId: "bike-5", 
    createdAt: formatISO(subDays(today, 21)),
    location: { lat: -6.8124, lng: 39.2483 }
  }
];

export const initialBikes: Bike[] = [
  { id: "bike-1", plateNumber: "T 123 BCD", model: "Boxer 150", ownerId: "admin" },
  { id: "bike-2", plateNumber: "T 445 DEF", model: "TVS HLX", ownerId: "admin" },
  { id: "bike-3", plateNumber: "T 789 GHI", model: "Boxer 150", ownerId: "admin" },
  { id: "bike-4", plateNumber: "T 119 HJL", model: "TVS HLX", ownerId: "admin" },
  { id: "bike-5", plateNumber: "T 042 GFK", model: "Bajaj RE", ownerId: "admin" }
];

export const initialPayments: Payment[] = [
  { id: "p1", riderId: "rider-1", amount: 10000, date: formatISO(subDays(today, 5)) },
  { id: "p2", riderId: "rider-1", amount: 10000, date: formatISO(subDays(today, 4)) },
  { id: "p3", riderId: "rider-1", amount: 10000, date: formatISO(subDays(today, 1)) },
  
  { id: "p4", riderId: "rider-2", amount: 70000, date: formatISO(subDays(today, 14)) },
  { id: "p5", riderId: "rider-2", amount: 70000, date: formatISO(subDays(today, 7)) },
  { id: "p6", riderId: "rider-2", amount: 70000, date: formatISO(today) },
  
  { id: "p7", riderId: "rider-3", amount: 10000, date: formatISO(subDays(today, 3)) },
  { id: "p8", riderId: "rider-3", amount: 10000, date: formatISO(subDays(today, 2)) },
  { id: "p9", riderId: "rider-3", amount: 10000, date: formatISO(subDays(today, 1)) },

  { id: "p10", riderId: "rider-4", amount: 10000, date: formatISO(subDays(today, 7)) },
  { id: "p11", riderId: "rider-4", amount: 10000, date: formatISO(subDays(today, 6)) },

  { id: "p12", riderId: "rider-5", amount: 70000, date: formatISO(subDays(today, 21)) }
];

export const initialLoans: Loan[] = [
  {
    id: "loan-1",
    clientId: "rider-1",
    loanType: "Boda Boda",
    principalAmount: 2500000,
    outstandingBalance: 2470000,
    interestRate: 0.15,
    loanTermMonths: 18,
    startDate: formatISO(subDays(today, 5)),
    endDate: formatISO(addDays(subDays(today, 5), 540)),
    nextPaymentDueDate: formatISO(addDays(today, 1)),
    minimumPaymentAmount: 10000,
    totalAmountPaid: 30000,
    loanStatus: "In Arrears",
    progressPercentage: 1.2,
  },
  {
    id: "loan-2",
    clientId: "rider-2",
    loanType: "Bajaji",
    principalAmount: 7500000,
    outstandingBalance: 7290000,
    interestRate: 0.12,
    loanTermMonths: 24,
    startDate: formatISO(subDays(today, 14)),
    endDate: formatISO(addDays(subDays(today, 14), 720)),
    nextPaymentDueDate: formatISO(addDays(today, 7)),
    minimumPaymentAmount: 70000,
    totalAmountPaid: 210000,
    loanStatus: "Active",
    progressPercentage: 2.8,
  },
  {
    id: "loan-3",
    clientId: "rider-3",
    loanType: "Boda Boda",
    principalAmount: 2500000,
    outstandingBalance: 2470000,
    interestRate: 0.15,
    loanTermMonths: 18,
    startDate: formatISO(subDays(today, 3)),
    endDate: formatISO(addDays(today, 537)),
    nextPaymentDueDate: formatISO(addDays(today, 1)),
    minimumPaymentAmount: 10000,
    totalAmountPaid: 30000,
    loanStatus: "Active",
    progressPercentage: 1.2,
  },
  {
    id: "loan-4",
    clientId: "rider-4",
    loanType: "Boda Boda",
    principalAmount: 2500000,
    outstandingBalance: 2480000,
    interestRate: 0.15,
    loanTermMonths: 18,
    startDate: formatISO(subDays(today, 7)),
    endDate: formatISO(addDays(today, 533)),
    nextPaymentDueDate: formatISO(addDays(today, 1)),
    minimumPaymentAmount: 10000,
    totalAmountPaid: 20000,
    loanStatus: "In Arrears",
    progressPercentage: 0.8,
  },
  {
    id: "loan-5",
    clientId: "rider-5",
    loanType: "Bajaji",
    principalAmount: 7500000,
    outstandingBalance: 7430000,
    interestRate: 0.12,
    loanTermMonths: 24,
    startDate: formatISO(subDays(today, 21)),
    endDate: formatISO(addDays(today, 519)),
    nextPaymentDueDate: formatISO(addDays(today, 7)),
    minimumPaymentAmount: 70000,
    totalAmountPaid: 70000,
    loanStatus: "In Arrears",
    progressPercentage: 1,
  }
];

export const initialSavings: SavingInsight = {
  id: "save-1",
  mogoInterestRate: 0.15,
  competitorInterestRate: 0.22,
  monthlySavings: 35000,
  totalSavingsToDate: 140000,
};

export const initialDocuments: Document[] = [
  {
    id: "doc-1",
    clientId: "rider-1",
    documentType: "Logbook",
    documentName: "Vehicle Logbook - T 123 BCD",
    fileUrl: "#",
    uploadDate: formatISO(subDays(today, 5)),
  }
];
