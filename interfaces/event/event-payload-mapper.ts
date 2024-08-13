import { ClassConstructor } from "class-transformer";
import { TEventName } from "../constant";

export class EmailSentEventPayload {
  from: string;
  to: string;
  notificationId: string;
  constructor(from: string, to: string, notificationId: string) {
    this.from = from;
    this.to = to;
    this.notificationId = notificationId;
  }
}

export class SendEmailFailedEventPayload extends EmailSentEventPayload {
  reason: string;
  constructor(from: string, to: string, payload: string, reason: string) {
    super(from, to, payload);
    this.reason = reason;
  }
}

export class ClaimHistoryUpdatedEventPayload {
  claimHistoryId: number;
  sentNotificationId: string;
  constructor(claimId: number, sentNotificationId: string) {
    this.claimHistoryId = claimId;
    this.sentNotificationId = sentNotificationId;
  }
}

export class UpdateClaimHistoryFailedEventPayload {
  sentNotificationId: string;
  reason: string;
  constructor(sentNotificationId: string, reason: string) {
    this.reason = reason;
    this.sentNotificationId = sentNotificationId;
  }
}

export class NotificationStatusUpdatedEventPayload {
  notificationId: string;
  status: string;
  constructor(notificationId: string, status: string) {
    this.notificationId = notificationId;
    this.status = status;
  }
}

export class UpdateNotificationStatusFailedEventPayload extends NotificationStatusUpdatedEventPayload {
  reason: string;

  constructor(notificationId: string, status: string, reason: string) {
    super(notificationId, status);
    this.reason = reason;
  }
}

export class WsSignalSentEventPayload {
  msgTemplate: string;
  claimHistoryId: number;
  constructor(msgTemplate: string, claimHistoryId: number) {
    this.msgTemplate = msgTemplate;
    this.claimHistoryId = claimHistoryId;
  }
}

export class SendWsSignalFailedEventPayload extends WsSignalSentEventPayload {
  reason: string;
  constructor(msgTemplate: string, claimHistoryId: number, reason: string) {
    super(msgTemplate, claimHistoryId);
    this.reason = reason;
  }
}

export const EVENT_PAYLOAD_MAPPER = {
  email_sent: EmailSentEventPayload,
  claim_history_updated: ClaimHistoryUpdatedEventPayload,
  notification_status_updated: NotificationStatusUpdatedEventPayload,
  send_email_failed: SendEmailFailedEventPayload,
  update_claim_history_failed: UpdateClaimHistoryFailedEventPayload,
  update_notification_status_failed: UpdateNotificationStatusFailedEventPayload,
  ws_signal_sent: WsSignalSentEventPayload,
  send_ws_signal_failed: SendWsSignalFailedEventPayload,
  mock_email_sent: EmailSentEventPayload,
  mock_send_email_failed: SendEmailFailedEventPayload,
  mock_claim_history_updated: ClaimHistoryUpdatedEventPayload,
} as const satisfies Record<TEventName, ClassConstructor<any>>;

export type TEventPayloadMapper = {
  [p in TEventName]: InstanceType<(typeof EVENT_PAYLOAD_MAPPER)[p]>;
};
