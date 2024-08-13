import { instanceToPlain } from "class-transformer";
import {
  EventHandler,
  MessageQueueEvent,
  SendWsSignalFailedEventPayload,
  UpdateClaimHistoryFailedEventPayload,
  WsSignalSentEventPayload,
} from "../../interfaces";
import { getRandomString, mockAsyncCall } from "../utils";

export class WsSignalSentEventHandler extends EventHandler<"ws_signal_sent"> {
  static readonly derivedAdder = EventHandler.derived.set(
    "ws_signal_sent",
    WsSignalSentEventHandler
  );
  async execute(payload: WsSignalSentEventPayload): Promise<void> {
    console.log(
      `[RECEIVE EVENT] [WS SINGAL SENT PAYLOAD] [${JSON.stringify(payload)}]`
    );
    // I don't do anything here, but if you want more control over the distributed transaction
    // you can create a record from beginning of the transaction and update its status as finished here
  }
}

export class SendWsSignalFailedEventHandler extends EventHandler<"send_ws_signal_failed"> {
  static readonly derivedAdder = EventHandler.derived.set(
    "send_ws_signal_failed",
    SendWsSignalFailedEventHandler
  );
  async execute(payload: SendWsSignalFailedEventPayload): Promise<void> {
    // * we will not have a try-catch block here to make sure the message will not be ack if its failed and retry afterwards
    console.log(
      `[RECEIVE EVENT] [SEND WS SIGNAL FAILED EVENT] [${JSON.stringify(
        payload
      )}]`
    );
    // at this point, what to do next is depend on you. You can rollback notification status or just save
    // it into database for monitoring. I am gonna delete newly created claim history record
    console.log(
      await mockAsyncCall(
        false,
        `Get notification id and delete newly created claim history
        from ${payload.claimHistoryId} (notification id is mocked because no datasource currently)`,
        null,
        1000
      )
    );
    // do roll-back
    const event = new MessageQueueEvent(
      "update_claim_history_failed",
      new UpdateClaimHistoryFailedEventPayload(
        getRandomString(10),
        "Mock update claim history failed reason"
      )
    );
    await this.producer.publish("claim_portal_service", event);
  }
}
