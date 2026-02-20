import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  id: string; // Firebase Auth UID
  email: string;
  name: string;
  role: 'rider' | 'supervisor' | 'admin';
  createdAt: Timestamp;
}

export interface Rider {
  id: string; // Corresponds to UserProfile ID
  phone: string;
  contractEnd: Timestamp;
  bikeId: string;
  active: boolean;
  contractStart: Timestamp;
  dailyFee: number;
  plateNumber: string;
  shahidiNumber: string;
  notes?: string;
  createdAt: Timestamp;
}

export interface Bike {
  id: string;
  model: string;
  plateNumber: string;
  currentRiderId?: string;
}

export interface Payment {
  id:string;
  riderId: string;
  amount: number;
  date: Timestamp;
  createdAt: Timestamp;
}

export interface Alert {
    id: string;
    type: 'payment' | 'contract';
    message: string;
    date: Timestamp;
    riderId: string;
}
