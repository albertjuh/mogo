export interface Rider {
  id: string;
  name: string;
  phone: string;
  contractEnd: string; // ISO date string
  bikeId: string;
  active: boolean;
  contractStart: string; // ISO date string
  dailyFee: number;
  plateNumber: string;
  shahidiNumber: string;
  notes?: string;
  createdAt: string; // ISO date string
}

export interface Bike {
  id: string;
  model: string;
  plateNumber: string;
}

export interface Payment {
  id:string;
  riderId: string;
  amount: number;
  date: string; // ISO date string
}

export interface Alert {
    id: string;
    type: 'payment' | 'contract';
    message: string;
    date: string; // ISO date string
    riderId: string;
}
