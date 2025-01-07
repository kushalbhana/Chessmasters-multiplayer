export const STATUS_MESSAGES = {
    200: 'Authorized token',
    498: 'Invalid Token',
    500: 'Token expired',
    403: 'Web Token Error',
    401: 'Token not valid',
    UNKNOWN: 'An unknown error occurred'
};

export const WebSocketMessageType = {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    MESSAGE: 'message',
    ERROR: 'error',
    PING: 'ping',
    PONG: 'pong',
    UPDATE: 'update',
    BROADCAST: 'broadcast',
    AUTH: 'auth',
    JOINLOBBY: 'JoinRandomRoom'
  };