import {
  SendWsSignalFailedEventPayload,
  UpdateNotificationStatusFailedEventPayload,
  WsSignalSentEventPayload,
} from "./../../interfaces/event/event-payload-mapper";
import { instanceToPlain } from "class-transformer";
import {
  ClaimHistoryUpdatedEventPayload,
  EventHandler,
  MessageQueueEvent,
  NotificationStatusUpdatedEventPayload,
  UpdateClaimHistoryFailedEventPayload,
} from "../../interfaces";
import { getRandomInteger, mockAsyncCall } from "../utils";

export class UpdateNotificationStatusFailedEventHandler extends EventHandler<"update_notification_status_failed"> {
  static readonly derivedAdder = EventHandler.derived.set(
    "update_notification_status_failed",
    UpdateNotificationStatusFailedEventHandler
  );
  async execute(
    payload: UpdateNotificationStatusFailedEventPayload
  ): Promise<void> {
    // You can do anything here you want, but I only want alert to the system.
    console.log(
      `[RECEIVE EVENT] [UPDATE NOTIFICATION STATUS FAILED] [${JSON.stringify(
        payload
      )}]`
    );
    console.log(
      "Alerted transaction reverted to third party logging (telegram, teams, slack, email,...)"
    );
  }
}

export class NotificationStatusUpdatedEventHandler extends EventHandler<"notification_status_updated"> {
  static readonly derivedAdder = EventHandler.derived.set(
    "notification_status_updated",
    NotificationStatusUpdatedEventHandler
  );
  async execute(payload: NotificationStatusUpdatedEventPayload): Promise<void> {
    try {
      console.log(
        `[RECEIVE EVENT] [NOTIFICATION STATUS UPDATED EVENT] [${JSON.stringify(
          payload
        )}]`
      );
      const claimHistoryId = await mockAsyncCall(
        false,
        getRandomInteger(100000, 999999),
        undefined,
        1000
      );
      console.log(`Updated claim history ${claimHistoryId}`);
      const event = new MessageQueueEvent(
        "claim_history_updated",
        new ClaimHistoryUpdatedEventPayload(
          claimHistoryId,
          payload.notificationId
        )
      );
      await this.producer.publish("claim_portal_service", event);
    } catch (error) {
      const fallbackEvent = new MessageQueueEvent(
        "update_claim_history_failed",
        new UpdateClaimHistoryFailedEventPayload(
          payload.notificationId,
          "mock fallback reason"
        )
      );
      await this.producer.publish("claim_portal_service", fallbackEvent);
    }
  }
}

export class UpdateClaimHistoryFailedEventHandler extends EventHandler<"update_claim_history_failed"> {
  static readonly derivedAdder = EventHandler.derived.set(
    "update_claim_history_failed",
    UpdateClaimHistoryFailedEventHandler
  );
  async execute(payload: UpdateClaimHistoryFailedEventPayload): Promise<void> {
    // * we will not have a try-catch block here to make sure the message will not be ack if its failed and retry afterwards
    console.log(
      `[RECEIVE EVENT] [UPDATE CLAIM HISTORY FAILED EVENT] [${JSON.stringify(
        payload
      )}]`
    );
    // at this point, what to do next is depend on you. You can rollback notification status or just save
    // it into database for monitoring. I am gonna rollback notification status
    console.log(
      await mockAsyncCall(
        false,
        `Rollback-ed notification status ${payload.sentNotificationId}`,
        null,
        1000
      )
    );
    // do roll-back
    const event = new MessageQueueEvent(
      "update_notification_status_failed",
      new UpdateNotificationStatusFailedEventPayload(
        payload.sentNotificationId,
        "SEND_FAILED",
        "Mock update noti status failed reason"
      )
    );
    await this.producer.publish("claim_portal_service", event);
  }
}

export class ClaimHistoryUpdatedEventHandler extends EventHandler<"claim_history_updated"> {
  static readonly derivedAdder = EventHandler.derived.set(
    "claim_history_updated",
    ClaimHistoryUpdatedEventHandler
  );
  async execute(payload: ClaimHistoryUpdatedEventPayload): Promise<void> {
    try {
      console.log(
        `[RECEIVE EVENT] [CLAIM HISTORY UPDATED EVENT] [${JSON.stringify(
          payload
        )}]`
      );
      console.log(await mockAsyncCall(false, "Send ws signal", null, 1000));
      const event = new MessageQueueEvent(
        "ws_signal_sent",
        new WsSignalSentEventPayload(
          `Ws message: Claim history updated {{claimId}}`,
          payload.claimHistoryId
        )
      );
      await this.producer.publish("notify_service", event);
    } catch (error) {
      const fallbackEvent = new MessageQueueEvent(
        "send_ws_signal_failed",
        new SendWsSignalFailedEventPayload(
          `Ws message: Claim history updated {{claimId}}`,
          payload.claimHistoryId,
          "Mock send ws signal failed reason"
        )
      );
      await this.producer.publish("notify_service", fallbackEvent);
    }
  }
}

export class MockClaimHistoryUpdatedEventHandler extends EventHandler<"mock_claim_history_updated"> {
  static readonly derivedAdder = EventHandler.derived.set(
    "mock_claim_history_updated",
    MockClaimHistoryUpdatedEventHandler
  );
  async execute(payload: ClaimHistoryUpdatedEventPayload): Promise<void> {
    try {
      console.log(
        `[RECEIVE EVENT] [MOCK CLAIM HISTORY UPDATED EVENT] [${JSON.stringify(
          payload
        )}]`
      );
      await mockAsyncCall(
        true,
        undefined,
        new Error(
          `Failed to send ws signal on claim history ${payload.claimHistoryId} creation`
        ),
        1000
      );
    } catch (error) {
      const fallbackEvent = new MessageQueueEvent(
        "send_ws_signal_failed",
        new SendWsSignalFailedEventPayload(
          `Ws message: Claim history updated {{claimId}}`,
          payload.claimHistoryId,
          "Mock send ws signal failed reason"
        )
      );
      await this.producer.publish("notify_service", fallbackEvent);
    }
  }
}
