import { UpdateNotificationStatusFailedEventPayload } from "./../../interfaces/event/event-payload-mapper";
import { MessageQueueEvent } from "./../../interfaces/event/base-event";
import { instanceToPlain } from "class-transformer";
import {
  EmailSentEventPayload,
  EventHandler,
  NotificationStatusUpdatedEventPayload,
  SendEmailFailedEventPayload,
} from "../../interfaces";
import { getRandomString, mockAsyncCall } from "../utils";

export class EmailSentEventHandler extends EventHandler<"email_sent"> {
  static readonly derivedAdder = EventHandler.derived.set(
    "email_sent",
    EmailSentEventHandler
  );

  async execute(payload: EmailSentEventPayload): Promise<void> {
    try {
      console.log(`[RECEIVE EVENT] [EMAIL SENT] [${JSON.stringify(payload)}]`);
      console.log(
        await mockAsyncCall(
          false,
          `Updated notification ${payload.notificationId} status to SEND_SUCCESS`,
          null,
          1000
        )
      );
      const event = new MessageQueueEvent(
        "notification_status_updated",
        new NotificationStatusUpdatedEventPayload(
          payload.notificationId,
          "SEND_SUCCESS"
        )
      );
      await this.producer.publish("claim_portal_service", event);
    } catch (error) {
      const fallbackEvent = new MessageQueueEvent(
        "update_notification_status_failed",
        new UpdateNotificationStatusFailedEventPayload(
          payload.notificationId,
          "SEND_FAILED",
          "Mock update noti status failed reason"
        )
      );
      await this.producer.publish("claim_portal_service", fallbackEvent);
    }
  }
}

export class MockEmailSentEventHandler extends EventHandler<"mock_email_sent"> {
  static readonly derivedAdder = EventHandler.derived.set(
    "mock_email_sent",
    MockEmailSentEventHandler
  );

  async execute(payload: EmailSentEventPayload): Promise<void> {
    try {
      console.log(
        `[RECEIVE EVENT] [MOCK EMAIL SENT] [${JSON.stringify(payload)}]`
      );
      await mockAsyncCall(
        true,
        undefined,
        new Error(`Failed to notification ${payload.notificationId} status`),
        1000
      );
    } catch (error) {
      const fallbackEvent = new MessageQueueEvent(
        "update_notification_status_failed",
        new UpdateNotificationStatusFailedEventPayload(
          payload.notificationId,
          "SEND_FAILED",
          "Mock update noti status failed reason"
        )
      );
      await this.producer.publish("claim_portal_service", fallbackEvent);
    }
  }
}

export class SendEmailFailedEventHandler extends EventHandler<"send_email_failed"> {
  static readonly derivedAdder = EventHandler.derived.set(
    "send_email_failed",
    SendEmailFailedEventHandler
  );

  async execute(payload: SendEmailFailedEventPayload): Promise<void> {
    try {
      console.log(
        `[RECEIVE EVENT] [SEND EMAIL FAILED] [${JSON.stringify(payload)}]`
      );
      console.log(
        await mockAsyncCall(
          false,
          "Saved failed one to database for monitoring",
          null,
          1000
        )
      );
    } catch (error) {
      console.log(
        "Alerted error on saved failed event to database to third party logging (telegram, teams, slack, email,...)"
      );
    }
  }
}

export class MockSendEmailFailedEventHandler extends EventHandler<"mock_send_email_failed"> {
  static readonly derivedAdder = EventHandler.derived.set(
    "mock_send_email_failed",
    MockSendEmailFailedEventHandler
  );

  async execute(payload: SendEmailFailedEventPayload): Promise<void> {
    try {
      console.log(
        `[RECEIVE EVENT] [MOCK SEND EMAIL FAILED] [${JSON.stringify(payload)}]`
      );
      await mockAsyncCall(
        true,
        undefined,
        new Error("Failed to saved failed email report to database"),
        1000
      );
    } catch (error) {
      console.log(
        "Alerted error on saved failed event to database to third party logging (telegram, teams, slack, email,...)"
      );
    }
  }
}
