// Chess Analytics Server Implementation (Node.js)

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Chess } from 'chess.js';
import { spawn, ChildProcess } from 'child_process';

;

// Multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  // @ts-ignore
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
    date: string;
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

// Stockfish Engine Manager
class StockfishManager {
  private engine: ChildProcess | null = null;
  private isReady: boolean = false;
  private evaluationPromises: Map<string, { resolve: Function, reject: Function }> = new Map();
  private currentEvaluationId: string | null = null;

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

      // Initialize engine
      this.sendCommand('uci');
      this.sendCommand('ucinewgame');
      this.sendCommand('isready');
      
    } catch (error) {
      console.error('Failed to initialize Stockfish:', error);
    }
  }

  private sendCommand(command: string) {
    if (this.engine && this.engine.stdin) {
      this.engine.stdin.write(command + '\n');
    }
  }

  private handleEngineOutput(output: string) {
    const lines = output.trim().split('\n');
    
    for (const line of lines) {
      if (line === 'readyok') {
        this.isReady = true;
      } else if (line.startsWith('info depth') && this.currentEvaluationId) {
        this.processEvaluationLine(line);
      } else if (line.startsWith('bestmove') && this.currentEvaluationId) {
        this.finalizeBestMove(line);
      }
    }
  }

  private processEvaluationLine(line: string) {
    const evaluation = this.parseEvaluation(line);
    if (evaluation.depth >= 15 && this.currentEvaluationId) {
      const promise = this.evaluationPromises.get(this.currentEvaluationId);
      if (promise) {
        promise.resolve(evaluation);
        this.evaluationPromises.delete(this.currentEvaluationId);
        this.currentEvaluationId = null;
      }
    }
  }

  private finalizeBestMove(line: string) {
    // Handle cases where we didn't get deep enough evaluation
    if (this.currentEvaluationId) {
      const promise = this.evaluationPromises.get(this.currentEvaluationId);
      if (promise) {
        // Return basic evaluation if we couldn't get deep analysis
        promise.resolve({
          score: 0,
          depth: 0,
          nodes: 0,
          time: 0,
          pv: [],
          nps: 0
        });
        this.evaluationPromises.delete(this.currentEvaluationId);
        this.currentEvaluationId = null;
      }
    }
  }

  async evaluatePosition(fen: string, depth: number = 15): Promise<EngineEvaluation> {
    if (!this.isReady) {
      throw new Error('Stockfish engine not ready');
    }

    return new Promise((resolve, reject) => {
      const evaluationId = Date.now().toString() + Math.random().toString();
      this.currentEvaluationId = evaluationId;
      this.evaluationPromises.set(evaluationId, { resolve, reject });

      this.sendCommand(`position fen ${fen}`);
      this.sendCommand(`go depth ${depth}`);

      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.evaluationPromises.has(evaluationId)) {
          this.evaluationPromises.delete(evaluationId);
          this.currentEvaluationId = null;
          reject(new Error('Evaluation timeout'));
        }
      }, 10000);
    });
  }

  private parseEvaluation(infoLine: string): EngineEvaluation {
    const parts = infoLine.split(' ');
    const evaluation: Partial<EngineEvaluation> = {
      pv: []
    };

    for (let i = 0; i < parts.length; i++) {
      switch (parts[i]) {
        case 'depth':
          evaluation.depth = parseInt(parts[i + 1]!);
          break;
        case 'score':
          if (parts[i + 1] === 'cp') {
            evaluation.score = parseInt(parts[i + 2]!);
          } else if (parts[i + 1] === 'mate') {
            evaluation.mate = parseInt(parts[i + 2]!);
            evaluation.score = evaluation.mate > 0 ? 10000 : -10000;
          }
          break;
        case 'nodes':
          evaluation.nodes = parseInt(parts[i + 1]!);
          break;
        case 'time':
          evaluation.time = parseInt(parts[i + 1]!);
          break;
        case 'nps':
          evaluation.nps = parseInt(parts[i + 1]!);
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
        date: header.Date || 'Unknown',
        event: header.Event || 'Unknown',
        site: header.Site || 'Unknown',
        round: header.Round || '?',
        eco: header.ECO || 'Unknown'
      };

      const history = chess.history({ verbose: true });
      
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
        openingName: await this.identifyOpening(history.slice(0, 10)),
        gameLength: history.length,
        analysisTime: 0
      };

      // Reset chess to analyze move by move
      chess.reset();
      chess.loadPgn(pgnContent);
      chess.reset();

      let previousEval: EngineEvaluation | null = null;

      // Analyze each move
      for (let i = 0; i < history.length; i++) {
        const position = chess.fen();
        const move = history[i];
        const moveNumber = Math.floor(i / 2) + 1;
        const isWhite = i % 2 === 0;

        console.log(`Analyzing move ${i + 1}/${history.length}: ${move?.san}`);

        try {
          // Evaluate position before move
          const beforeEval = await this.stockfish.evaluatePosition(position, 15);
          
          // Make the move and evaluate after
          chess.move(move!);
          const afterPos = chess.fen();
          const afterEval = await this.stockfish.evaluatePosition(afterPos, 15);

          // Calculate best move and score drop
          const bestMoveEval = beforeEval; // Simplified - in practice, get actual best move
          const scoreDrop = this.calculateScoreDrop(beforeEval, afterEval, isWhite);
          
          const moveAnalysis: MoveAnalysis = {
            move: move?.san!,
            moveNumber,
            isWhite,
            score: isWhite ? afterEval.score : -afterEval.score,
            classification: this.classifyMove(scoreDrop, false), // Simplified
            accuracy: this.calculateAccuracy(scoreDrop),
            isBlunder: false,
            isMistake: false,
            isInaccuracy: false,
            isBrilliant: false,
            isGreat: false,
            isGood: false,
            bestMove: beforeEval.pv[0],
            scoreDrop,
            position
          };

          // Set classification booleans
          this.setClassificationBooleans(moveAnalysis);
          
          // Update classifications count
          analysis.classifications[moveAnalysis.classification]++;
          
          analysis.moves.push(moveAnalysis);

          // Update evaluation graph
          analysis.evaluationGraph.push({
            moveNumber,
            isWhite,
            evaluation: moveAnalysis.score,
            accuracy: moveAnalysis.accuracy,
            move: move?.san!
          });

          previousEval = afterEval;

        } catch (error) {
          console.error(`Error analyzing move ${i + 1}:`, error);
          // Add placeholder analysis for failed moves
          const placeholderAnalysis: MoveAnalysis = {
            move: move?.san!,
            moveNumber,
            isWhite,
            score: 0,
            classification: MoveClassification.BOOK,
            accuracy: 90,
            isBlunder: false,
            isMistake: false,
            isInaccuracy: false,
            isBrilliant: false,
            isGreat: false,
            isGood: true,
            scoreDrop: 0,
            position: chess.fen()
          };
          
          analysis.moves.push(placeholderAnalysis);
          analysis.classifications.book++;
          chess.move(move!);
        }
      }

      // Calculate overall accuracy
      const whiteMoves = analysis.moves.filter(m => m.isWhite);
      const blackMoves = analysis.moves.filter(m => !m.isWhite);
      
      analysis.whiteAccuracy = this.calculateAverageAccuracy(whiteMoves);
      analysis.blackAccuracy = this.calculateAverageAccuracy(blackMoves);
      
      analysis.analysisTime = Date.now() - startTime;
      
      return analysis;

    } catch (error) {
      console.error('Game analysis failed:', error);
      // @ts-ignore
      throw new Error(`Analysis failed: ${error?.message}`);
    }
  }

  private calculateScoreDrop(beforeEval: EngineEvaluation, afterEval: EngineEvaluation, isWhite: boolean): number {
    const beforeScore = beforeEval.score;
    const afterScore = isWhite ? -afterEval.score : afterEval.score;
    return Math.abs(beforeScore - afterScore);
  }

  private classifyMove(scoreDrop: number, isBestMove: boolean): MoveClassification {
    if (isBestMove || scoreDrop <= 10) return MoveClassification.BRILLIANT;
    if (scoreDrop <= 25) return MoveClassification.GREAT;
    if (scoreDrop <= 50) return MoveClassification.GOOD;
    if (scoreDrop <= 100) return MoveClassification.INACCURACY;
    if (scoreDrop <= 300) return MoveClassification.MISTAKE;
    return MoveClassification.BLUNDER;
  }

  private setClassificationBooleans(moveAnalysis: MoveAnalysis) {
    moveAnalysis.isBrilliant = moveAnalysis.classification === MoveClassification.BRILLIANT;
    moveAnalysis.isGreat = moveAnalysis.classification === MoveClassification.GREAT;
    moveAnalysis.isGood = moveAnalysis.classification === MoveClassification.GOOD;
    moveAnalysis.isInaccuracy = moveAnalysis.classification === MoveClassification.INACCURACY;
    moveAnalysis.isMistake = moveAnalysis.classification === MoveClassification.MISTAKE;
    moveAnalysis.isBlunder = moveAnalysis.classification === MoveClassification.BLUNDER;
  }

  private calculateAccuracy(scoreDrop: number): number {
    return Math.max(0, Math.min(100, 100 - (scoreDrop / 10)));
  }

  private calculateAverageAccuracy(moves: MoveAnalysis[]): number {
    if (moves.length === 0) return 0;
    const total = moves.reduce((sum, move) => sum + move.accuracy, 0);
    return Math.round((total / moves.length) * 10) / 10;
  }

  private async identifyOpening(moves: any[]): Promise<string> {
    const moveString = moves.map(m => m.san).join(' ');
    
    const openings: { [key: string]: string } = {
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

    for (const [pattern, name] of Object.entries(openings)) {
      if (moveString.startsWith(pattern)) {
        return name;
      }
    }

    return 'Unknown Opening';
  }
}

// Initialize services
export const analysisService = new GameAnalysisService();


// Error handling middleware

// Start server


export {  GameAnalysisService, StockfishManager };