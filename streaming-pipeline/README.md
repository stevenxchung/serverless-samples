# Streaming Pipeline

This repository demonstrates a simple event streaming pipeline using **Kafka**, **Bun**, and **Docker Compose**. It includes a producer service, a consumer service, and a Kafka broker, all orchestrated with Docker Compose for easy local development and testing.

## Overview

The pipeline consists of:

- **Producer:** A Bun-based REST API that allows you to send messages to a Kafka topic via HTTP requests.
- **Consumer:** A Bun-based service that listens to the Kafka topic, processes incoming messages and commits the offset.
- **Kafka Broker:** Kafka image, running in KRaft mode (no Zookeeper required).

This setup is ideal for learning, prototyping, or testing event-driven architectures and microservices communication patterns.

## Architecture

```
[REST Client] ---> [Producer API] ---> [Kafka Topic] ---> [Consumer]
```

- The **Producer** exposes a REST endpoint (`/send`) to accept messages and publish them to Kafka.
- The **Consumer** subscribes to the Kafka topic, processes each message, and commits the offset to prevent reprocessing.
- Kafka ensures reliable delivery and decoupling between producer and consumer.

## Features

- **Topic Initialization:** The Kafka topic is created automatically on startup using an init container.
- **Topic Readiness:** The consumer waits for the topic to exist before subscribing, ensuring robust startup.
- **Hot Reload:** Both producer and consumer support hot reloading for rapid development.
- **Configurable:** Broker address, topic name, and client IDs are configurable via environment variables.

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Make](https://www.gnu.org/software/make/#download)
- [Bun](https://bun.sh/) (for local development outside Docker, optional)

### Running the Pipeline

1. **Build and start the services:**

   ```sh
   make up # subsequent runs may use `make start`
   ```

2. **Send a message to the producer:**

   ```sh
   curl -X POST http://localhost:3000/send -H "Content-Type: application/json" -d "{\"message\":\"Hello Kafka!\"}"
   ```

3. **Check latest consumer logs:**
   ```sh
   make logs
   ```

### Stopping and Cleaning Up

To stop all services and remove containers, networks, and volumes:

```sh
make down
```

To remove all unused Docker images, containers, and volumes:

```sh
make prune
```

## Configuration

You can adjust the following environment variables in `docker-compose.yml`:

- `KAFKA_BROKER` — Kafka broker address (default: `kafka:9092`)
- `KAFKA_TOPIC` — Kafka topic name (default: `demo-topic`)
- `CLIENT_ID` — Kafka client ID for producer/consumer
- `PORT` — REST API port for producer

## Project Structure

```
streaming-api/
├── docker-compose.yml
├── producer/
│   ├── Dockerfile
│   ├── index.ts
│   └── ...
├── consumer/
│   ├── Dockerfile
│   ├── index.ts
│   └── ...
```

## Notes

- The consumer includes logic to wait for the Kafka topic to exist before subscribing, preventing race conditions at startup.
- For production, consider removing hot reload and volume mounts, and use a separate `docker-compose.prod.yml` for optimized settings.
