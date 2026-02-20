import type { Rider, Bike, Payment } from "./types";
import { subDays, addDays, formatISO } from 'date-fns';

const today = new Date();

export const initialBikes: Bike[] = [
  { id: "bike-1", model: "Boxer 150", plateNumber: "KMF A123B" },
  { id: "bike-2", model: "Pulsar 200NS", plateNumber: "KMF C456D" },
  { id: "bike-3", model: "TVS Star", plateNumber: "KMF E789F" },
];

export const initialRiders: Rider[] = [
  {
    id: "rider-1",
    name: "John Kamau",
    phone: "0712345678",
    contractEnd: formatISO(addDays(today, 85)),
    bikeId: "bike-1",
  },
  {
    id: "rider-2",
    name: "Peter Otieno",
    phone: "0723456789",
    contractEnd: formatISO(addDays(today, 25)),
    bikeId: "bike-2",
  },
  {
    id: "rider-3",
    name: "David Kimani",
    phone: "0734567890",
    contractEnd: formatISO(addDays(today, 150)),
    bikeId: "bike-3",
  },
];

export const initialPayments: Payment[] = [
  { id: "payment-1", riderId: "rider-1", amount: 500, date: formatISO(subDays(today, 1)) },
  { id: "payment-2", riderId: "rider-2", amount: 600, date: formatISO(subDays(today, 1)) },
  { id: "payment-3", riderId: "rider-3", amount: 500, date: formatISO(subDays(today, 1)) },
  { id: "payment-4", riderId: "rider-1", amount: 500, date: formatISO(subDays(today, 2)) },
  // Rider 2 missed a payment 2 days ago
  { id: "payment-5", riderId: "rider-3", amount: 500, date: formatISO(subDays(today, 2)) },
];
