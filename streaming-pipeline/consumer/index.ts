import { Kafka } from "kafkajs";

import { handleLogging, timeExecution } from "./utils";

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

async function processBatch(
  batch: any,
  resolveOffset: (offset: string) => void,
  commitOffsetsIfNecessary: () => Promise<void>,
  heartbeat: () => Promise<void>
) {
  for (const message of batch.messages) {
    // Process the message (warning: ensure this is idempotent via IDs, caching, etc.)
    resolveOffset(message.offset); // Mark as processed
  }

  const lastMessage = batch.messages.at(-1)!;
  handleLogging(lastMessage, batch);
  await commitOffsetsIfNecessary(); // Commit offsets for the batch
  await heartbeat();
}

async function run() {
  await _waitForTopic(); // Wait for topic before starting
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: false });

  await consumer.run({
    eachBatch: async ({
      batch,
      resolveOffset,
      heartbeat,
      commitOffsetsIfNecessary,
    }) => {
      await timeExecution(() =>
        // Batch messages for more efficient processing and higher throughput
        processBatch(batch, resolveOffset, commitOffsetsIfNecessary, heartbeat)
      )();
    },
  });
}

run().catch(console.error);
