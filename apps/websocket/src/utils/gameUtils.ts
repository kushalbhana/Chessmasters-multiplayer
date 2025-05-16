import { Chess } from "chess.js"

export function getGameStatus(chess: Chess): 
  | "checkmate"
  | "stalemate"
  | "draw"
  | "ongoing"
  | "insufficient-material"
  | "threefold-repetition" {
  
  if (chess.isCheckmate()) return "checkmate"
  if (chess.isStalemate()) return "stalemate"
  if (chess.isDraw()) return "draw"
  if (chess.isInsufficientMaterial()) return "insufficient-material"
  if (chess.isThreefoldRepetition()) return "threefold-repetition"
  return "ongoing"
}

export function postGameOverCleanup(roomId: string, gameStatus: string) {
    
}
