import amqplib from "amqplib";
import { ClassConstructor, plainToInstance } from "class-transformer";
import {
  EVENT_PAYLOAD_MAPPER,
  IMessageQueueConsumer,
  TEventName,
  TEventPayloadMapper,
  TTopic,
} from "../../interfaces";
import { RabbitMQConnector } from "./connector";
export class RabbitMQConsumer implements IMessageQueueConsumer {
  connector: RabbitMQConnector;
  exchange: TTopic;
  consumer!: amqplib.Channel;

  constructor(connector: RabbitMQConnector, exchange: TTopic) {
    this.connector = connector;
    this.exchange = exchange;
  }

  async consume<T extends TEventName>(
    eventName: T,
    callback: (data: TEventPayloadMapper[T]) => Promise<void> | void
  ): Promise<void> {
    if (!this.consumer) throw new Error("Consumer has not existed");
    const assertQueue = await this.consumer.assertQueue("", {
      durable: true,
    });
    this.consumer.bindQueue(assertQueue.queue, this.exchange, eventName);
    this.consumer.consume(
      assertQueue.queue,
      async (msg) => {
        if (!msg?.content) throw new Error("Message content not found");
        const temp = EVENT_PAYLOAD_MAPPER?.[eventName as TEventName];
        if (!temp) throw new Error("Event not supported");

        const data: TEventPayloadMapper[T] = plainToInstance<
          TEventPayloadMapper[T],
          object
        >(
          temp as ClassConstructor<TEventPayloadMapper[T]>,
          JSON.parse(msg.content.toString()) as object
        );

        await callback(data);
        this.consumer.ack(msg);
      },
      {
        noAck: false,
      }
    );
  }

  async createConsumer() {
    this.consumer = await this.connector.getConnection().createChannel();
    this.consumer.assertExchange(this.exchange, "topic", {
      durable: true,
    });
    this.consumer.prefetch(1);
  }

  async close(): Promise<void> {
    await this.consumer.close().catch((error) => console.log(error));
  }

  getTopic(): TTopic {
    return this.exchange;
  }
}
