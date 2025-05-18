import { Chess } from "chess.js"
import { gameStatusObj } from "@repo/lib/status"
import { webSocketManager } from ".."
import { postGameCleanUp } from "./redisUtils"

export function getGameStatus(chess: Chess): string {
  
  if (chess.isCheckmate()) return gameStatusObj.CHECKMATE
  if (chess.isStalemate()) return gameStatusObj.STALEMATE
  if (chess.isDraw()) return gameStatusObj.DRAW
  if (chess.isInsufficientMaterial()) return gameStatusObj.INSUFFICIENT_MATERIAL
  if (chess.isThreefoldRepetition()) return gameStatusObj.THREEFOLD_REPETITION
  return gameStatusObj.ONGOING
}

export async function postGameOverCleanup(roomId: string) {
    if(!webSocketManager.gameRoom[roomId]) return;

    const game = webSocketManager.gameRoom[roomId]!.game;
    const status = getGameStatus(game);

    if (status === gameStatusObj.CHECKMATE) {
        const winner = game.turn() === 'w' ? 'Black' : 'White';
        const winnerId = winner === 'White' ? webSocketManager.gameRoom[roomId]!.whiteId : webSocketManager.gameRoom[roomId]!.blackId;

        const updateDBABoutGameOver:{id: string, winner:string} = {
            id: roomId,
            winner: winnerId,
        };
        await postGameCleanUp(roomId, 
          webSocketManager.gameRoom[roomId]!.whiteId, 
          webSocketManager.gameRoom[roomId]!.blackId, 
          updateDBABoutGameOver);
        
        delete webSocketManager.gameRoom[roomId];


    } else if (status === gameStatusObj.STALEMATE) {
        console.log("Game Over: Stalemate");
    } else if (status === gameStatusObj.DRAW) {
        console.log("Game Over: Draw");
    } else if (status === gameStatusObj.INSUFFICIENT_MATERIAL) {
        console.log("Game Over: Insufficient Material");
    } else if (status === gameStatusObj.THREEFOLD_REPETITION) {
        console.log("Game Over: Threefold Repetition");
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
  