export interface UserProfile {
  id: string; // Firebase Auth UID
  email: string;
  name: string;
  role: 'rider' | 'supervisor' | 'admin';
  createdAt: string;
}

export interface Location {
    lat: number;
    lng: number;
}

export interface Rider {
  id: string; // Corresponds to UserProfile ID
  name: string;
  phone: string;
  contractEnd: string;
  bikeId: string;
  active: boolean;
  contractStart: string;
  dailyFee: number;
  plateNumber: string;
  shahidiNumber: string;
  notes?: string;
  createdAt: string;
  location?: Location;
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
  date: string;
  createdAt: string;
}

export interface Alert {
    id: string;
    type: 'payment' | 'contract';
    message: string;
    date: string;
    riderId: string;
}
