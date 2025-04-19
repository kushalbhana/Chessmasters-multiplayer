import { Chess, Move, Square } from 'chess.js';

export class GameManager {
  private static instance: GameManager;
  private chess: Chess;

  private constructor(fen?: string) {
    this.chess = new Chess(fen);
  }

  public static getInstance(fen?: string): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager(fen);
    }
    return GameManager.instance;
  }

  public resetGame(fen?: string): void {
    this.chess = new Chess(fen);
  }

  public getGame(): Chess {
    return this.chess;
  }

  public getFen(): string {
    return this.chess.fen();
  }

  public getPgn(): string {
    return this.chess.pgn();
  }

  public getTurn(): 'w' | 'b' {
    return this.chess.turn();
  }

  public makeMove(move: string | Parameters<Chess['move']>[0]): Move | null {
    return this.chess.move(move);
  }

  public undoMove(): Move | null {
    return this.chess.undo();
  }

  public isGameOver(): boolean {
    return this.chess.isGameOver();
  }

  public isCheckmate(): boolean {
    return this.chess.isCheckmate();
  }

  public isDraw(): boolean {
    return this.chess.isDraw();
  }

  public isInCheck(): boolean {
    return this.chess.isCheck();
  }

  public getLegalMoves(square?: string): string[] {
    const moves = this.chess.moves({
      square: square as Square | undefined,
      verbose: false,
    });
    return moves;
  }

  public exportState(): { fen: string; pgn: string } {
    return {
      fen: this.getFen(),
      pgn: this.getPgn(),
    };
  }
}
