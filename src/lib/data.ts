import type { Rider, Bike, Payment } from "./types";
import { subDays, addDays, formatISO } from 'date-fns';

// Use a fixed date to ensure consistency between server and client renders
const today = new Date('2024-02-20T00:00:00.000Z');

export const initialBikes: Bike[] = [
  { id: "bike-1", model: "Boxer 150", plateNumber: "T 001 BBD" },
  { id: "bike-2", model: "Pulsar 200NS", plateNumber: "T 042 GFK" },
  { id: "bike-3", model: "TVS Star", plateNumber: "T 119 HJL" },
];

export const initialRiders: Rider[] = [
  {
    id: "rider-1",
    name: "Juma Hassan",
    phone: "0712345678",
    contractStart: formatISO(subDays(today, 90)),
    contractEnd: formatISO(addDays(subDays(today, 90), 510)),
    bikeId: "bike-1",
    active: true,
    dailyFee: 10000,
    plateNumber: "T 001 BBD",
    shahidiNumber: "SH-20230011",
    createdAt: formatISO(subDays(today, 90)),
    location: { lat: -6.7924, lng: 39.2083 },
  },
  {
    id: "rider-2",
    name: "Amina Saleh",
    phone: "0723456789",
    contractStart: formatISO(subDays(today, 25)),
    contractEnd: formatISO(addDays(subDays(today, 25), 510)),
    bikeId: "bike-2",
    active: true,
    dailyFee: 10000,
    plateNumber: "T 042 GFK",
    shahidiNumber: "SH-20183422",
    createdAt: formatISO(subDays(today, 25)),
    location: { lat: -6.8000, lng: 39.2183 },
  },
  {
    id: "rider-3",
    name: "Baraka Mwangi",
    phone: "0734567890",
    contractStart: formatISO(subDays(today, 150)),
    contractEnd: formatISO(addDays(subDays(today, 150), 510)),
    bikeId: "bike-3",
    active: true,
    dailyFee: 10000,
    plateNumber: "T 119 HJL",
    shahidiNumber: "SH-20190998",
    createdAt: formatISO(subDays(today, 150)),
    location: { lat: -6.7850, lng: 39.2283 },
  },
];

export const initialPayments: Payment[] = [
  // Payments for Juma
  ...Array.from({ length: 88 }, (_, i) => ({
    id: `payment-juma-${i}`,
    riderId: "rider-1",
    amount: 10000,
    date: formatISO(subDays(today, i + 2)), // Paid up to 2 days ago
  })),
  // Payments for Amina
  ...Array.from({ length: 23 }, (_, i) => ({
    id: `payment-amina-${i}`,
    riderId: "rider-2",
    amount: 10000,
    date: formatISO(subDays(today, i + 2)), // Paid up to 2 days ago
  })),
    // Payments for Baraka
  ...Array.from({ length: 149 }, (_, i) => ({
    id: `payment-baraka-${i}`,
    riderId: "rider-3",
    amount: 10000,
    date: formatISO(subDays(today, i + 1)), // Paid up to yesterday
  })),
];
