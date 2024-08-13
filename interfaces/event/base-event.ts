import { TEventName } from "../constant";
import { TEventPayloadMapper } from "./event-payload-mapper";

export interface IMessageQueueEvent<T extends TEventName> {
  eventName: T;
  message: TEventPayloadMapper[T];
}

export class MessageQueueEvent<T extends TEventName>
  implements IMessageQueueEvent<T>
{
  eventName: T;
  message: TEventPayloadMapper[T];
  constructor(eventName: T, message: TEventPayloadMapper[T]) {
    this.eventName = eventName;
    this.message = message;
  }
}
