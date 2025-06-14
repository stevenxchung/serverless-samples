import { Kafka, type KafkaMessage } from "kafkajs";
import pino from "pino";

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: { colorize: true },
  },
});

const clientId = process.env.CLIENT_ID || "demo-consumer";
const brokers = [process.env.KAFKA_BROKER || "localhost:9092"];
const topic = process.env.KAFKA_TOPIC || "demo-topic";
const groupId = process.env.KAFKA_GROUP_ID || "demo-group";

const kafka = new Kafka({ clientId, brokers });
const consumer = kafka.consumer({ groupId });

async function _waitForTopic() {
  const admin = kafka.admin();
  const timeout = 1000 * 60; // 60 seconds
  const interval = 1000; // 1 second
  await admin.connect();
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const topics = await admin.listTopics();
    if (topics.includes(topic)) {
      await admin.disconnect();
      return;
    }
    await new Promise((res) => setTimeout(res, interval));
  }
  await admin.disconnect();
  throw new Error(`Timeout waiting for topic "${topic}"`);
}

function _handleLogging(message: KafkaMessage, partition: number) {
  const value = message.value?.toString() || "";
  if (!/\d/.test(value) || Number(message.offset) % 100 === 0) {
    // Log non-bulk messages or log every 100th message
    logger.info(
      `Processed and committed offset: ${message.offset} (topic: ${topic}, partition: ${partition})`
    );
  }
}

async function run() {
  await _waitForTopic(); // Wait for topic before starting
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      // Commit the offset after successful processing
      await consumer.commitOffsets([
        {
          topic,
          partition,
          offset: (Number(message.offset) + 1).toString(), // Increment to `offset + 1` since message at `offset` was processed
        },
      ]);
      _handleLogging(message, partition);
    },
  });
}

run().catch(console.error);
