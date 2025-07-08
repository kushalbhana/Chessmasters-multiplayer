FROM node:16

# Set working directory
WORKDIR /usr/src/app

# Install system dependencies (no sudo needed in Docker)
RUN apt-get update && \
    apt-get install -y stockfish && \
    rm -rf /var/lib/apt/lists/*

# Copy root package.json and lockfile
COPY package.json ./
COPY package-lock.json ./

# Copy the specific package.json for the chess engine
COPY apps/chess-engine/package.json ./apps/chess-engine/package.json

# Install Node.js dependencies
RUN npm install

# Copy entire app source
COPY . .

# Expose the required port
EXPOSE 4000

# Start the application
CMD ["node", "apps/api/server.js"]
