import { TEventName, TTopic } from "../constant";
import { IMessageQueueEvent, TEventPayloadMapper } from "../event";

export interface IMessageQueueConsumer {
  consumer: any;
  createConsumer(): Promise<void> | void;

  consume<T extends TEventName>(
    eventName: T,
    callback: (data: TEventPayloadMapper[T]) => Promise<void> | void
  ): Promise<void> | void;

  close(): Promise<void> | void;

  getTopic(): TTopic;
}
