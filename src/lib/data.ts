
import type { Loan, Transaction, Document, SavingInsight, Rider, Payment, Bike } from "./types";
import { subDays, addDays, formatISO } from 'date-fns';

const today = new Date();

export const initialRiders: Rider[] = [
  { id: "rider-1", name: "Juma Hassan", phone: "0712345678", plateNumber: "T 123 BCD", shahidiNumber: "SH-9988", dailyFee: 15000, paymentFrequency: 'Daily', contractStart: formatISO(subDays(today, 10)), contractEnd: formatISO(addDays(today, 530)), active: true, bikeId: "bike-1", createdAt: formatISO(subDays(today, 10)) },
  { id: "rider-2", name: "Ally Ramadhan", phone: "0788112233", plateNumber: "T 445 DEF", shahidiNumber: "SH-1122", dailyFee: 105000, paymentFrequency: 'Weekly', contractStart: formatISO(subDays(today, 30)), contractEnd: formatISO(addDays(today, 510)), active: true, bikeId: "bike-2", createdAt: formatISO(subDays(today, 30)) },
  { id: "rider-3", name: "Sofia Said", phone: "0655443322", plateNumber: "T 789 GHI", shahidiNumber: "SH-4455", dailyFee: 15000, paymentFrequency: 'Daily', contractStart: formatISO(subDays(today, 5)), contractEnd: formatISO(addDays(today, 535)), active: true, bikeId: "bike-3", createdAt: formatISO(subDays(today, 5)) },
];

export const initialBikes: Bike[] = [
  { id: "bike-1", plateNumber: "T 123 BCD", model: "Boxer 150", ownerId: "admin" },
  { id: "bike-2", plateNumber: "T 445 DEF", model: "TVS HLX", ownerId: "admin" },
  { id: "bike-3", plateNumber: "T 789 GHI", model: "Boxer 150", ownerId: "admin" },
];

export const initialPayments: Payment[] = [
  // Juma has missed some days (Debt scenario)
  { id: "p1", riderId: "rider-1", amount: 15000, date: formatISO(subDays(today, 10)) },
  { id: "p2", riderId: "rider-1", amount: 15000, date: formatISO(subDays(today, 9)) },
  { id: "p3", riderId: "rider-1", amount: 15000, date: formatISO(subDays(today, 1)) },
  
  // Ally is a hard worker (Overpaid scenario)
  { id: "p4", riderId: "rider-2", amount: 500000, date: formatISO(subDays(today, 7)) },
  
  // Sofia is perfect (On-time scenario)
  { id: "p5", riderId: "rider-3", amount: 15000, date: formatISO(subDays(today, 5)) },
  { id: "p6", riderId: "rider-3", amount: 15000, date: formatISO(subDays(today, 4)) },
  { id: "p7", riderId: "rider-3", amount: 15000, date: formatISO(subDays(today, 3)) },
  { id: "p8", riderId: "rider-3", amount: 15000, date: formatISO(subDays(today, 2)) },
  { id: "p9", riderId: "rider-3", amount: 15000, date: formatISO(subDays(today, 1)) },
  { id: "p10", riderId: "rider-3", amount: 15000, date: formatISO(today) },
];

export const initialLoans: Loan[] = [
  {
    id: "loan-1",
    clientId: "rider-1",
    loanType: "Boda Boda",
    principalAmount: 2500000,
    outstandingBalance: 1250000,
    interestRate: 0.15,
    loanTermMonths: 18,
    startDate: formatISO(subDays(today, 270)),
    endDate: formatISO(addDays(subDays(today, 270), 540)),
    nextPaymentDueDate: formatISO(addDays(today, 3)),
    minimumPaymentAmount: 15000,
    totalAmountPaid: 1250000,
    loanStatus: "Active",
    progressPercentage: 50,
  }
];

export const initialSavings: SavingInsight = {
  id: "save-1",
  mogoInterestRate: 0.15,
  competitorInterestRate: 0.22,
  monthlySavings: 12500,
  totalSavingsToDate: 112500,
};

export const initialDocuments: Document[] = [
  {
    id: "doc-1",
    clientId: "rider-1",
    documentType: "Logbook",
    documentName: "Vehicle Logbook - T 123 BCD",
    fileUrl: "#",
    uploadDate: formatISO(subDays(today, 270)),
  },
  {
    id: "doc-2",
    clientId: "rider-1",
    documentType: "Insurance",
    documentName: "Insurance Sticker 2024",
    fileUrl: "#",
    uploadDate: formatISO(subDays(today, 30)),
  }
];
