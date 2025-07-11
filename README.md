# Serverless Samples

Collection of backend services and API samples which may serve as a template to help get prototypes and apps started. Consequently, we lean towards serverless builds.

## Demos

### 🚿 `streaming-pipeline`

An event-driven, Kafka-based streaming pipeline for ingesting, transforming, and storing real-time data.

- **Tech**: Kafka, TypeScript, Node.js, bun, Docker
- **Example stack**: MSK (Kafka), AWS Lambda, S3
- **Use case**: Real-time data enrichment and persistence

➡️ [`streaming-pipeline/`](./streaming-pipeline)

### 🤗 `user-api`

A REST API for managing user records using TypeScript and AWS services.

- **Tech**: TypeScript, Express, Node.js, bun
- **Example stack**: API Gateway, AWS Lambda, DynamoDB, RDS
- **Use case**: User management service with full CRUD

➡️ [`user-api/`](./user-api)

### 🌤️ `weather-api`

A GraphQL API that queries and manages weather data via third-party APIs.

- **Tech**: Python, Flask, GraphQL, uv
- **Example stack**: API Gateway, AWS Lambda, DynamoDB, RDS
- **Use case**: Abstracts and caches weather forecast queries

➡️ [`weather-api/`](./weather-api)

## 🛠️ Requirements

Every project has different requirements. See individual projects for details.
