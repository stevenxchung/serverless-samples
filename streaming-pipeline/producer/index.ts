import { randomUUIDv7 } from "bun";
import { Kafka } from "kafkajs";
import pino from "pino";

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: { colorize: true },
  },
});

// Producer API properties
const port = Number(process.env.PORT) || 3000;
const apiUrlPrefix = "/producer-api";

// Setup Kafka
const clientId = process.env.CLIENT_ID || "demo-producer";
const brokers = [process.env.KAFKA_BROKER || "localhost:9092"];
const topic = process.env.KAFKA_TOPIC || "demo-topic";
const batchSize = Number(process.env.MAX_BATCH_SIZE) || 10000;
const kafka = new Kafka({ clientId, brokers });
const producer = kafka.producer({
  idempotent: false,
  allowAutoTopicCreation: false,
});

// interface SendMessageBody {
//   message: string;
// }

interface KeyValueObject {
  key: string;
  value: string;
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function _handleSend(req: Request) {
  let obj: KeyValueObject;
  try {
    obj = (await req.json()) as KeyValueObject;
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  if (!obj) {
    return jsonResponse({ error: "Request body is required" }, 400);
  }

  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(obj) }],
    });
    return jsonResponse({ status: "SUCCESS", message: obj });
  } catch (err: any) {
    return jsonResponse(
      { error: "Failed to send message", details: err.message },
      500
    );
  }
}

async function _handleSendBulk(desiredMessages: number) {
  if (isNaN(desiredMessages) || desiredMessages < 1) {
    return jsonResponse({ error: "Invalid number of messages" }, 400);
  }

  // When sending bulk we will use a randomly generated client ID
  const clientId = randomUUIDv7();
  let remaining = desiredMessages;
  let latestResult;
  while (remaining > 0) {
    // Batch messages for more efficient processing and higher throughput
    const currentBatch = Math.min(batchSize, remaining);
    const result = await _sendBulk(currentBatch, clientId);
    latestResult = await result.json();
    remaining -= currentBatch;
  }

  return jsonResponse({
    total: desiredMessages,
    latestResult: latestResult,
  });
}

async function _sendBulk(n: number, id: string) {
  const messages = [];
  for (let i = 0; i < n; i++) {
    const obj: KeyValueObject = {
      key: id,
      value: `Message No. ${i + 1}`,
    };
    messages.push({ value: JSON.stringify(obj) });
  }
  try {
    const result = await producer.send({
      topic,
      messages,
    });
    return jsonResponse({ status: "Bulk messages sent", count: n, result });
  } catch (err: any) {
    return jsonResponse(
      { error: "Failed to send bulk messages", details: err.message },
      500
    );
  }
}

await producer.connect();

Bun.serve({
  port,
  async fetch(req: Request) {
    const url = new URL(req.url);
    // POST /producer-api/message
    if (req.method === "POST" && url.pathname === `${apiUrlPrefix}/message`) {
      return _handleSend(req);
    }
    // POST /producer-api/message/bulk?n=<number>
    if (
      req.method === "POST" &&
      url.pathname === `${apiUrlPrefix}/message/bulk`
    ) {
      const desiredMessages = parseInt(
        url.searchParams.get("n") || "10000",
        10
      );
      return _handleSendBulk(desiredMessages);
    }
    return new Response("Not Found", { status: 404 });
  },
});

logger.info(`REST API listening on http://localhost:${port}`);
