import { TEventName } from "../constant";
import { IMessageQueueProducer } from "../message-queue";
import { TEventPayloadMapper } from "./event-payload-mapper";

export abstract class EventHandler<T extends TEventName> {
  static readonly derived = new Map<
    TEventName,
    new (...args: any[]) => EventHandler<TEventName>
  >();
  readonly eventName: T;

  producer: IMessageQueueProducer;
  constructor(eventName: T, producer: IMessageQueueProducer) {
    this.eventName = eventName;
    this.producer = producer;
  }
  abstract execute(payload: TEventPayloadMapper[T]): Promise<void> | void;
}
