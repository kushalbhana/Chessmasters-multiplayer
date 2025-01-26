class WebSocketClient {
    private static instance: WebSocketClient;
    private socket: WebSocket;
    private messageListeners: ((message: MessageEvent) => void)[] = [];
    private openListeners: (() => void)[] = [];
    private closeListeners: (() => void)[] = [];
    private errorListeners: ((error: any) => void)[] = [];
  
    private constructor() {
        this.socket = new WebSocket('ws://localhost:8080/');
        this.socket.onmessage = this.handleMessage.bind(this);
        this.socket.onopen = this.handleOpen.bind(this);
        this.socket.onclose = this.handleClose.bind(this);
        this.socket.onerror = this.handleError.bind(this);
    }
  
    public static getInstance(): WebSocketClient {
        if (!WebSocketClient.instance) {
            WebSocketClient.instance = new WebSocketClient();
        }
        return WebSocketClient.instance;
    }
  
    private handleMessage(event: MessageEvent) {
        this.messageListeners.forEach(listener => listener(event));
    }
  
    private handleOpen() {
        this.openListeners.forEach(listener => listener());
    }
  
    private handleClose() {
        this.closeListeners.forEach(listener => listener());
    }
  
    private handleError(error: any) {
        this.errorListeners.forEach(listener => listener(error));
    }
  
    public onMessage(listener: (message: MessageEvent) => void) {
        this.messageListeners.push(listener);
    }
  
    public onOpen(listener: () => void) {
        this.openListeners.push(listener);
    }
  
    public onClose(listener: () => void) {
        this.closeListeners.push(listener);
    }
  
    public onError(listener: (error: any) => void) {
        this.errorListeners.push(listener);
    }
  
    public sendMessage(message: string) {
        this.socket.send(message);
    }
  
    public close() {
        this.socket.close();
    }
  }
  
  export default WebSocketClient;