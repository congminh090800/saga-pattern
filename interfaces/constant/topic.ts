export const TOPICS = [
  "claim_portal_service",
  "email_service",
  "notify_service",
] as const;

export type TTopic = (typeof TOPICS)[number];
