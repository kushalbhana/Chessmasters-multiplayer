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

  export const gameStatusObj = {
        ONGOING: 'Ongoing',
        CHECKMATE: 'Checkmate',
        STALEMATE: 'Stalemate',
        DRAW: 'Draw',
        INSUFFICIENT_MATERIAL: 'Insufficient-material',
        THREEFOLD_REPETITION: 'Threefold-repetition'
  }
  export const gameStatusMessage = {
        CheckmateWin: "Checkmate! You've cornered the king and claimed victory!",
        CheckmateLoss: "Checkmate... your king has been trapped. Seem you are a RCB supporter!",
        Stalemate: "Stalemate — it's a draw! No legal moves left, but the king isn't in check.",
        Draw: "It's a draw! The battle ends evenly matched.",
        Insufficient_Material: "Draw due to insufficient material — no checkmate is possible with the remaining pieces.",
        Threefold_Repetition: "Draw declared! The same position has occurred three times on the board.",
  }