// Postgres uses snake_case columns (idiomatic); the app's TypeScript types
// (src/lib/types.ts) stay camelCase for DX. These mappers are the one place
// that bridges the two, so pages/components never see snake_case fields.

import type { Rider, Payment, UserProfile } from "@/lib/types";

export interface ProfileRow {
  id: string;
  email: string;
  name: string | null;
  role: "admin" | "supervisor" | "recruiter" | "rider";
  created_at: string;
}

export interface RiderRow {
  id: string;
  profile_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  plate_number: string | null;
  vehicle_type: string;
  chassis_number: string | null;
  engine_number: string | null;
  engine_capacity: string | null;
  model_number: string | null;
  shahidi_number: string | null;
  daily_fee: number;
  payment_frequency: "Daily" | "Weekly" | "10-Day";
  contract_start: string | null;
  contract_term_months: number | null;
  contract_end: string | null;
  guarantor_name: string | null;
  guarantor_phone: string | null;
  witness_name: string | null;
  witness_phone: string | null;
  active: boolean;
  bike_id: string | null;
  notes: string | null;
  location: { lat: number; lng: number } | null;
  created_at: string;
  // Present when the row comes from a `riders` select joined with `profiles`.
  profiles?: { name: string | null; email: string } | null;
}

export interface PaymentRow {
  id: string;
  rider_id: string;
  amount: number;
  transaction_id: string | null;
  provider: string | null;
  msisdn: string | null;
  status: "pending" | "verified" | "failed";
  recorded_at: string;
  verified_by: string | null;
  operator_reference: string | null;
  fsp_reference_id: string | null;
  gateway_message: string | null;
}

export interface PayoutRow {
  id: string;
  amount: number;
  phone_number: string;
  provider: string | null;
  recipient_name: string | null;
  narration: string | null;
  status: string;
  initiated_by: string | null;
  gateway_message: string | null;
  operator_reference: string | null;
  fsp_reference_id: string | null;
  recorded_at: string;
}

export function profileFromRow(row: ProfileRow): UserProfile {
  return { id: row.id, email: row.email, role: row.role, createdAt: row.created_at };
}

export function riderFromRow(row: RiderRow): Rider {
  return {
    id: row.id,
    profileId: row.profile_id ?? undefined,
    name: row.name || row.profiles?.name || "",
    email: row.email || row.profiles?.email || "",
    phone: row.phone || "",
    plateNumber: row.plate_number || "",
    vehicleType: "Bajaji",
    chassisNumber: row.chassis_number ?? undefined,
    engineNumber: row.engine_number ?? undefined,
    engineCapacity: row.engine_capacity ?? undefined,
    modelNumber: row.model_number ?? undefined,
    shahidiNumber: row.shahidi_number || "",
    dailyFee: row.daily_fee,
    paymentFrequency: row.payment_frequency,
    contractStart: row.contract_start || "",
    contractTermMonths: row.contract_term_months ?? undefined,
    contractEnd: row.contract_end || "",
    guarantorName: row.guarantor_name ?? undefined,
    guarantorPhone: row.guarantor_phone ?? undefined,
    witnessName: row.witness_name ?? undefined,
    witnessPhone: row.witness_phone ?? undefined,
    active: row.active,
    bikeId: row.bike_id || "",
    createdAt: row.created_at,
    notes: row.notes ?? undefined,
    location: row.location ?? undefined,
  };
}

/** Inverse of riderFromRow, for inserts/updates. Only includes `riders`-table columns. */
export function riderToRow(rider: Partial<Rider>): Partial<RiderRow> {
  const row: Partial<RiderRow> = {};
  if (rider.profileId !== undefined) row.profile_id = rider.profileId;
  if (rider.name !== undefined) row.name = rider.name;
  if (rider.email !== undefined) row.email = rider.email;
  if (rider.phone !== undefined) row.phone = rider.phone;
  if (rider.plateNumber !== undefined) row.plate_number = rider.plateNumber;
  if (rider.chassisNumber !== undefined) row.chassis_number = rider.chassisNumber;
  if (rider.engineNumber !== undefined) row.engine_number = rider.engineNumber;
  if (rider.engineCapacity !== undefined) row.engine_capacity = rider.engineCapacity;
  if (rider.modelNumber !== undefined) row.model_number = rider.modelNumber;
  if (rider.shahidiNumber !== undefined) row.shahidi_number = rider.shahidiNumber;
  if (rider.dailyFee !== undefined) row.daily_fee = rider.dailyFee;
  if (rider.paymentFrequency !== undefined) row.payment_frequency = rider.paymentFrequency;
  if (rider.contractStart !== undefined) row.contract_start = rider.contractStart;
  if (rider.contractTermMonths !== undefined) row.contract_term_months = rider.contractTermMonths;
  if (rider.contractEnd !== undefined) row.contract_end = rider.contractEnd;
  if (rider.guarantorName !== undefined) row.guarantor_name = rider.guarantorName;
  if (rider.guarantorPhone !== undefined) row.guarantor_phone = rider.guarantorPhone;
  if (rider.witnessName !== undefined) row.witness_name = rider.witnessName;
  if (rider.witnessPhone !== undefined) row.witness_phone = rider.witnessPhone;
  if (rider.active !== undefined) row.active = rider.active;
  if (rider.bikeId !== undefined) row.bike_id = rider.bikeId;
  if (rider.notes !== undefined) row.notes = rider.notes;
  if (rider.location !== undefined) row.location = rider.location;
  return row;
}

export function paymentFromRow(row: PaymentRow): Payment {
  return {
    id: row.id,
    riderId: row.rider_id,
    amount: row.amount,
    gatewayRef: row.id,
    transactionId: row.transaction_id ?? undefined,
    provider: row.provider ?? undefined,
    msisdn: row.msisdn ?? undefined,
    status: row.status,
    recordedAt: row.recorded_at,
    verifiedBy: row.verified_by ?? undefined,
  };
}

export function paymentToRow(payment: Partial<Payment> & { riderId: string; amount: number }): Partial<PaymentRow> {
  return {
    id: payment.gatewayRef || payment.id,
    rider_id: payment.riderId,
    amount: payment.amount,
    transaction_id: payment.transactionId,
    provider: payment.provider,
    msisdn: payment.msisdn,
    status: payment.status,
    recorded_at: payment.recordedAt,
    verified_by: payment.verifiedBy,
  };
}

export interface Payout {
  id: string;
  amount: number;
  phoneNumber: string;
  provider?: string;
  recipientName?: string;
  narration?: string;
  status: string;
  initiatedBy?: string;
  gatewayMessage?: string;
  operatorReference?: string;
  fspReferenceId?: string;
  recordedAt: string;
}

export function payoutFromRow(row: PayoutRow): Payout {
  return {
    id: row.id,
    amount: row.amount,
    phoneNumber: row.phone_number,
    provider: row.provider ?? undefined,
    recipientName: row.recipient_name ?? undefined,
    narration: row.narration ?? undefined,
    status: row.status,
    initiatedBy: row.initiated_by ?? undefined,
    gatewayMessage: row.gateway_message ?? undefined,
    operatorReference: row.operator_reference ?? undefined,
    fspReferenceId: row.fsp_reference_id ?? undefined,
    recordedAt: row.recorded_at,
  };
}
