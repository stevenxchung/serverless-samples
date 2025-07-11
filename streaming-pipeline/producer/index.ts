import { Kafka } from "kafkajs";
import pino from "pino";

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: { colorize: true },
  },
});

const clientId = process.env.CLIENT_ID || "demo-producer";
const brokers = [process.env.KAFKA_BROKER || "localhost:9092"];
const topic = process.env.KAFKA_TOPIC || "demo-topic";
const port = Number(process.env.PORT) || 3000;
const batchSize = Number(process.env.MAX_BATCH_SIZE) || 10000;

const kafka = new Kafka({ clientId, brokers });
const producer = kafka.producer({
  idempotent: false,
  allowAutoTopicCreation: false,
});

interface SendMessageBody {
  message: string;
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function _handleSend(req: Request) {
  let body: SendMessageBody;
  try {
    body = (await req.json()) as SendMessageBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }
  const message = body.message;
  if (!message) {
    return jsonResponse({ error: "Message is required" }, 400);
  }
  try {
    await producer.send({
      topic,
      messages: [{ value: message }],
    });
    return jsonResponse({ status: "SUCCESS", message });
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

  let remaining = desiredMessages;
  let latestResult;
  while (remaining > 0) {
    // Batch messages for more efficient processing and higher throughput
    const currentBatch = Math.min(batchSize, remaining);
    const result = await _sendBulk(currentBatch);
    latestResult = await result.json();
    remaining -= currentBatch;
  }

  return jsonResponse({
    total: desiredMessages,
    latestResult: latestResult,
  });
}

async function _sendBulk(n: number) {
  const messages = [];
  for (let i = 0; i < n; i++) {
    messages.push({ value: `Message No. ${i + 1}` });
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
  async fetch(req) {
    const url = new URL(req.url);
    // POST /message
    if (req.method === "POST" && url.pathname === "/message") {
      return _handleSend(req);
    }
    // POST /message/bulk/:n
    const bulkMatch = url.pathname.match(/^\/message\/bulk\/(\d+)$/);
    if (req.method === "POST" && bulkMatch && bulkMatch[1]) {
      const n = parseInt(bulkMatch[1], 10);
      return _handleSendBulk(n);
    }
    return new Response("Not Found", { status: 404 });
  },
});

logger.info(`REST API listening on http://localhost:${port}`);
