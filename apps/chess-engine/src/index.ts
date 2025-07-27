// Chess Analytics Server Implementation (Node.js)

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Chess } from 'chess.js';
import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import {openings} from './lib/openings';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: "*"
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Multer for file uploads (keeping for backward compatibility)
const upload = multer({ 
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/x-chess-pgn' || 
        file.originalname.endsWith('.pgn') ||
        file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only PGN files are allowed'));
    }
  }
});

// Types
interface EngineEvaluation {
  score: number;
  mate?: number;
  depth: number;
  nodes: number;
  time: number;
  pv: string[];
  nps: number;
}

interface MoveAnalysis {
  move: string;
  uciMove: string;
  moveNumber: number;
  isWhite: boolean;
  score: number;
  classification: MoveClassification;
  accuracy: number;
  isBlunder: boolean;
  isMistake: boolean;
  isInaccuracy: boolean;
  isBrilliant: boolean;
  isGreat: boolean;
  isGood: boolean;
  bestMove?: string;
  bestMoveUci?: string;
  scoreDrop: number;
  position: string; // FEN
}

enum MoveClassification {
  BRILLIANT = "brilliant",
  GREAT = "great",
  GOOD = "good",
  BOOK = "book",
  INACCURACY = "inaccuracy",
  MISTAKE = "mistake",
  BLUNDER = "blunder"
}

interface GameAnalysis {
  gameInfo: {
    white: string;
    black: string;
    result: string;
    date: string | undefined;
    event: string;
    site: string;
    round: string;
    eco: string;
  };
  moves: MoveAnalysis[];
  whiteAccuracy: number;
  blackAccuracy: number;
  classifications: {
    [key in MoveClassification]: number;
  };
  evaluationGraph: EvaluationPoint[];
  openingName: string;
  gameLength: number;
  analysisTime: number;
}

interface EvaluationPoint {
  moveNumber: number;
  isWhite: boolean;
  evaluation: number;
  accuracy: number;
  move: string;
}

interface AnalysisRequest {
  fen: string;
  moves: string[]; // UCI format moves
  gameInfo?: {
    white?: string;
    black?: string;
    result?: string;
    date?: string;
    event?: string;
    site?: string;
    round?: string;
    eco?: string;
  };
}

interface BotMoveRequest {
  fen: string;
  depth?: number;
  playerLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

interface BotMoveResponse {
  bestMove: string;
  bestMoveSan: string;
  evaluation: number;
  classification: MoveClassification;
  confidence: number;
  alternativeMoves?: {
    move: string;
    moveSan: string;
    evaluation: number;
    classification: MoveClassification;
  }[];
  analysis: {
    isCheckmate: boolean;
    isCheck: boolean;
    isStalemate: boolean;
    gamePhase: 'opening' | 'middlegame' | 'endgame';
    materialBalance: number;
  };
}

// Stockfish Engine Manager
class StockfishManager {
  private engine: ChildProcess | null = null;
  private isReady: boolean = false;
  private evaluationPromises: Map<string, { resolve: Function, reject: Function }> = new Map();
  private currentEvaluationId: string | null = null;
  private latestEvaluation: EngineEvaluation | null = null;

  constructor() {
    this.initEngine();
  }

  private initEngine() {
    try {
      // Path to stockfish binary (adjust based on your setup)
      const stockfishPath = process.env.STOCKFISH_PATH || 'stockfish';
      this.engine = spawn(stockfishPath);
      
      this.engine.stdout?.on('data', (data) => {
        this.handleEngineOutput(data.toString());
      });

      this.engine.stderr?.on('data', (data) => {
        console.error('Stockfish error:', data.toString());
      });

      this.engine.on('close', (code) => {
        console.log(`Stockfish process closed with code ${code}`);
        this.isReady = false;
      });

      this.engine.on('error', (error) => {
        console.error('Stockfish spawn error:', error);
        this.isReady = false;
      });

      // Initialize engine
      this.sendCommand('uci');
      this.sendCommand('setoption name Hash value 128');
      this.sendCommand('setoption name Threads value 1');
      this.sendCommand('ucinewgame');
      this.sendCommand('isready');
      
    } catch (error) {
      console.error('Failed to initialize Stockfish:', error);
    }
  }

  private sendCommand(command: string) {
    if (this.engine && this.engine.stdin && this.engine.stdin.writable) {
      this.engine.stdin.write(command + '\n');
    }
  }

  private handleEngineOutput(output: string) {
    const lines = output.trim().split('\n');
    
    for (const line of lines) {
      if (line === 'readyok') {
        this.isReady = true;
      } else if (line === 'uciok') {
        // Engine is ready for UCI commands
      } else if (line.startsWith('info depth') && this.currentEvaluationId) {
        const evaluation = this.parseEvaluation(line);
        if (evaluation.depth >= 1) { // Store latest evaluation
          this.latestEvaluation = evaluation;
        }
        if (evaluation.depth >= 15) { // Use deep evaluation
          this.processEvaluationLine(evaluation);
        }
      } else if (line.startsWith('bestmove') && this.currentEvaluationId) {
        this.finalizeBestMove(line);
      }
    }
  }

  private processEvaluationLine(evaluation: EngineEvaluation) {
    if (this.currentEvaluationId) {
      const promise = this.evaluationPromises.get(this.currentEvaluationId);
      if (promise) {
        promise.resolve(evaluation);
        this.evaluationPromises.delete(this.currentEvaluationId);
        this.currentEvaluationId = null;
        this.latestEvaluation = null;
      }
    }
  }

  private finalizeBestMove(line: string) {
    // Handle cases where we didn't get deep enough evaluation
    if (this.currentEvaluationId) {
      const promise = this.evaluationPromises.get(this.currentEvaluationId);
      if (promise) {
        // Use latest evaluation if available, otherwise return basic evaluation
        const evaluation = this.latestEvaluation || {
          score: 0,
          depth: 1,
          nodes: 0,
          time: 0,
          pv: [line.split(' ')[1]], // Extract best move
          nps: 0
        };
        promise.resolve(evaluation);
        this.evaluationPromises.delete(this.currentEvaluationId);
        this.currentEvaluationId = null;
        this.latestEvaluation = null;
      }
    }
  }

  async evaluatePosition(fen: string, depth: number = 15): Promise<EngineEvaluation> {
    if (!this.isReady) {
      await this.waitForReady();
    }

    return new Promise((resolve, reject) => {
      const evaluationId = Date.now().toString() + Math.random().toString();
      this.currentEvaluationId = evaluationId;
      this.evaluationPromises.set(evaluationId, { resolve, reject });

      this.sendCommand(`position fen ${fen}`);
      this.sendCommand(`go depth ${depth}`);

      // Timeout after 5 seconds for faster analysis
      setTimeout(() => {
        if (this.evaluationPromises.has(evaluationId)) {
          this.evaluationPromises.delete(evaluationId);
          this.currentEvaluationId = null;
          reject(new Error('Evaluation timeout'));
        }
      }, 5000);
    });
  }

  async getBestMove(fen: string, depth: number = 12): Promise<string> {
    const evaluation = await this.evaluatePosition(fen, depth);
    return evaluation.pv[0] || '';
  }

  private async waitForReady(): Promise<void> {
    if (this.isReady) return;
    
    return new Promise((resolve, reject) => {
      const checkReady = () => {
        if (this.isReady) {
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };
      
      setTimeout(() => reject(new Error('Engine not ready')), 5000);
      checkReady();
    });
  }

  private parseEvaluation(infoLine: string): EngineEvaluation {
    const parts = infoLine.split(' ');
    const evaluation: Partial<EngineEvaluation> = {
      pv: [],
      score: 0,
      depth: 0,
      nodes: 0,
      time: 0,
      nps: 0
    };

    for (let i = 0; i < parts.length; i++) {
      switch (parts[i]) {
        case 'depth':
          evaluation.depth = parseInt(parts[i + 1]!) || 0;
          break;
        case 'score':
          if (parts[i + 1] === 'cp') {
            evaluation.score = parseInt(parts[i + 2]!) || 0;
          } else if (parts[i + 1] === 'mate') {
            evaluation.mate = parseInt(parts[i + 2]!) || 0;
            evaluation.score = evaluation.mate > 0 ? 10000 - evaluation.mate : -10000 + Math.abs(evaluation.mate);
          }
          break;
        case 'nodes':
          evaluation.nodes = parseInt(parts[i + 1]!) || 0;
          break;
        case 'time':
          evaluation.time = parseInt(parts[i + 1]!) || 0;
          break;
        case 'nps':
          evaluation.nps = parseInt(parts[i + 1]!) || 0;
          break;
        case 'pv':
          evaluation.pv = parts.slice(i + 1);
          break;
      }
    }

    return evaluation as EngineEvaluation;
  }

  destroy() {
    if (this.engine) {
      this.engine.kill();
    }
  }
}

// Game Analysis Service
class GameAnalysisService {
  private stockfish: StockfishManager;

  constructor() {
    this.stockfish = new StockfishManager();
  }

  async analyzeGameFromMoves(request: AnalysisRequest): Promise<GameAnalysis> {
    const startTime = Date.now();
    
    try {
      const chess = new Chess(request.fen);
      
      // Extract game info with defaults
      const gameInfo = {
        white: request.gameInfo?.white || 'Unknown',
        black: request.gameInfo?.black || 'Unknown',
        result: request.gameInfo?.result || '*',
        date: request.gameInfo?.date || new Date().toISOString().split('T')[0],
        event: request.gameInfo?.event || 'Analysis',
        site: request.gameInfo?.site || 'Chess Analytics',
        round: request.gameInfo?.round || '1',
        eco: request.gameInfo?.eco || 'Unknown'
      };

      const analysis: GameAnalysis = {
        gameInfo,
        moves: [],
        whiteAccuracy: 0,
        blackAccuracy: 0,
        classifications: {
          brilliant: 0,
          great: 0,
          good: 0,
          book: 0,
          inaccuracy: 0,
          mistake: 0,
          blunder: 0
        },
        evaluationGraph: [],
        openingName: 'Unknown Opening',
        gameLength: request.moves.length,
        analysisTime: 0
      };

      // Reset to starting position
      chess.load(request.fen);
      let currentPosition = request.fen;

      // Track positions for opening detection
      const gamePositions: string[] = [request.fen];

      // Analyze each move
      for (let i = 0; i < request.moves.length; i++) {
        const uciMove = request.moves[i];
        const moveNumber = Math.floor(i / 2) + 1;
        const isWhite = i % 2 === 0;

        console.log(`Analyzing move ${i + 1}/${request.moves.length}: ${uciMove}`);

        try {
          // OPTIMIZED: Only consider first 4-6 moves as potential book moves
          const isBookMove = this.isOpeningMove(gamePositions, i);

          // For opening moves (first 6 plies), use lighter analysis
          if (isBookMove && i < 6) {
            // Make the move
            const move = chess.move(uciMove!);
            if (!move) {
              throw new Error(`Invalid move: ${uciMove}`);
            }

            const afterPos = chess.fen();
            gamePositions.push(afterPos);

            const moveAnalysis: MoveAnalysis = {
              move: move.san,
              uciMove: uciMove!,
              moveNumber,
              isWhite,
              score: 0, // Opening moves don't need precise evaluation
              classification: MoveClassification.BOOK,
              accuracy: 95, // High accuracy for opening moves
              isBlunder: false,
              isMistake: false,
              isInaccuracy: false,
              isBrilliant: false,
              isGreat: false,
              isGood: false,
              bestMove: move.san,
              bestMoveUci: uciMove!,
              scoreDrop: 0,
              position: currentPosition
            };

            // Set classification booleans
            this.setClassificationBooleans(moveAnalysis);
            
            // Update classifications count
            analysis.classifications[moveAnalysis.classification]++;
            
            analysis.moves.push(moveAnalysis);

            // Update evaluation graph with neutral evaluation for opening
            analysis.evaluationGraph.push({
              moveNumber,
              isWhite,
              evaluation: 0,
              accuracy: moveAnalysis.accuracy,
              move: move.san
            });

            currentPosition = afterPos;
            continue;
          }

          // Full engine analysis for middle/endgame
          // Evaluate position before move
          const beforeEval = await this.stockfish.evaluatePosition(currentPosition, 15);
          
          // Make the move
          const move = chess.move(uciMove!);
          if (!move) {
            throw new Error(`Invalid move: ${uciMove}`);
          }
          
          const afterPos = chess.fen();
          gamePositions.push(afterPos);
          const afterEval = await this.stockfish.evaluatePosition(afterPos, 15);

          // Get best move for current position (evaluate the position before the move)
          const tempChess = new Chess(currentPosition);
          const bestMoveUci = beforeEval.pv[0] || '';
          const bestMove = this.uciToSan(tempChess, bestMoveUci, currentPosition);

          // Calculate score drop from player's perspective
          const scoreDrop = this.calculateScoreDrop(beforeEval, afterEval, isWhite);
          
          const moveAnalysis: MoveAnalysis = {
            move: move.san,
            uciMove: uciMove!,
            moveNumber,
            isWhite,
            score: isWhite ? afterEval.score : -afterEval.score,
            classification: this.classifyMove(scoreDrop, uciMove === bestMoveUci, beforeEval, uciMove!, i),
            accuracy: this.calculateAccuracy(scoreDrop),
            isBlunder: false,
            isMistake: false,
            isInaccuracy: false,
            isBrilliant: false,
            isGreat: false,
            isGood: false,
            bestMove: bestMove,
            bestMoveUci: bestMoveUci,
            scoreDrop,
            position: currentPosition
          };

          // Set classification booleans
          this.setClassificationBooleans(moveAnalysis);
          
          // Update classifications count
          analysis.classifications[moveAnalysis.classification]++;
          
          analysis.moves.push(moveAnalysis);

          // Update evaluation graph (convert to player perspective)
          analysis.evaluationGraph.push({
            moveNumber,
            isWhite,
            evaluation: isWhite ? afterEval.score : -afterEval.score,
            accuracy: moveAnalysis.accuracy,
            move: move.san
          });

          currentPosition = afterPos;

        } catch (error) {
          console.error(`Error analyzing move ${i + 1}:`, error);
          
          // Try to make the move anyway for placeholder analysis
          try {
            const move = chess.move(uciMove!);
            if (move) {
              gamePositions.push(chess.fen());

              // OPTIMIZED: Default to good moves instead of book moves for failed analysis
              const placeholderAnalysis: MoveAnalysis = {
                move: move.san,
                uciMove: uciMove!,
                moveNumber,
                isWhite,
                score: 0,
                classification: MoveClassification.GOOD,
                accuracy: 85,
                isBlunder: false,
                isMistake: false,
                isInaccuracy: false,
                isBrilliant: false,
                isGreat: false,
                isGood: true,
                scoreDrop: 0,
                position: currentPosition
              };
              
              analysis.moves.push(placeholderAnalysis);
              analysis.classifications.good++;
              currentPosition = chess.fen();
            }
          } catch (moveError) {
            console.error(`Failed to make move ${uciMove}:`, moveError);
          }
        }
      }

      // Calculate overall accuracy
      const whiteMoves = analysis.moves.filter(m => m.isWhite);
      const blackMoves = analysis.moves.filter(m => !m.isWhite);
      
      analysis.whiteAccuracy = this.calculateAverageAccuracy(whiteMoves);
      analysis.blackAccuracy = this.calculateAverageAccuracy(blackMoves);
      
      // Identify opening from positions
      analysis.openingName = this.identifyOpeningFromPositions(gamePositions);
      
      analysis.analysisTime = Date.now() - startTime;
      
      return analysis;

    } catch (error) {
      console.error('Game analysis failed:', error);
      throw new Error(`Analysis failed: ${error}`);
    }
  }

  // Keep the original PGN analysis for backward compatibility
  async analyzeGame(pgnContent: string): Promise<GameAnalysis> {
    const startTime = Date.now();
    
    try {
      const chess = new Chess();
      chess.loadPgn(pgnContent);
      
      // Extract game info
      const header = chess.header();
      const gameInfo = {
        white: header.White || 'Unknown',
        black: header.Black || 'Unknown',
        result: header.Result || '*',
        date: header.Date || new Date().toISOString().split('T')[0],
        event: header.Event || 'Unknown',
        site: header.Site || 'Unknown',
        round: header.Round || '?',
        eco: header.ECO || 'Unknown'
      };

      const history = chess.history({ verbose: true });
      
      // Convert to UCI moves and starting FEN
      chess.reset();
      chess.loadPgn(pgnContent);
      chess.reset();
      
      const startingFen = chess.fen();
      const uciMoves: string[] = [];
      
      for (const move of history) {
        const beforeFen = chess.fen();
        chess.move(move);
        // Convert to UCI by finding the move that matches
        const possibleMoves = chess.moves({ verbose: true });
        chess.undo();
        chess.move(move);
        
        uciMoves.push(move.from + move.to + (move.promotion || ''));
      }

      // Use the new analysis method
      const request: AnalysisRequest = {
        fen: startingFen,
        moves: uciMoves,
        gameInfo
      };

      return await this.analyzeGameFromMoves(request);

    } catch (error) {
      console.error('PGN analysis failed:', error);
      throw new Error(`Analysis failed: ${error}`);
    }
  }

  private uciToSan(chess: Chess, uciMove: string, fen: string): string {
    if (!uciMove || uciMove.length < 4) return '';
    
    try {
      const tempChess = new Chess(fen);
      const move = tempChess.move({
        from: uciMove.slice(0, 2),
        to: uciMove.slice(2, 4),
        promotion: uciMove.slice(4) || undefined
      });
      return move ? move.san : '';
    } catch {
      return '';
    }
  }

  private calculateScoreDrop(beforeEval: EngineEvaluation, afterEval: EngineEvaluation, isWhite: boolean): number {
    // Convert centipawns to evaluation from current player's perspective
    const beforeScore = beforeEval.score; // From current position perspective
    const afterScore = -afterEval.score; // From opponent's perspective, so negate
    
    // Calculate how much the position got worse for the current player
    const scoreDrop = beforeScore - afterScore;
    return Math.max(0, scoreDrop);
  }

  // OPTIMIZED CLASSIFICATION SYSTEM
  private classifyMove(
    scoreDrop: number, 
    isBestMove: boolean, 
    beforeEval: EngineEvaluation, 
    actualMoveUci: string, 
    moveIndex: number
  ): MoveClassification {
    // OPTIMIZED: Only first 4 moves (2 per side) should be considered for book classification
    if (moveIndex < 4 && scoreDrop <= 30) {
      return MoveClassification.BOOK;
    }

    // Special case: if it's the best move or very close to best move
    if (isBestMove || scoreDrop <= 5) {
      // Check if it's a particularly good move in a difficult position
      if (this.isBrilliantMove(beforeEval, scoreDrop, actualMoveUci)) {
        return MoveClassification.BRILLIANT;
      }
      if (scoreDrop <= 3) return MoveClassification.GREAT;
      return MoveClassification.GOOD;
    }
    
    // OPTIMIZED: More lenient classification thresholds to reduce false blunder classifications
    if (scoreDrop <= 50) return MoveClassification.GOOD;           // Up to 0.5 pawn loss is still good
    if (scoreDrop <= 100) return MoveClassification.INACCURACY;    // 1.0 pawn loss
    if (scoreDrop <= 200) return MoveClassification.MISTAKE;       // 2.0 pawn loss  
    if (scoreDrop <= 400) return MoveClassification.BLUNDER;       // 4.0 pawn loss
    
    // Only extreme blunders (>4 pawns) remain as blunders
    return MoveClassification.BLUNDER;
  }

  // OPTIMIZED: More strict criteria for brilliant moves
  private isBrilliantMove(beforeEval: EngineEvaluation, scoreDrop: number, actualMove: string): boolean {
    // A move is brilliant if:
    // 1. It's the best move (scoreDrop = 0)
    // 2. AND it's in a complex/difficult position
    // 3. AND it finds a non-obvious solution
    
    if (scoreDrop > 0) return false; // Must be the absolute best move
    
    // Check if position was difficult or losing
    const wasLosingBadly = Math.abs(beforeEval.score) > 300; // More than 3 pawns disadvantage
    const wasMateThreats = beforeEval.mate !== undefined && Math.abs(beforeEval.mate) <= 5;
    
    // Check if move seems tactical (promotions or long principal variations)
    const seemsTactical = actualMove.length > 4 || // promotion
                         (beforeEval.pv && beforeEval.pv.length > 8); // long tactical sequence
    
    // Only mark as brilliant if it was a difficult position with tactical themes
    return (wasLosingBadly || wasMateThreats) && seemsTactical;
  }

  private setClassificationBooleans(moveAnalysis: MoveAnalysis) {
    moveAnalysis.isBrilliant = moveAnalysis.classification === MoveClassification.BRILLIANT;
    moveAnalysis.isGreat = moveAnalysis.classification === MoveClassification.GREAT;
    moveAnalysis.isGood = moveAnalysis.classification === MoveClassification.GOOD;
    moveAnalysis.isInaccuracy = moveAnalysis.classification === MoveClassification.INACCURACY;
    moveAnalysis.isMistake = moveAnalysis.classification === MoveClassification.MISTAKE;
    moveAnalysis.isBlunder = moveAnalysis.classification === MoveClassification.BLUNDER;
  }

  // OPTIMIZED: More generous accuracy calculation
  private calculateAccuracy(scoreDrop: number): number {
    if (scoreDrop <= 3) return 100;
    if (scoreDrop <= 10) return 99;
    if (scoreDrop <= 20) return 97;
    if (scoreDrop <= 40) return 95;
    if (scoreDrop <= 60) return 92;
    if (scoreDrop <= 100) return 88;
    if (scoreDrop <= 150) return 82;
    if (scoreDrop <= 200) return 75;
    if (scoreDrop <= 300) return 65;
    if (scoreDrop <= 400) return 50;
    return Math.max(20, 45 - (scoreDrop / 50)); // Minimum 20% accuracy, more gradual decline
  }

  private calculateAverageAccuracy(moves: MoveAnalysis[]): number {
    if (moves.length === 0) return 0;
    const total = moves.reduce((sum, move) => sum + move.accuracy, 0);
    return Math.round((total / moves.length) * 10) / 10;
  }

  // OPTIMIZED: Only check first 4 moves for opening book
  private isOpeningMove(gamePositions: string[], moveIndex: number): boolean {
    // OPTIMIZED: Only consider first 4 moves as potential opening moves (2 per side)
    if (moveIndex >= 4) return false;

    // Check if current position matches any opening from database
    if (gamePositions.length > 0) {
      const currentPos = gamePositions[gamePositions.length - 1];
      // @ts-ignore
      return openings.some(opening => opening.fen === currentPos);
    }

    return false;
  }

  private identifyOpeningFromPositions(gamePositions: string[]): string {
    // Check each position against the openings database
    for (let i = gamePositions.length - 1; i >= 0; i--) {
      const position = gamePositions[i];
      // @ts-ignore
      const matchedOpening = openings.find(opening => opening.fen === position);
      if (matchedOpening) {
        return matchedOpening.name;
      }
    }

    // Fallback to simple opening detection based on first few moves
    return this.identifyOpeningFromMovesSimple(gamePositions);
  }

  private identifyOpeningFromMovesSimple(gamePositions: string[]): string {
    // Basic opening identification as fallback
    const basicOpenings: { [key: string]: string } = {
      'e4 e5': 'King\'s Pawn Game',
      'e4 c5': 'Sicilian Defense',
      'e4 e6': 'French Defense',
      'e4 c6': 'Caro-Kann Defense',
      'e4 d5': 'Scandinavian Defense',
      'd4 d5': 'Queen\'s Pawn Game',
      'd4 Nf6': 'Indian Defense',
      'd4 f5': 'Dutch Defense',
      'Nf3 d5': 'Reti Opening',
      'Nf3 Nf6': 'Reti Opening',
      'c4': 'English Opening',
      'f4': 'Bird\'s Opening',
      'b3': 'Nimzo-Larsen Attack'
    };

    // This is a simplified fallback - in practice, you'd need to track actual moves
    // For now, return a default
    return 'Standard Opening';
  }

  private async identifyOpeningFromMoves(moves: MoveAnalysis[]): Promise<string> {
    return this.identifyOpeningFromMovesSimple([]);
  }

  private async identifyOpening(moves: any[]): Promise<string> {
    return this.identifyOpeningFromMoves(moves.slice(0, 6));
  }
}

class ChessBotService {
  private stockfish: StockfishManager;

  constructor(stockfishManager: StockfishManager) {
    this.stockfish = stockfishManager;
  }

  async getBestMove(request: BotMoveRequest): Promise<BotMoveResponse> {
    try {
      const { fen, depth, playerLevel } = request;
      
      // Convert player level to depth if provided
      const analysisDepth = this.getDepthFromLevel(depth, playerLevel);
      
      // Validate FEN
      const chess = new Chess(fen);
      if (!chess.isGameOver()) {
        // Get engine evaluation
        const evaluation = await this.stockfish.evaluatePosition(fen, analysisDepth);
        
        // Get the best move in UCI format
        const bestMoveUci = evaluation.pv[0];
        if (!bestMoveUci) {
          throw new Error('No valid moves found');
        }

        // Convert UCI to SAN
        const tempChess = new Chess(fen);
        const bestMoveSan = this.uciToSan(tempChess, bestMoveUci);

        // Make the move to evaluate the resulting position
        const moveObj = tempChess.move({
          from: bestMoveUci.slice(0, 2),
          to: bestMoveUci.slice(2, 4),
          promotion: bestMoveUci.slice(4) || undefined
        });

        if (!moveObj) {
          throw new Error('Invalid move generated');
        }

        // Get evaluation after the move
        const afterEvaluation = await this.stockfish.evaluatePosition(tempChess.fen(), analysisDepth);
        
        // Calculate move classification
        const classification = this.classifyBotMove(evaluation, afterEvaluation, bestMoveUci === evaluation.pv[0]);
        
        // Get alternative moves for variety
        const alternatives = await this.getAlternativeMoves(fen, evaluation, analysisDepth);
        
        // Analyze game state
        const gameAnalysis = this.analyzeGameState(chess, evaluation);

        return {
          bestMove: bestMoveUci,
          bestMoveSan: bestMoveSan,
          evaluation: evaluation.score,
          classification,
          confidence: this.calculateConfidence(evaluation, analysisDepth),
          alternativeMoves: alternatives,
          analysis: gameAnalysis
        };

      } else {
        throw new Error('Game is already over');
      }

    } catch (error) {
      console.error('Bot move generation failed:', error);
      throw new Error(`Failed to generate bot move: ${error}`);
    }
  }

  private getDepthFromLevel(depth?: number, playerLevel?: string): number {
    if (depth) {
      return Math.max(1, Math.min(20, depth)); // Clamp between 1-20
    }

    // Convert player level to appropriate depth
    switch (playerLevel) {
      case 'beginner': return 6;   // ~800-1200 ELO
      case 'intermediate': return 10; // ~1200-1600 ELO  
      case 'advanced': return 15;  // ~1600-2000 ELO
      case 'expert': return 18;    // ~2000+ ELO
      default: return 12;          // Default intermediate-advanced level
    }
  }

  private uciToSan(chess: Chess, uciMove: string): string {
    try {
      const move = chess.move({
        from: uciMove.slice(0, 2),
        to: uciMove.slice(2, 4),
        promotion: uciMove.slice(4) || undefined
      });
      
      // Undo the move to keep original position
      chess.undo();
      
      return move ? move.san : uciMove;
    } catch {
      return uciMove;
    }
  }

  private classifyBotMove(
    beforeEval: EngineEvaluation,
    afterEval: EngineEvaluation,
    isBestMove: boolean
  ): MoveClassification {
    // For bot moves, we're generally playing the best move
    if (isBestMove) {
      // Check if it's a brilliant tactical shot
      if (this.isTacticalMove(beforeEval, afterEval)) {
        return MoveClassification.BRILLIANT;
      }
      
      // Check if it's a great move in a complex position
      if (this.isGreatMove(beforeEval, afterEval)) {
        return MoveClassification.GREAT;
      }
      
      return MoveClassification.GOOD;
    }

    // This shouldn't happen for bot moves, but handle edge cases
    return MoveClassification.GOOD;
  }

  private isTacticalMove(beforeEval: EngineEvaluation, afterEval: EngineEvaluation): boolean {
    // Check for large evaluation swings (tactical shots)
    const evalSwing = Math.abs(afterEval.score - (-beforeEval.score));
    
    // Check for mate patterns
    const findsMate = afterEval.mate !== undefined && Math.abs(afterEval.mate) <= 3;
    
    // Check for significant material/positional gain
    const significantGain = evalSwing > 200; // More than 2 pawns
    
    return findsMate || significantGain;
  }

  private isGreatMove(beforeEval: EngineEvaluation, afterEval: EngineEvaluation): boolean {
    // Check if the move improves position in complex situation
    const wasComplexPosition = beforeEval.pv && beforeEval.pv.length > 6;
    const improvesPosition = (-beforeEval.score) < afterEval.score;
    
    return wasComplexPosition && improvesPosition;
  }

  private calculateConfidence(evaluation: EngineEvaluation, depth: number): number {
    let confidence = Math.min(100, depth * 5); // Base confidence on depth
    
    // Increase confidence for clear evaluations
    if (Math.abs(evaluation.score) > 300) confidence += 10;
    if (evaluation.mate !== undefined) confidence = 100;
    
    // Decrease confidence for complex positions
    if (evaluation.pv && evaluation.pv.length > 10) confidence -= 5;
    
    return Math.max(60, Math.min(100, confidence));
  }

  private async getAlternativeMoves(
    fen: string, 
    mainEvaluation: EngineEvaluation, 
    depth: number
  ): Promise<BotMoveResponse['alternativeMoves']> {
    try {
      const chess = new Chess(fen);
      const legalMoves = chess.moves({ verbose: true });
      
      // Get top 3 alternative moves (excluding the best one)
      const alternatives: BotMoveResponse['alternativeMoves'] = [];
      
      for (let i = 1; i < Math.min(4, mainEvaluation.pv.length); i++) {
        const altMoveUci = mainEvaluation.pv[i];
        if (altMoveUci) {
          const altMoveSan = this.uciToSan(new Chess(fen), altMoveUci);
          
          // Make the alternative move and evaluate
          const tempChess = new Chess(fen);
          try {
            tempChess.move({
              from: altMoveUci.slice(0, 2),
              to: altMoveUci.slice(2, 4),
              promotion: altMoveUci.slice(4) || undefined
            });
            
            const altEval = await this.stockfish.evaluatePosition(tempChess.fen(), Math.max(6, depth - 3));
            
            alternatives.push({
              move: altMoveUci,
              moveSan: altMoveSan,
              evaluation: altEval.score,
              classification: this.classifyBotMove(mainEvaluation, altEval, false)
            });
          } catch {
            // Skip invalid moves
            continue;
          }
        }
      }
      
      return alternatives.slice(0, 3); // Return top 3 alternatives
      
    } catch (error) {
      console.error('Failed to get alternative moves:', error);
      return [];
    }
  }

  private analyzeGameState(chess: Chess, evaluation: EngineEvaluation) {
    const isCheckmate = chess.isCheckmate();
    const isCheck = chess.inCheck();
    const isStalemate = chess.isStalemate();
    
    // Calculate material balance
    const board = chess.board();
    let materialBalance = 0;
    const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    
    for (const row of board) {
      for (const square of row) {
        if (square) {
          const value = pieceValues[square.type as keyof typeof pieceValues] || 0;
          materialBalance += square.color === 'w' ? value : -value;
        }
      }
    }
    
    // Determine game phase
    let gamePhase: 'opening' | 'middlegame' | 'endgame' = 'middlegame';
    const moveCount = chess.moveNumber();
    const totalMaterial = Math.abs(materialBalance);
    
    if (moveCount <= 10) {
      gamePhase = 'opening';
    } else if (totalMaterial <= 20) { // Queens + some pieces gone
      gamePhase = 'endgame';
    }
    
    return {
      isCheckmate,
      isCheck,
      isStalemate,
      gamePhase,
      materialBalance: chess.turn() === 'w' ? materialBalance : -materialBalance
    };
  }
}

// Initialize services
const analysisService = new GameAnalysisService();

// Routes
// @ts-ignoreS
app.post('/api/analyze-moves', async (req, res) => {
  try {
    const { fen, moves, gameInfo }: AnalysisRequest = req.body;

    if (!fen || !moves || !Array.isArray(moves)) {
      return res.status(400).json({ 
        error: 'Missing required fields. Need: fen (string) and moves (array of UCI moves)',
        example: {
          fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
          moves: ["e2e4", "e7e5", "g1f3"],
          gameInfo: {
            white: "Player 1",
            black: "Player 2",
            result: "*"
          }
        }
      });
    }

    console.log(`Starting analysis for ${moves.length} moves from FEN: ${fen}`);
    const analysis = await analysisService.analyzeGameFromMoves({ fen, moves, gameInfo });
    
    res.json({
      success: true,
      analysis,
      message: 'Game analyzed successfully'
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: error || 'Analysis failed',
      message: 'Failed to analyze game'
    });
  }
});

// Original PGN analysis route (backward compatibility)
// @ts-ignore
app.post('/api/analyze', upload.single('pgn'), async (req, res) => {
  try {
    let pgnContent: string;

    if (req.file) {
      // File upload
      pgnContent = fs.readFileSync(req.file.path, 'utf-8');
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
    } else if (req.body.pgn) {
      // Text content
      pgnContent = req.body.pgn;
    } else {
      return res.status(400).json({ 
        error: 'No PGN content provided. Send either a file or PGN text.' 
      });
    }

    console.log('Starting game analysis from PGN...');
    const analysis = await analysisService.analyzeGame(pgnContent);
    
    res.json({
      success: true,
      analysis,
      message: 'Game analyzed successfully'
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: error || 'Analysis failed',
      message: 'Failed to analyze game'
    });
  }
});


// @ts-ignore
app.post('/api/analyze-position', async (req, res) => {
  try {
    const { fen } = req.body;
    
    if (!fen) {
      return res.status(400).json({ error: 'FEN position required' });
    }

    const stockfish = new StockfishManager();
    const evaluation = await stockfish.evaluatePosition(fen);
    stockfish.destroy();

    res.json({
      success: true,
      evaluation,
      message: 'Position analyzed successfully'
    });

  } catch (error) {
    console.error('Position analysis error:', error);
    res.status(500).json({
      success: false,
      error: error || 'Position analysis failed'
    });
  }
});

// @ts-ignore
app.post('/api/bot-move', async (req, res) => {
  try {
    const { fen, depth, playerLevel }: BotMoveRequest = req.body;

    if (!fen) {
      return res.status(400).json({ 
        error: 'FEN position is required',
        example: {
          fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
          depth: 12, // Optional: 1-20
          playerLevel: "intermediate" 
        }
      });
    }

    // Validate FEN format
    try {
      new Chess(fen);
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid FEN format',
        details: error
      });
    }

    console.log(`Generating bot move for FEN: ${fen} at depth: ${depth || playerLevel || 'default'}`);
    
    // Create bot service instance (reuse existing stockfish manager)
    const botService = new ChessBotService(analysisService['stockfish']);
    
    const botResponse = await botService.getBestMove({ fen, depth, playerLevel });
    
    res.json({
      success: true,
      ...botResponse,
      message: 'Bot move generated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Bot move error:', error);
    res.status(500).json({
      success: false,
      error: error || 'Failed to generate bot move',
      message: 'Bot move generation failed'
    });
  }
});

// HEalth Check EndPoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Chess Analytics Server is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      '/api/analyze-moves': 'POST - Analyze game from FEN + UCI moves',
      '/api/analyze': 'POST - Analyze game from PGN',
      '/api/analyze-position': 'POST - Analyze single position',
      '/api/bot-move': 'POST - Get best move for bot gameplay (NEW)',
      '/api/health': 'GET - Health check'
    }
  });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Chess Analytics Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`New endpoint: POST http://localhost:${PORT}/api/analyze-moves`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  process.exit(0);
});

export { app, GameAnalysisService, StockfishManager };