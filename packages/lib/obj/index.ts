export const STATUS_MESSAGES = {
    200: 'Authorized token',
    498: 'Invalid Token',
    500: 'Token expired',
    403: 'Web Token Error',
    401: 'Token not valid',
    1007: 'Invalid Payload',
    UNKNOWN: 'An unknown error occurred'
};

export const WebSocketMessageType = {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    MESSAGE: 'message',
    ERROR: 'error',
    PING: 'ping',
    JOINROOM: 'join_room',
    UPDATE: 'update',
    BROADCAST: 'broadcast',
    AUTH: 'auth',
    JOINLOBBY: 'JoinRandomRoom',
    PLAYGAME: 'play_game',
    ROOMEXIST: 'room_exist',
    INGAMEMOVE: 'player_move',
  };

  export const playerType = {
        WHITE: 'white',
        BLACK: 'black'
  }