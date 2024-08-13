import amqplib from "amqplib";
import { instanceToPlain } from "class-transformer";
import {
  IMessageQueueEvent,
  IMessageQueueProducer,
  TEventName,
  TOPICS,
  TTopic,
} from "../../interfaces";
import { RabbitMQConnector } from "./connector";

export class RabbitMQProducer implements IMessageQueueProducer {
  connector: RabbitMQConnector;
  publisher!: amqplib.Channel;

  constructor(connector: RabbitMQConnector) {
    this.connector = connector;
  }

  async createPublisher() {
    this.publisher = await this.connector.getConnection().createChannel();
    for (const topic of TOPICS) {
      this.publisher.assertExchange(topic, "topic", {
        durable: true,
      });
    }
  }

  async publish<T extends TEventName>(
    topic: TTopic,
    event: IMessageQueueEvent<T>
  ): Promise<void> {
    if (!this.publisher) throw new Error("Publisher has not existed");
    try {
      const plainMsg = instanceToPlain(event.message);
      this.publisher.publish(
        topic,
        event.eventName,
        Buffer.from(JSON.stringify(plainMsg))
      );
    } catch (error) {
      // save this publish message to somewhere else so that we can retry it later
      // the retry mechanism is on your choice
      // The retry limit could also be implemented to reduce traffic
    }
  }

  async close(): Promise<void> {
    await this.publisher.close().catch((error) => console.log(error));
  }
}
