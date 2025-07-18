import { Kafka } from "kafkajs";
import { createClient } from "redis";
import { handleLogging, logger, timeExecution } from "./utils";

// Consumer API properties
const port = Number(process.env.PORT) || 3001;
const apiUrlPrefix = "/consumer-api";

// Setup Kafka
const clientId = process.env.CLIENT_ID || "demo-consumer";
const brokers = [process.env.KAFKA_BROKER || "localhost:9092"];
const topic = process.env.KAFKA_TOPIC || "demo-topic";
const groupId = process.env.KAFKA_GROUP_ID || "demo-group";
const kafka = new Kafka({ clientId, brokers });
const consumer = kafka.consumer({ groupId });

// Setup Redis
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redisClient = createClient({ url: redisUrl });

redisClient.on("error", (err) => console.error("Redis Client Error", err));

interface KeyValueObject {
  key: string;
  value: string;
}

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
    const valueStr = message.value?.toString();
    try {
      const { key, value }: KeyValueObject = JSON.parse(valueStr);

      // Increment count in sorted set called 'key_counts'
      await redisClient.zIncrBy("key_counts", 1, key);
      // Optionally, save key and value
      // await redisClient.set(key, value);
      // Process the message (warning: ensure this is idempotent via IDs, caching, etc.)
      resolveOffset(message.offset); // Mark as processed
    } catch (err) {
      logger.error("Failed to process message:", valueStr, err);
      // Exit on failure to avoid committing offsets
      return;
    }
  }

  const lastMessage = batch.messages.at(-1)!;
  handleLogging(lastMessage, batch);
  await commitOffsetsIfNecessary(); // Commit offsets for the batch
  await heartbeat();
}

async function run() {
  await redisClient.connect(); // Connect to Redis before consuming
  logger.info(`Redis connected: ${redisUrl}`);

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

await run().catch(async (err) => {
  logger.error(err);
  await consumer.disconnect();
  await redisClient.destroy();
});

// Note: this REST endpoint would be another service decoupled from the consumer in a production app
Bun.serve({
  port,
  async fetch(req: Request) {
    const url = new URL(req.url);
    // GET /consumer-api/leaderboard?top=<N>
    if (
      req.method === "GET" &&
      url.pathname.includes(`${apiUrlPrefix}/leaderboard`)
    ) {
      // Support top N
      const top = parseInt(url.searchParams.get("top") || "10", 10);
      const leaderboard = await redisClient.zRangeWithScores(
        "key_counts",
        0,
        top - 1,
        { REV: true }
      );
      return new Response(JSON.stringify(leaderboard), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

logger.info(`REST API listening on http://localhost:${port}`);
