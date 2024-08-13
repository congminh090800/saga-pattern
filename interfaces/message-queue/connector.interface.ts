import { TMessageQueue } from "../constant";

export interface IMessageQueueConnector {
  readonly name: TMessageQueue;

  connect(connectionString: string): Promise<void> | void;

  getName(): TMessageQueue;
}
