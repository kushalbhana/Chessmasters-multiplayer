FROM node:18-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

COPY apps/websocket/package.json ./apps/websocket/package.json

RUN npm install

COPY . .

EXPOSE 8080

CMD [ "node", "apps/websocket/src/index.ts" ]