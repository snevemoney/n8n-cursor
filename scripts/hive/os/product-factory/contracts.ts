/**
 * Product-factory contracts. Next SKU implements these.
 * Do not invent an auth vendor. Do not live-wire Stripe.
 * ProofCheck attach: /Users/evenslouis/proof-qc-assist/src/lib/loginPrimitive.ts
 * (wraps AuthContext's supabase client; AuthContext stays the React UI)
 */

export type AuthError = { message: string };

export type AuthSession = {
  userId: string | null;
  email: string | null;
};

/** Email/session only. Map to existing ProofCheck / CE auth. */
export type LoginPrimitive = {
  getSession(): Promise<AuthSession | null>;
  signIn(
    email: string,
    password: string,
  ): Promise<{ error: AuthError | null }>;
  signUp(
    email: string,
    password: string,
  ): Promise<{ error: AuthError | null }>;
  signOut(): Promise<void>;
};

export type PaymentIntent = {
  sku: string;
  amountCents: number;
  currency: "cad" | "usd";
};

export type PaymentStatus = "stub" | "awaiting_hitl" | "refused";

/**
 * Never charges. Returns awaiting_hitl until Evens names pay.
 * No Stripe keys in this module.
 */
export type PaymentsPrimitive = {
  proposeCharge(
    intent: PaymentIntent,
  ): Promise<{ status: PaymentStatus; id: string }>;
};

export type ShareCard = {
  title: string;
  description: string;
  ogImage: string | null;
  url: string;
  copyHook: string;
};

export type PaymentsPrimitiveImpl = PaymentsPrimitive & {
  readonly live: false;
};

export function refuseLiveCharge(): { status: "refused"; id: "hitl" } {
  return { status: "refused", id: "hitl" };
}
