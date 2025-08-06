class WebSocketClient {
    private static instance: WebSocketClient;
    private socket: WebSocket;
    private messageListeners: ((message: MessageEvent) => void)[] = [];
    private openListeners: (() => void)[] = [];
    private closeListeners: (() => void)[] = [];
    private errorListeners: ((error: any) => void)[] = [];

    private constructor() {
        this.socket = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_SERVER!);
        this.socket.onmessage = this.handleMessage.bind(this);
        this.socket.onopen = this.handleOpen.bind(this);
        this.socket.onclose = this.handleClose.bind(this);
        this.socket.onerror = this.handleError.bind(this);

        this.socket.onopen = () => {
            console.log('WebSocket opened!');
            this.openListeners.forEach(listener => listener());
        };
    }

    public addOpenListener(listener: () => void) {
        this.openListeners.push(listener);
    }
    
    static reconnect(): WebSocketClient {
        console.log("Reconnecting WebSocket...");
        WebSocketClient.instance = new WebSocketClient();
        return WebSocketClient.instance;
    }

    public isConnected(): boolean {
        return this.socket?.readyState === WebSocket.OPEN;
    }

    public static getInstance(): WebSocketClient {
        if (!WebSocketClient.instance) {
            WebSocketClient.instance = new WebSocketClient();
        }
        return WebSocketClient.instance;
    }

    private async handleMessage(event: MessageEvent) {
        this.messageListeners.forEach(listener => listener(event));
    }

    private handleOpen() {
        this.openListeners.forEach(listener => listener());
    }

    private handleClose() {
        this.closeListeners.forEach(listener => listener());
    }

    public get readyState() {
        return this.socket.readyState;
    }

    private handleError(error: any) {
        this.errorListeners.forEach(listener => listener(error));
    }

    public onMessage(listener: (message: MessageEvent) => void) {
        this.messageListeners.push(listener);
    }

    public removeMessageListener(listener: (message: MessageEvent) => void) {
        this.messageListeners = this.messageListeners.filter(l => l !== listener);
    }

    public onOpen(listener: () => void) {
        this.openListeners.push(listener);
    }

    public removeOpenListener(listener: () => void) {
        this.openListeners = this.openListeners.filter(l => l !== listener);
    }

    public onClose(listener: () => void) {
        this.closeListeners.push(listener);
    }

    public removeCloseListener(listener: () => void) {
        this.closeListeners = this.closeListeners.filter(l => l !== listener);
    }

    public onError(listener: (error: any) => void) {
        this.errorListeners.push(listener);
    }

    public removeErrorListener(listener: (error: any) => void) {
        this.errorListeners = this.errorListeners.filter(l => l !== listener);
    }

    public sendMessage(message: string) {
        this.socket.send(message);
    }

    public close() {
        this.socket.close();
    }


}

export default WebSocketClient;
