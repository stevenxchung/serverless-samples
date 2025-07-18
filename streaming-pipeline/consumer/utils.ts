import type { Batch, KafkaMessage } from "kafkajs";
import pino from "pino";

export const logger = pino({
  transport: {
    target: "pino-pretty",
    options: { colorize: true },
  },
});

export function handleLogging(message: KafkaMessage, batch: Batch) {
  logger.info(
    `Processed and committed offset: ${message.offset} (topic: ${batch.topic}, partition: ${batch.partition})`
  );
}

export function timeExecution<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  name?: string
): T {
  return async function (...args: Parameters<T>): Promise<ReturnType<T>> {
    const start = Date.now();
    const result = await fn(...args);
    const end = Date.now();
    logger.info(
      name || fn.name
        ? `${name || fn.name} executed in ${(end - start) / 1000} s`
        : `Executed in ${(end - start) / 1000} s`
    );
    return result;
  } as T;
}
