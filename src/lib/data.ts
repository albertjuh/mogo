
import type { Loan, Transaction, Document, SavingInsight, Rider, Payment, Bike } from "./types";
import { subDays, addDays, formatISO, startOfDay } from 'date-fns';

const today = new Date();

export const initialRiders: Rider[] = [
  { 
    id: "rider-1", 
    name: "Juma Hassan", 
    phone: "0712345678", 
    plateNumber: "T 123 BCD", 
    shahidiNumber: "SH-9988", 
    dailyFee: 15000, 
    paymentFrequency: 'Daily', 
    contractStart: formatISO(subDays(today, 10)), 
    contractEnd: formatISO(addDays(today, 530)), 
    active: true, 
    bikeId: "bike-1", 
    createdAt: formatISO(subDays(today, 10)),
    location: { lat: -6.7924, lng: 39.2083 }
  },
  { 
    id: "rider-2", 
    name: "Ally Ramadhan", 
    phone: "0788112233", 
    plateNumber: "T 445 DEF", 
    shahidiNumber: "SH-1122", 
    dailyFee: 105000, 
    paymentFrequency: 'Weekly', 
    contractStart: formatISO(subDays(today, 28)), 
    contractEnd: formatISO(addDays(today, 512)), 
    active: true, 
    bikeId: "bike-2", 
    createdAt: formatISO(subDays(today, 28)),
    location: { lat: -6.8234, lng: 39.2694 }
  },
  { 
    id: "rider-3", 
    name: "Sofia Said", 
    phone: "0655443322", 
    plateNumber: "T 789 GHI", 
    shahidiNumber: "SH-4455", 
    dailyFee: 15000, 
    paymentFrequency: 'Daily', 
    contractStart: formatISO(subDays(today, 5)), 
    contractEnd: formatISO(addDays(today, 535)), 
    active: true, 
    bikeId: "bike-3", 
    createdAt: formatISO(subDays(today, 5)),
    location: { lat: -6.7724, lng: 39.2383 }
  },
  { 
    id: "rider-4", 
    name: "Baraka Mwangi", 
    phone: "0711998877", 
    plateNumber: "T 119 HJL", 
    shahidiNumber: "SH-7766", 
    dailyFee: 15000, 
    paymentFrequency: 'Daily', 
    contractStart: formatISO(subDays(today, 45)), 
    contractEnd: formatISO(addDays(today, 495)), 
    active: true, 
    bikeId: "bike-4", 
    createdAt: formatISO(subDays(today, 45)),
    location: { lat: -6.8024, lng: 39.2183 }
  },
  { 
    id: "rider-5", 
    name: "Amina Saleh", 
    phone: "0622334455", 
    plateNumber: "T 042 GFK", 
    shahidiNumber: "SH-3344", 
    dailyFee: 105000, 
    paymentFrequency: 'Weekly', 
    contractStart: formatISO(subDays(today, 60)), 
    contractEnd: formatISO(addDays(today, 480)), 
    active: true, 
    bikeId: "bike-5", 
    createdAt: formatISO(subDays(today, 60)),
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
  // Juma (Daily): 10 days since start. Owed: 150K. Paid: 60K. Debt: 90K.
  { id: "p1", riderId: "rider-1", amount: 15000, date: formatISO(subDays(today, 10)) },
  { id: "p2", riderId: "rider-1", amount: 15000, date: formatISO(subDays(today, 9)) },
  { id: "p3", riderId: "rider-1", amount: 15000, date: formatISO(subDays(today, 1)) },
  { id: "p4", riderId: "rider-1", amount: 15000, date: formatISO(today) },
  
  // Ally (Weekly): 4 weeks since start. Owed: 420K. Paid: 525K. Credit: 105K (Bossi status).
  { id: "p5", riderId: "rider-2", amount: 105000, date: formatISO(subDays(today, 28)) },
  { id: "p6", riderId: "rider-2", amount: 105000, date: formatISO(subDays(today, 21)) },
  { id: "p7", riderId: "rider-2", amount: 105000, date: formatISO(subDays(today, 14)) },
  { id: "p8", riderId: "rider-2", amount: 105000, date: formatISO(subDays(today, 7)) },
  { id: "p9", riderId: "rider-2", amount: 105000, date: formatISO(today) },
  
  // Sofia (Daily): 5 days since start. Owed: 75K. Paid: 75K. Status: Perfect.
  { id: "p10", riderId: "rider-3", amount: 15000, date: formatISO(subDays(today, 5)) },
  { id: "p11", riderId: "rider-3", amount: 15000, date: formatISO(subDays(today, 4)) },
  { id: "p12", riderId: "rider-3", amount: 15000, date: formatISO(subDays(today, 3)) },
  { id: "p13", riderId: "rider-3", amount: 15000, date: formatISO(subDays(today, 2)) },
  { id: "p14", riderId: "rider-3", amount: 15000, date: formatISO(subDays(today, 1)) },

  // Baraka (Daily): 45 days. Owed: 675K. Paid: 100K. Status: Extreme Debt.
  { id: "p15", riderId: "rider-4", amount: 50000, date: formatISO(subDays(today, 40)) },
  { id: "p16", riderId: "rider-4", amount: 50000, date: formatISO(subDays(today, 20)) },

  // Amina (Weekly): 8 weeks. Owed: 840K. Paid: 420K. Status: Missed last 4 weeks.
  { id: "p17", riderId: "rider-5", amount: 105000, date: formatISO(subDays(today, 56)) },
  { id: "p18", riderId: "rider-5", amount: 105000, date: formatISO(subDays(today, 49)) },
  { id: "p19", riderId: "rider-5", amount: 105000, date: formatISO(subDays(today, 42)) },
  { id: "p20", riderId: "rider-5", amount: 105000, date: formatISO(subDays(today, 35)) }
];

export const initialLoans: Loan[] = [
  {
    id: "loan-1",
    clientId: "rider-1",
    loanType: "Boda Boda",
    principalAmount: 2500000,
    outstandingBalance: 2440000,
    interestRate: 0.15,
    loanTermMonths: 18,
    startDate: formatISO(subDays(today, 10)),
    endDate: formatISO(addDays(subDays(today, 10), 540)),
    nextPaymentDueDate: formatISO(addDays(today, 1)),
    minimumPaymentAmount: 15000,
    totalAmountPaid: 60000,
    loanStatus: "In Arrears",
    progressPercentage: 2.4,
  },
  {
    id: "loan-2",
    clientId: "rider-2",
    loanType: "Bajaji",
    principalAmount: 7500000,
    outstandingBalance: 6975000,
    interestRate: 0.12,
    loanTermMonths: 24,
    startDate: formatISO(subDays(today, 28)),
    endDate: formatISO(addDays(subDays(today, 28), 720)),
    nextPaymentDueDate: formatISO(addDays(today, 7)),
    minimumPaymentAmount: 105000,
    totalAmountPaid: 525000,
    loanStatus: "Active",
    progressPercentage: 7,
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
    uploadDate: formatISO(subDays(today, 10)),
  },
  {
    id: "doc-2",
    clientId: "rider-2",
    documentType: "Agreement",
    documentName: "Mogo Loan Agreement - Ally R.",
    fileUrl: "#",
    uploadDate: formatISO(subDays(today, 28)),
  }
];
