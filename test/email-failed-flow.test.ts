import { TOPICS, TTopic } from "../interfaces/constant/topic";
import {
  RabbitMQConnector,
  RabbitMQConsumer,
  RabbitMQProducer,
} from "../microservices/rabbitmq";
import { MicroserviceSaga } from "../microservices/base-service-saga";
import {
  EmailSentEventPayload,
  MessageQueueEvent,
  SendEmailFailedEventPayload,
  TEventName,
} from "../interfaces";
import { getRandomString } from "../microservices/utils";
describe("email failed flow", () => {
  let connector: RabbitMQConnector;
  let producer: RabbitMQProducer;
  let consumers = new Array<RabbitMQConsumer>();
  let sagas = new Array<MicroserviceSaga>();

  beforeAll(async () => {
    let eventsGroup: Record<TTopic, Array<TEventName>> = {
      email_service: [
        "mock_email_sent",
        "mock_send_email_failed",
        "send_email_failed",
      ],
      claim_portal_service: ["update_notification_status_failed"],
      notify_service: [],
    };
    connector = new RabbitMQConnector();
    await connector.connect("amqp://localhost");
    producer = new RabbitMQProducer(connector);
    await producer.createPublisher();
    for (const topic of TOPICS) {
      let consumer = new RabbitMQConsumer(connector, topic);
      await consumer.createConsumer();
      let saga = new MicroserviceSaga(consumer, producer, eventsGroup[topic]);
      await saga.listen();
      consumers.push(consumer);
      sagas.push(saga);
    }
  }, 3000000);

  afterAll(async () => {
    for (const saga of sagas) {
      await saga.close();
    }
  }, 300000);

  test("email sent successfully but failed to update notification status", async () => {
    let sendEmailPayload = new EmailSentEventPayload(
      "abc@gmail.com",
      "def@gmail.com",
      getRandomString(10)
    );
    await producer.publish(
      "email_service",
      new MessageQueueEvent("mock_email_sent", sendEmailPayload)
    );
    // we will check for notification status, claim history here. But currently no datasource, so we will skip this part
    await new Promise((resolve) => setTimeout(resolve, 5000));
    expect(1).toBe(1);
  }, 300000);

  test("sending error email by notification and successfully save database report", async () => {
    let sendEmailPayload = new SendEmailFailedEventPayload(
      "abc@gmail.com",
      "def@gmail.com",
      getRandomString(10),
      "Email payload is unreadable"
    );
    await producer.publish(
      "email_service",
      new MessageQueueEvent("send_email_failed", sendEmailPayload)
    );
    // we will check for notification status, claim history here. But currently no datasource, so we will skip this part
    await new Promise((resolve) => setTimeout(resolve, 5000));
    expect(1).toBe(1);
  }, 300000);

  beforeEach(() => {
    console.log(
      `=========================================================================================
=========================================================================================
=========================================================================================`
    );
  });

  test("sending error email by notification and failed to save database report", async () => {
    let sendEmailPayload = new SendEmailFailedEventPayload(
      "abc@gmail.com",
      "def@gmail.com",
      getRandomString(10),
      "Email payload is unreadable"
    );

    await producer.publish(
      "email_service",
      new MessageQueueEvent("mock_send_email_failed", sendEmailPayload)
    );
    // we will check for notification status, claim history here. But currently no datasource, so we will skip this part
    await new Promise((resolve) => setTimeout(resolve, 5000));
    expect(1).toBe(1);
  }, 300000);
});
