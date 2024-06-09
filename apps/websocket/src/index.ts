import { WebSocket, WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

interface Room {
  senderSocket?: WebSocket | null;
  receiverSocket?: WebSocket | null;
}

const rooms: { [key: string]: Room } = {};

wss.on('connection', (ws: WebSocket) => {
  ws.on('error', console.error);

  ws.on('message', (data: string) => {
    const message = JSON.parse(data);

    if (!message.roomId) {
      ws.send(JSON.stringify({ type: 'error', message: 'Room ID not provided' }));
      ws.close(4000, 'Room ID not provided');
      return;
    }

    const roomId = message.roomId;

    // Initialize the room if it doesn't exist
    if (!rooms[roomId]) {
      rooms[roomId] = {};
    }

    const room = rooms[roomId];

    if (message.type === 'sender') {
      if (!room?.senderSocket) {
        console.log('Sender socket connected to: ', roomId);
        // @ts-ignore
        room.senderSocket = ws;
        room?.senderSocket.send(JSON.stringify({ type: 'color', color: 'white' }));
      } else if (!room.receiverSocket) {
        console.log('Receiver socket connected to: ', roomId);
        room.receiverSocket = ws;
        room.receiverSocket.send(JSON.stringify({ type: 'color', color: 'black' }));
      } else {
        console.log('Additional sender attempted to connect.');
        ws.close(4000, 'Only one sender allowed');
      }
    } else if (message.type === 'receiver') {
      if (!room?.receiverSocket) {
        console.log('Receiver socket connected.');
        // @ts-ignore
        room.receiverSocket = ws;
        room?.receiverSocket.send(JSON.stringify({ type: 'color', color: 'black' }));
      } else {
        console.log('Additional receiver attempted to connect.');
        ws.close(4000, 'Only one receiver allowed');
      }
    }

    if (room?.senderSocket && room.receiverSocket) {
      if (message.type === 'moveFromSender') {
        console.log('Move initiated by sender to receiver');
        room.receiverSocket.send(JSON.stringify({ type: 'move', move: message.move }));
      } else if (message.type === 'moveFromReceiver') {
        console.log('Move initiated by receiver to sender');
        room.senderSocket.send(JSON.stringify({ type: 'move', move: message.move }));
      }
    }
  });

  ws.on('close', () => {
    for (const roomId in rooms) {
      const room = rooms[roomId];
      if (room?.senderSocket === ws) {
        console.log('Sender socket disconnected in room: ', roomId);
        room.senderSocket = null;
        if (room?.receiverSocket) {
          room.receiverSocket.close(4000, 'Sender disconnected');
          room.receiverSocket = null;
        }
      } else if (room?.receiverSocket === ws) {
        console.log('Receiver socket disconnected in room: ', roomId);
        room.receiverSocket = null;
        if (room.senderSocket) {
          room.senderSocket.close(4000, 'Receiver disconnected');
          room.senderSocket = null;
        }
      }

      // Clean up room if both sockets are null
      if (!room?.senderSocket && !room?.receiverSocket) {
        delete rooms[roomId];
      }
    }
  });
});