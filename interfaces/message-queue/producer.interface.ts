import { TEventName, TTopic } from "../constant";
import { IMessageQueueEvent } from "../event";
import { IMessageQueueConnector } from "./connector.interface";

export interface IMessageQueueProducer {
  publisher: any;

  createPublisher(): Promise<void> | void;

  publish<T extends TEventName>(
    topic: TTopic,
    event: IMessageQueueEvent<T>
  ): Promise<void>;

  close(): Promise<void>;
}
