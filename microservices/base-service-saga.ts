import {
  EventHandler,
  IMessageQueueConsumer,
  IMessageQueueProducer,
  TEventName,
} from "../interfaces";

export class MicroserviceSaga {
  events: TEventName[];
  consumer: IMessageQueueConsumer;
  producer: IMessageQueueProducer;
  static eventHandlerLoader = require("./event-handler");

  constructor(
    consumer: IMessageQueueConsumer,
    producer: IMessageQueueProducer,
    events: Array<TEventName>
  ) {
    this.consumer = consumer;
    this.producer = producer;
    this.events = events;
  }

  async close(): Promise<void> {
    await Promise.all([this.consumer.close, this.producer.close]);
  }

  async listen(): Promise<void> {
    for (const event of this.events) {
      const constructor = EventHandler.derived.get(event);
      if (constructor) {
        const handler = new constructor(event, this.producer);
        await this.consumer.consume(
          event,
          async (data) => await handler.execute(data)
        );
        console.log(
          `[SAGA] Listening to event ${event} on topic ${this.consumer.getTopic()}`
        );
      }
    }
  }
}
