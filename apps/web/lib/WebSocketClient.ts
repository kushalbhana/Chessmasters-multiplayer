// WebSocketClient.ts

export interface WebSocketMessage {
    type: string;
    [key: string]: any;
  }
  
  class WebSocketClient {
    private static instance: WebSocketClient;
    private socket: WebSocket | null = null;
  
    private constructor() {}
  
    static getInstance(): WebSocketClient {
      if (!WebSocketClient.instance) {
        WebSocketClient.instance = new WebSocketClient();
      }
      return WebSocketClient.instance;
    }
  
    connect(url: string, token: string, roomId: string) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        return;
      }
  
      this.socket = new WebSocket(url);
  
      this.socket.onopen = () => {
        this.send({ type: 'sender', roomId, token });
      };
  
      this.socket.onclose = () => {
        console.log('WebSocket connection closed');
      };
  
      this.socket.onerror = (error) => {
        console.error('WebSocket error', error);
      };
    }
  
    onMessage(callback: (message: WebSocketMessage) => void) {
      if (this.socket) {
        this.socket.onmessage = (event) => {
          const message = JSON.parse(event.data);
          callback(message);
        };
      }
    }
  
    send(message: WebSocketMessage) {
      if (this.socket) {
        this.socket.send(JSON.stringify(message));
      }
    }
  
    close() {
      if (this.socket) {
        this.socket.close();
      }
    }
  }
  
  export default WebSocketClient.getInstance();
  