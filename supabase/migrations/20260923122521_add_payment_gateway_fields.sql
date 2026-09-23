-- The AzamPay webhook records these gateway-side references on the payment,
-- mirroring what it already stores on payouts.

alter table public.payments add column operator_reference text;
alter table public.payments add column fsp_reference_id text;
alter table public.payments add column gateway_message text;
