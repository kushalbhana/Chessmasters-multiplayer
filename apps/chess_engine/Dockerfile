# Use Ubuntu as base image
FROM ubuntu:22.04

WORKDIR /app

# Install curl, Node.js v18, and other dependencies
RUN apt-get update && \
    apt-get install -y curl gnupg software-properties-common ca-certificates && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get install -y stockfish && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY package.json ./
COPY package-lock.json ./
COPY apps/chess_engine/package.json ./apps/chess_engine/package.json

RUN npm install
COPY . .

EXPOSE 8081

# Run your Chess Engine service
CMD ["node", "apps/chess_engine/src/index.ts"]
