import type { Loan, Transaction, Document, SavingInsight } from "./types";
import { subDays, addDays, formatISO } from 'date-fns';

const today = new Date();

export const initialLoans: Loan[] = [
  {
    id: "loan-1",
    clientId: "client-1",
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

export const initialTransactions: Transaction[] = [
  {
    id: "tx-1",
    loanId: "loan-1",
    amount: 15000,
    transactionDate: formatISO(subDays(today, 7)),
    transactionType: "Payment",
    paymentMethod: "M-Pesa",
    status: "Successful",
  },
  {
    id: "tx-2",
    loanId: "loan-1",
    amount: 15000,
    transactionDate: formatISO(subDays(today, 14)),
    transactionType: "Payment",
    paymentMethod: "M-Pesa",
    status: "Successful",
  }
];

export const initialDocuments: Document[] = [
  {
    id: "doc-1",
    clientId: "client-1",
    documentType: "Logbook",
    documentName: "Vehicle Logbook - T 123 BCD",
    fileUrl: "#",
    uploadDate: formatISO(subDays(today, 270)),
  },
  {
    id: "doc-2",
    clientId: "client-1",
    documentType: "Insurance",
    documentName: "Insurance Sticker 2024",
    fileUrl: "#",
    uploadDate: formatISO(subDays(today, 30)),
  }
];

export const initialSavings: SavingInsight = {
  id: "save-1",
  mogoInterestRate: 0.15,
  competitorInterestRate: 0.22,
  monthlySavings: 12500,
  totalSavingsToDate: 112500,
};
