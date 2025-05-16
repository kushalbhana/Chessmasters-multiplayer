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
