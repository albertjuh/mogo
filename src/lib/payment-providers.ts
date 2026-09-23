/**
 * Mobile money networks supported by AzamPay MNO checkout.
 * `id` is the exact provider value AzamPay expects in the checkout request.
 * Shared by the client (Lipa page picker) and the server actions.
 */
export const MOBILE_PROVIDERS = [
  { id: "Mpesa", label: "M-Pesa", network: "Vodacom", prefixes: ["74", "75", "76"] },
  { id: "Tigo", label: "Mixx by Yas", network: "Yas / Tigo Pesa", prefixes: ["65", "67", "71", "77"] },
  { id: "Airtel", label: "Airtel Money", network: "Airtel", prefixes: ["68", "69", "78"] },
  { id: "Halopesa", label: "HaloPesa", network: "Halotel", prefixes: ["61", "62"] },
  { id: "Azampesa", label: "AzamPesa", network: "Azam", prefixes: [] },
] as const;

export type MobileProvider = (typeof MOBILE_PROVIDERS)[number]["id"];

export function isMobileProvider(value: string): value is MobileProvider {
  return MOBILE_PROVIDERS.some((p) => p.id === value);
}

export function providerLabel(id: string | undefined): string {
  return MOBILE_PROVIDERS.find((p) => p.id === id)?.label ?? id ?? "Mobile Money";
}

/**
 * Normalises a Tanzanian mobile number to the 255XXXXXXXXX form AzamPay
 * expects. Returns null if it doesn't look like a valid TZ mobile number.
 */
export function normaliseTzPhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("255")) digits = digits.slice(3);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  if (!/^[67]\d{8}$/.test(digits)) return null;
  return `255${digits}`;
}

/** Guesses the mobile network from a phone number's prefix, e.g. 0754… → M-Pesa. */
export function detectProvider(phone: string): MobileProvider | null {
  const normalised = normaliseTzPhone(phone);
  if (!normalised) return null;
  const prefix = normalised.slice(3, 5);
  return MOBILE_PROVIDERS.find((p) => (p.prefixes as readonly string[]).includes(prefix))?.id ?? null;
}
