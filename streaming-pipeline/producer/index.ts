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

const kafka = new Kafka({ clientId, brokers });
const producer = kafka.producer({
  maxInFlightRequests: 10,
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

async function handleSend(req: Request) {
  let body: SendMessageBody;
  try {
    body = await req.json();
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

async function sendBulk(req: Request, n: number) {
  if (isNaN(n) || n < 1) {
    return jsonResponse({ error: "Invalid number of messages" }, 400);
  }
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
    // POST /send
    if (req.method === "POST" && url.pathname === "/send") {
      return handleSend(req);
    }
    // POST /bulk/:n
    const bulkMatch = url.pathname.match(/^\/bulk\/(\d+)$/);
    if (req.method === "POST" && bulkMatch) {
      const n = parseInt(bulkMatch[1], 10);
      return sendBulk(req, n);
    }
    return new Response("Not Found", { status: 404 });
  },
});

logger.info(`REST API listening on http://localhost:${port}`);
