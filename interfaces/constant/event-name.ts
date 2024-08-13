export const EMAIL_SERVICE_EVENT_NAMES = [
  "email_sent",
  "send_email_failed",
  "mock_email_sent",
  "mock_send_email_failed",
] as const;
export type TEventNameEmailService = (typeof EMAIL_SERVICE_EVENT_NAMES)[number];

export const CLAIM_PORTAL_SERVICE_EVENT_NAMES = [
  "notification_status_updated",
  "update_notification_status_failed",
  "claim_history_updated",
  "update_claim_history_failed",
  "mock_claim_history_updated",
] as const;
export type TEventNameClaimPortalService =
  (typeof CLAIM_PORTAL_SERVICE_EVENT_NAMES)[number];

export const SEND_NOTIFY_SERVICE_EVENT_NAMES = [
  "ws_signal_sent",
  "send_ws_signal_failed",
] as const;
export type TEventNameSendWsSignal =
  (typeof SEND_NOTIFY_SERVICE_EVENT_NAMES)[number];

export type TEventName =
  | TEventNameEmailService
  | TEventNameClaimPortalService
  | TEventNameSendWsSignal;
