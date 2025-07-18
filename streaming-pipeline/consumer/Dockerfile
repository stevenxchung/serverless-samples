FROM oven/bun:latest

WORKDIR /app
COPY consumer/. .  
COPY wait-for-it.sh ./wait-for-it.sh
RUN chmod +x wait-for-it.sh

RUN bun install
