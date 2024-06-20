import { WebSocket, WebSocketServer } from 'ws';

interface Room {
    senderSocket?: WebSocket | null;
    receiverSocket?: WebSocket | null;
    boardState: string | 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    sender?: string;
    reciever?: string;
}

class WebSocketManager {
    private static instance: WebSocketManager | null = null;
    private wss: WebSocketServer;
    private rooms: { [key: string]: Room } = {};

    private constructor(port: number) {
        this.wss = new WebSocketServer({ port });
        this.initialize();
    }

    public static getInstance(port: number = 8080): WebSocketManager {
        if (!WebSocketManager.instance) {
            WebSocketManager.instance = new WebSocketManager(port);
        }
        return WebSocketManager.instance;
    }

    private initialize(): void {
        this.wss.on('connection', (ws: WebSocket) => {
            ws.on('error', console.error);
            ws.on('message', (data: string) => this.handleMessage(ws, data));
            ws.on('close', () => this.handleClose(ws));
        });

        console.log('WebSocket server running on port:', this.wss.options.port);
    }

    private handleMessage(ws: WebSocket, data: string): void {
        const message = JSON.parse(data);

        if (!message.roomId) {
            ws.send(JSON.stringify({ type: 'error', message: 'Room ID not provided' }));
            ws.close(4000, 'Room ID not provided');
            return;
        }

        const roomId = message.roomId;

        // Initialize the room if it doesn't exist
        if (!this.rooms[roomId]) {
            this.rooms[roomId] = { boardState: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' };
        }

        const room = this.rooms[roomId];

        console.log(message.token);

        if (message.type === 'sender') {
            if (!room?.senderSocket) {
                console.log('Sender socket connected to:', roomId);
                if (room){
                  room.senderSocket = ws;
                  room.senderSocket.send(JSON.stringify({ type: 'color', color: 'white' }));
                  room.senderSocket.send(JSON.stringify({ type: 'boardState', boardState: room.boardState, color: 'white' }));
                }

            } else if (!room.receiverSocket) {
                console.log('Receiver socket connected to:', roomId);
                room.receiverSocket = ws;
                room.receiverSocket.send(JSON.stringify({ type: 'color', color: 'black' }))
                room.receiverSocket.send(JSON.stringify({ type: 'boardState', boardState: room.boardState, color: 'black' }));
        
            } else {
                console.log('Additional sender attempted to connect.');
                ws.close(4000, 'Only one sender allowed');
            }
        } else if (message.type === 'receiver') {
            if (!room?.receiverSocket) {
                console.log('Receiver socket connected to:', roomId);

                if(room){
                  room.receiverSocket = ws;
                  room.receiverSocket.send(JSON.stringify({ type: 'color', color: 'black' }));
                  room.receiverSocket.send(JSON.stringify({ type: 'boardState', boardState: room.boardState, color: 'black' }));
                }
            } else {
                console.log('Additional receiver attempted to connect.');
                ws.close(4000, 'Only one receiver allowed');
            }
        }

        if (room?.senderSocket || room?.receiverSocket) {
            if (message.type === 'moveFromSender') {
                console.log('Move initiated by sender to receiver: ');
                room.boardState = message.boardState;  //Saving the move from one player
                if (room.receiverSocket)
                    room.receiverSocket.send(JSON.stringify({ type: 'move', move: message.move }));
            } else if (message.type === 'moveFromReceiver') {
                console.log('Move initiated by receiver to sender');
                room.boardState = message.boardState;
                if (room.senderSocket)
                    room.senderSocket.send(JSON.stringify({ type: 'move', move: message.move }));
            }
        }
    }

    private handleClose(ws: WebSocket): void {
        for (const roomId in this.rooms) {
            const room = this.rooms[roomId];
            if (room?.senderSocket === ws) {
                console.log('Sender socket disconnected in room:', roomId);
                room.senderSocket = null;
            } else if (room?.receiverSocket === ws) {
                console.log('Receiver socket disconnected in room:', roomId);
                room.receiverSocket = null;
            }

            // Clean up room if both sockets are null
            if (!room?.senderSocket && !room?.receiverSocket) {
                delete this.rooms[roomId];
            }
        }
    }
}

// Export an instance of WebSocketManager as a singleton
export const webSocketManager = WebSocketManager.getInstance();
