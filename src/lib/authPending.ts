export const PENDING_SIGNUP_KEY = "ayanfe-pending-signup";

export type PendingSignup = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  /** True when ZeptoMail accepted the message */
  delivered?: boolean;
  /** Only present when ZeptoMail is unavailable in non-production */
  previewCode?: string;
  mailMessage?: string;
};
