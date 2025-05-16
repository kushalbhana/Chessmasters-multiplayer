import { Chess } from "chess.js"
import { gameStatusObj } from "@repo/lib/status"

export function getGameStatus(chess: Chess): string {
  
  if (chess.isCheckmate()) return gameStatusObj.CHECKMATE
  if (chess.isStalemate()) return gameStatusObj.STALEMATE
  if (chess.isDraw()) return gameStatusObj.DRAW
  if (chess.isInsufficientMaterial()) return gameStatusObj.INSUFFICIENT_MATERIAL
  if (chess.isThreefoldRepetition()) return gameStatusObj.THREEFOLD_REPETITION
  return gameStatusObj.ONGOING
}