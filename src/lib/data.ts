
import type { Loan, Transaction, Document, SavingInsight, Rider, Payment, Bike } from "./types";
import { subDays, addDays, formatISO } from 'date-fns';

const today = new Date();

export const initialRiders: Rider[] = [
  { id: "rider-1", name: "Juma Hassan", phone: "0712345678", plateNumber: "T 123 BCD", shahidiNumber: "SH-9988", dailyFee: 15000, paymentFrequency: 'Daily', contractStart: formatISO(subDays(today, 270)), contractEnd: formatISO(addDays(today, 240)), active: true, bikeId: "bike-1", createdAt: formatISO(subDays(today, 270)) },
  { id: "rider-2", name: "Ally Ramadhan", phone: "0788112233", plateNumber: "T 445 DEF", shahidiNumber: "SH-1122", dailyFee: 105000, paymentFrequency: 'Weekly', contractStart: formatISO(subDays(today, 30)), contractEnd: formatISO(addDays(today, 480)), active: true, bikeId: "bike-2", createdAt: formatISO(subDays(today, 30)) },
  { id: "rider-3", name: "Sofia Said", phone: "0655443322", plateNumber: "T 789 GHI", shahidiNumber: "SH-4455", dailyFee: 15000, paymentFrequency: 'Daily', contractStart: formatISO(subDays(today, 10)), contractEnd: formatISO(addDays(today, 500)), active: true, bikeId: "bike-3", createdAt: formatISO(subDays(today, 10)) },
];

export const initialBikes: Bike[] = [
  { id: "bike-1", plateNumber: "T 123 BCD", model: "Boxer 150", ownerId: "admin" },
  { id: "bike-2", plateNumber: "T 445 DEF", model: "TVS HLX", ownerId: "admin" },
  { id: "bike-3", plateNumber: "T 789 GHI", model: "Boxer 150", ownerId: "admin" },
];

export const initialPayments: Payment[] = [
  { id: "p1", riderId: "rider-1", amount: 15000, date: formatISO(subDays(today, 1)) },
  { id: "p2", riderId: "rider-2", amount: 105000, date: formatISO(subDays(today, 7)) },
  { id: "p3", riderId: "rider-1", amount: 15000, date: formatISO(today) },
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
