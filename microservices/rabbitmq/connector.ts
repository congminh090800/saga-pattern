import amqplib from "amqplib";
import { IMessageQueueConnector, TMessageQueue } from "../../interfaces";

export class RabbitMQConnector implements IMessageQueueConnector {
  readonly name: TMessageQueue = "rabbitmq";
  private connection!: amqplib.Connection;

  async connect(connectionString: string): Promise<void> {
    this.connection = await amqplib.connect(connectionString);
  }

  getConnection(): amqplib.Connection {
    return this.connection;
  }

  getName(): TMessageQueue {
    return this.name;
  }
}
