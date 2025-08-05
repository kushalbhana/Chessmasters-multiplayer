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
    TEXTMESSAGE: 'text_message',
    WEBRTCOFFER: 'webrtc',
    JOIN_CALL: 'join_call',
    NEW_PEER: 'new_peer',
    PEER_LEFT: 'peer_left',
    WEBRTCOFFERANSWER: 'webrtc_offer_answer',
    ICE_CANDIDATE: 'ice_candidate',
    CREATE_INVITE_LINK: 'create_invite_link',
    JOIN_FRIEND_ROOM: 'join_friend_room',
    RESIGN_REQUEST: 'resign_request',
    DRAW_REQUEST: 'draw_request',
    GAMEOVER: 'game_overs'
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
        THREEFOLD_REPETITION: 'Threefold-repetition',
        TIMEOUT: 'Timeout',
        RESIGNATION: 'resignations'
  }
  export const gameStatusMessage = {
        CheckmateWin: "Checkmate! You've cornered the king and claimed victory!",
        CheckmateLoss: "Checkmate... your king has been trapped. Seem you are a RCB supporter!",
        Stalemate: "Stalemate — it's a draw! No legal moves left, but the king isn't in check.",
        Draw: "It's a draw! The battle ends evenly matched.",
        Insufficient_Material: "Draw due to insufficient material — no checkmate is possible with the remaining pieces.",
        Threefold_Repetition: "Draw declared! The same position has occurred three times on the board.",
        TimeoutWIN: "Time's up! The game is over due to time expiration.",
        TimeoutLOST: "Time's up! You've run out of time, and the game is over.",
        ResignationWin: "Congratulations! Your opponent has chosen to resign, granting you a well-earned victory.",
        ResignationLose: "You have resigned from the match, and your opponent has been declared the winner."
  }

  interface Player {
      id: string;
      name: string;
      rating: number;
      avatar: string; // emoji or image URL
  }

  export const players: Player[] = [
  { id: "p1", name: "AlphaBot", rating: 400, avatar: "🤖" },
  { id: "p2", name: "KnightAI", rating: 1000, avatar: "♞" },
  { id: "p3", name: "QueenBot", rating: 1500, avatar: "👑" },
  { id: "p4", name: "Titan", rating: 2000, avatar: "🧠" },
  { id: "p5", name: "DeepMove", rating: 2200, avatar: "🔬" },
];