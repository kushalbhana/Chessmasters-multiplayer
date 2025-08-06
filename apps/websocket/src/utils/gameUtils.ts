import { Chess } from "chess.js"
import { gameStatusMessage, gameStatusObj, WebSocketMessageType } from "@repo/lib/status"
import { webSocketManager } from ".."
import { postGameCleanUp } from "./redisUtils"
import { clearPlayerTimeout } from "./bukllmqClient"

export function getGameStatus(chess: Chess): string {
  
  if (chess.isCheckmate()) return gameStatusObj.CHECKMATE
  if (chess.isStalemate()) return gameStatusObj.STALEMATE
  if (chess.isDraw()) return gameStatusObj.DRAW
  if (chess.isInsufficientMaterial()) return gameStatusObj.INSUFFICIENT_MATERIAL
  if (chess.isThreefoldRepetition()) return gameStatusObj.THREEFOLD_REPETITION
  return gameStatusObj.ONGOING
}

export async function postGameOverCleanup(roomId: string) {
    if (!webSocketManager.gameRoom[roomId]) return;

    const gameRoom = webSocketManager.gameRoom[roomId]!;
    const game = gameRoom.game;
    const status = getGameStatus(game);

    const whiteId = gameRoom.whiteId;
    const blackId = gameRoom.blackId;

    if (status === gameStatusObj.CHECKMATE) {
        const winner = game.turn() === 'w' ? 'Black' : 'White';
        const winnerId = winner === 'White' ? whiteId : blackId;

        const updateDBAboutGameOver = {
            id: roomId,
            winner: winnerId,
            overType: gameStatusObj.CHECKMATE
        };

        // Notify both players
        if (gameRoom.whiteSocket) {
            gameRoom.whiteSocket.send(JSON.stringify({
                type: WebSocketMessageType.GAMEOVER,
                gameOverType: gameStatusObj.CHECKMATE,
                gameOverMessage: game.turn() === 'b' ? gameStatusMessage.CheckmateWin : gameStatusMessage.CheckmateLoss,
                OverType: game.turn() === 'b' ? 'Win' : 'Lose'
            }));
        }
        if (gameRoom.blackSocket) {
            gameRoom.blackSocket.send(JSON.stringify({
                type: WebSocketMessageType.GAMEOVER,
                gameOverType: gameStatusObj.CHECKMATE,
                gameOverMessage: game.turn() === 'b' ? gameStatusMessage.CheckmateLoss : gameStatusMessage.CheckmateWin,
                OverType: game.turn() === 'w' ? 'Win' : 'Lose'
            }));
        }

        clearPlayerTimeout(roomId, whiteId);
        clearPlayerTimeout(roomId, blackId);
        await postGameCleanUp(roomId, whiteId, blackId, updateDBAboutGameOver);
        delete webSocketManager.gameRoom[roomId];

    } else if (
        status === gameStatusObj.STALEMATE ||
        status === gameStatusObj.DRAW ||
        status === gameStatusObj.INSUFFICIENT_MATERIAL ||
        status === gameStatusObj.THREEFOLD_REPETITION
    ) {
        const updateDBAboutGameOver = {
            id: roomId,
            winner: 'DRAW',
            overType: status
        };

        // Notify both players as draw
        if (gameRoom.whiteSocket) {
            gameRoom.whiteSocket.send(JSON.stringify({
                type: WebSocketMessageType.GAMEOVER,
                gameOverType: status,
                gameOverMessage: gameStatusMessage.Draw,
                OverType: 'Draw'
            }));
        }
        if (gameRoom.blackSocket) {
            gameRoom.blackSocket.send(JSON.stringify({
                type: WebSocketMessageType.GAMEOVER,
                gameOverType: status,
                gameOverMessage: gameStatusMessage.Draw,
                OverType: 'Draw'
            }));
        }

        clearPlayerTimeout(roomId, whiteId);
        clearPlayerTimeout(roomId, blackId);
        await postGameCleanUp(roomId, whiteId, blackId, updateDBAboutGameOver);
        delete webSocketManager.gameRoom[roomId];
    }

    return;
}



export function calculateUpdatedRemainingTime( roomId: string,){
    const room = webSocketManager.gameRoom[roomId];
    if (!room) {
      throw new Error("Room not found");
    }
    const lastMoveTime = room.lastMoveTime;
    let remainingTimeInSeconds = 600;
    room.game.turn() === 'w' ? remainingTimeInSeconds = webSocketManager.gameRoom[roomId]!.blackTime : remainingTimeInSeconds = webSocketManager.gameRoom[roomId]!.whiteTime;
    
    const currentTime = new Date();
    const elapsedSeconds = Math.floor(
      (currentTime.getTime() - lastMoveTime.getTime()) / 1000
    );

    // Calculate the new remaining time
    const newTime = Math.max(remainingTimeInSeconds - elapsedSeconds, 0);
    webSocketManager.gameRoom[roomId]!.lastMoveTime = currentTime;

    if(webSocketManager.gameRoom[roomId]!.game.turn() === 'w'){
        webSocketManager.gameRoom[roomId]!.blackTime = newTime;
        webSocketManager.redisClient.hSet(`gameRoom:${roomId}`, 'blackTime', newTime)
        console.log('BlackRemainingTime: ', webSocketManager.gameRoom[roomId]!.blackTime);
    }else{
        webSocketManager.gameRoom[roomId]!.whiteTime = newTime; 
        webSocketManager.redisClient.hSet(`gameRoom:${roomId}`, 'whiteTime', newTime)  
        console.log('WhiteRemainingTime: ', webSocketManager.gameRoom[roomId]!.whiteTime);
    }
  }
  