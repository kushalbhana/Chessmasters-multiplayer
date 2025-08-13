// Chess Analytics Server Implementation (Node.js) - FIXED VERSION

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Chess } from 'chess.js';
import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import {openings} from './lib/openings';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
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
  winChanceDrop: number; // NEW: Win probability drop
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
  fen: string; // Current position after player's move
  depth?: number; // Bot strength (1-20, default: 12)
  playerLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  
  // Player move evaluation (optional)
  lastFen?: string; // Position before player's last move
  lastPlayerMove?: string; // Player's last move in UCI format
}

interface PlayerMoveEvaluation {
  move: string; // UCI format
  moveSan: string; // SAN format  
  classification: MoveClassification;
  accuracy: number; // 0-100
  scoreDrop: number; // How much the position worsened
  winChanceDrop: number; // NEW: Win probability drop
  isBlunder: boolean;
  isMistake: boolean;
  isInaccuracy: boolean;
  isBrilliant: boolean;
  isGreat: boolean;
  isGood: boolean;
  bestAlternative?: {
    move: string;
    moveSan: string;
    scoreDifference: number; // How much better this would have been
  };
}

interface BotMoveResponse {
  bestMove: string; // UCI format
  bestMoveSan: string; // SAN format
  evaluation: number; // Centipawns
  classification: MoveClassification;
  confidence: number; // 0-100
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
  
  // Player move evaluation (if lastFen and lastPlayerMove provided)
  playerMoveEvaluation?: PlayerMoveEvaluation;
}

// FIXED: Queue-based job for engine requests
interface EngineJob {
  id: string;
  fen: string;
  depth: number;
  resolve: (evaluation: EngineEvaluation) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

// FIXED: Robust Stockfish Engine Manager with proper queueing
class StockfishManager {
  private engine: ChildProcess | null = null;
  private isReady: boolean = false;
  private jobQueue: EngineJob[] = [];
  private currentJob: EngineJob | null = null;
  private busy: boolean = false;

  constructor() {
    this.initEngine();
  }

  private initEngine() {
    try {
      // Path to stockfish binary (adjust based on your setup)
      const stockfishPath = process.env.STOCKFISH_PATH || "/usr/games/stockfish";
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
        this.rejectAllJobs(new Error('Engine process closed'));
      });

      this.engine.on('error', (error) => {
        console.error('Stockfish spawn error:', error);
        this.isReady = false;
        this.rejectAllJobs(error);
      });

      // Initialize engine with MultiPV for better alternatives
      this.sendCommand('uci');
      this.sendCommand('setoption name Hash value 128');
      this.sendCommand('setoption name Threads value 1');
      this.sendCommand('setoption name MultiPV value 3'); // Get top 3 moves
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
        this.processQueue(); // Start processing queued jobs
      } else if (line === 'uciok') {
        // Engine is ready for UCI commands
      } else if (line.startsWith('info depth') && this.currentJob) {
        this.handleInfoLine(line);
      } else if (line.startsWith('bestmove') && this.currentJob) {
        this.handleBestMove(line);
      }
    }
  }

  private handleInfoLine(line: string) {
    if (!this.currentJob) return;
    
    const evaluation = this.parseEvaluation(line);
    
    // Accept evaluation if it reaches reasonable depth or has mate info
    if (evaluation.depth >= Math.min(12, this.currentJob.depth) || evaluation.mate !== undefined) {
      this.completeCurrentJob(evaluation);
    }
  }

  private handleBestMove(line: string) {
    if (!this.currentJob) return;
    
    // If we haven't resolved yet, create a basic evaluation from bestmove
    const bestMove = line.split(' ')[1];
    const basicEvaluation: EngineEvaluation = {
      score: 0,
      depth: 1,
      nodes: 0,
      time: 0,
      pv: [bestMove!],
      nps: 0
    };
    
    this.completeCurrentJob(basicEvaluation);
  }

  private completeCurrentJob(evaluation: EngineEvaluation) {
    if (!this.currentJob) return;
    
    clearTimeout(this.currentJob.timeout);
    this.currentJob.resolve(evaluation);
    this.currentJob = null;
    this.busy = false;
    
    // Process next job in queue
    this.processQueue();
  }

  private rejectAllJobs(error: Error) {
    // Reject current job
    if (this.currentJob) {
      clearTimeout(this.currentJob.timeout);
      this.currentJob.reject(error);
      this.currentJob = null;
    }
    
    // Reject all queued jobs
    this.jobQueue.forEach(job => {
      clearTimeout(job.timeout);
      job.reject(error);
    });
    this.jobQueue = [];
    this.busy = false;
  }

  async evaluatePosition(fen: string, depth: number = 15): Promise<EngineEvaluation> {
    if (!this.isReady) {
      await this.waitForReady();
    }

    return new Promise((resolve, reject) => {
      const jobId = Date.now().toString() + Math.random().toString();
      
      // Set timeout for this specific job
      const timeout = setTimeout(() => {
        // Remove job from queue if it hasn't started
        const jobIndex = this.jobQueue.findIndex(job => job.id === jobId);
        if (jobIndex >= 0) {
          this.jobQueue.splice(jobIndex, 1);
          reject(new Error('Evaluation timeout (queued)'));
        } else if (this.currentJob?.id === jobId) {
          // Job is currently running
          this.currentJob = null;
          this.busy = false;
          reject(new Error('Evaluation timeout (running)'));
          this.processQueue(); // Process next job
        }
      }, 8000); // Increased timeout for better analysis

      const job: EngineJob = {
        id: jobId,
        fen,
        depth,
        resolve,
        reject,
        timeout
      };

      this.jobQueue.push(job);
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.busy || !this.isReady || this.jobQueue.length === 0) {
      return;
    }

    this.busy = true;
    this.currentJob = this.jobQueue.shift()!;

    try {
      this.sendCommand(`position fen ${this.currentJob.fen}`);
      this.sendCommand(`go depth ${this.currentJob.depth}`);
    } catch (error) {
      this.currentJob.reject(new Error(`Failed to send commands: ${error}`));
      this.currentJob = null;
      this.busy = false;
      this.processQueue();
    }
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
      
      setTimeout(() => reject(new Error('Engine not ready')), 10000);
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
            // Convert mate to large cp values for consistent comparison
            evaluation.score = evaluation.mate > 0 ? 100000 - evaluation.mate : -100000 - evaluation.mate;
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
    this.rejectAllJobs(new Error('Engine destroyed'));
    if (this.engine) {
      this.engine.kill();
    }
  }
}

// FIXED: Game Analysis Service with proper score calculations
class GameAnalysisService {
  private stockfish: StockfishManager;

  constructor() {
    this.stockfish = new StockfishManager();
  }

  // FIXED: Convert engine evaluation to centipawns from White's perspective
  private engineEvalToWhiteCp(ev: EngineEvaluation): number {
    // Convert mate to large cp so comparisons still work
    if (ev.mate !== undefined) {
      // positive mate => White mates in N
      if (ev.mate > 0) return 100000 - ev.mate;
      // negative mate => Black mates in N -> very negative
      return -100000 - ev.mate;
    }
    return ev.score; // assume score is in centipawns; interpret as White advantage
  }

  // FIXED: Convert centipawns to win probability using logistic function
  private cpToWinProbability(cp: number): number {
    // cp: centipawns from White's perspective
    // logistic mapping: probability White wins
    const k = 0.004; // steepness parameter (tuned for chess positions)
    const probWhite = 1 / (1 + Math.exp(-k * cp));
    return Math.max(0, Math.min(1, probWhite)); // clamp to [0,1]
  }

  // FIXED: Proper score drop calculation with consistent perspective handling
  private calculateScoreDrop(
    beforeEval: EngineEvaluation,
    afterEval: EngineEvaluation,
    isWhitePlayer: boolean // whether the player who just moved is White
  ): { scoreDrop: number; winChanceDrop: number } {
    const beforeWhite = this.engineEvalToWhiteCp(beforeEval);
    const afterWhite = this.engineEvalToWhiteCp(afterEval);

    // Convert to player's perspective: positive = better for the player who just moved
    const beforeForPlayer = isWhitePlayer ? beforeWhite : -beforeWhite;
    const afterForPlayer = isWhitePlayer ? afterWhite : -afterWhite;

    const scoreDrop = Math.max(0, Math.round(beforeForPlayer - afterForPlayer));

    // Calculate win probability drop (Lichess-style)
    const winBeforePlayer = isWhitePlayer 
      ? this.cpToWinProbability(beforeWhite)
      : 1 - this.cpToWinProbability(beforeWhite);
    
    const winAfterPlayer = isWhitePlayer
      ? this.cpToWinProbability(afterWhite)
      : 1 - this.cpToWinProbability(afterWhite);

    const winChanceDrop = Math.max(0, winBeforePlayer - winAfterPlayer);

    return { scoreDrop, winChanceDrop };
  }

  // FIXED: Classification using win probability drops (Lichess-style)
  private classifyMoveByWinDrop(
    winDrop: number, 
    isBestMove: boolean, 
    beforeEval: EngineEvaluation,
    actualMoveUci: string,
    moveIndex: number
  ): MoveClassification {
    // Opening moves (first 6-8 plies) are generally book moves if decent
    if (moveIndex < 8 && winDrop <= 0.08) {
      return MoveClassification.BOOK;
    }

    // Special case: if it's the best move or very close
    if (isBestMove || winDrop <= 0.02) {
      // Check if it's a particularly brilliant move
      if (this.isBrilliantMove(beforeEval, winDrop, actualMoveUci)) {
        return MoveClassification.BRILLIANT;
      }
      if (winDrop <= 0.01) return MoveClassification.GREAT;
      return MoveClassification.GOOD;
    }
    
    // Lichess-style thresholds based on win chance drop
    if (winDrop >= 0.30) return MoveClassification.BLUNDER;    // 30% win chance drop
    if (winDrop >= 0.20) return MoveClassification.MISTAKE;    // 20% win chance drop
    if (winDrop >= 0.10) return MoveClassification.INACCURACY; // 10% win chance drop
    
    return MoveClassification.GOOD;
  }

  // FIXED: More strict criteria for brilliant moves
  private isBrilliantMove(beforeEval: EngineEvaluation, winDrop: number, actualMove: string): boolean {
    // A move is brilliant if:
    // 1. It's the best move (minimal win drop)
    // 2. AND it's in a complex/difficult position
    // 3. AND it finds a non-obvious solution
    
    if (winDrop > 0.02) return false; // Must be very close to best move
    
    // Check if position was difficult or losing
    const wasLosingBadly = Math.abs(beforeEval.score) > 200; // More than 2 pawns disadvantage
    const wasMateThreats = beforeEval.mate !== undefined && Math.abs(beforeEval.mate) <= 5;
    
    // Check if move seems tactical (promotions or long principal variations)
    const seemsTactical = actualMove.length > 4 || // promotion
                         (beforeEval.pv && beforeEval.pv.length > 8); // long tactical sequence
    
    // Only mark as brilliant if it was a difficult position with tactical themes
    return (wasLosingBadly || wasMateThreats) && seemsTactical;
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
          // Check if this should be treated as an opening move
          const isOpeningPhase = i < 8; // First 8 plies

          // For opening moves, use lighter analysis
          if (isOpeningPhase && this.isOpeningMove(gamePositions, i)) {
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
              winChanceDrop: 0,
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

          // Get best move for current position
          const bestMoveUci = beforeEval.pv[0] || '';
          const bestMove = this.uciToSan(currentPosition, bestMoveUci);

          // FIXED: Calculate score drops with proper perspective
          const { scoreDrop, winChanceDrop } = this.calculateScoreDrop(beforeEval, afterEval, isWhite);
          
          const moveAnalysis: MoveAnalysis = {
            move: move.san,
            uciMove: uciMove!,
            moveNumber,
            isWhite,
            score: isWhite ? afterEval.score : -afterEval.score,
            classification: this.classifyMoveByWinDrop(winChanceDrop, uciMove === bestMoveUci, beforeEval, uciMove!, i),
            accuracy: this.calculateAccuracy(winChanceDrop),
            isBlunder: false,
            isMistake: false,
            isInaccuracy: false,
            isBrilliant: false,
            isGreat: false,
            isGood: false,
            bestMove: bestMove,
            bestMoveUci: bestMoveUci,
            scoreDrop,
            winChanceDrop,
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

              // Default to good moves for failed analysis
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
                winChanceDrop: 0,
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

  private uciToSan(fen: string, uciMove: string): string {
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

  private setClassificationBooleans(moveAnalysis: MoveAnalysis) {
    moveAnalysis.isBrilliant = moveAnalysis.classification === MoveClassification.BRILLIANT;
    moveAnalysis.isGreat = moveAnalysis.classification === MoveClassification.GREAT;
    moveAnalysis.isGood = moveAnalysis.classification === MoveClassification.GOOD;
    moveAnalysis.isInaccuracy = moveAnalysis.classification === MoveClassification.INACCURACY;
    moveAnalysis.isMistake = moveAnalysis.classification === MoveClassification.MISTAKE;
    moveAnalysis.isBlunder = moveAnalysis.classification === MoveClassification.BLUNDER;
  }

  // FIXED: Accuracy calculation based on win probability drop
  private calculateAccuracy(winChanceDrop: number): number {
    if (winChanceDrop <= 0.01) return 100;  // Perfect or near-perfect
    if (winChanceDrop <= 0.02) return 99;   // Excellent
    if (winChanceDrop <= 0.05) return 97;   // Great
    if (winChanceDrop <= 0.08) return 94;   // Very good
    if (winChanceDrop <= 0.10) return 90;   // Good (inaccuracy threshold)
    if (winChanceDrop <= 0.15) return 85;   // Decent
    if (winChanceDrop <= 0.20) return 75;   // Mistake threshold
    if (winChanceDrop <= 0.25) return 65;   // Poor
    if (winChanceDrop <= 0.30) return 50;   // Blunder threshold
    return Math.max(20, 45 - (winChanceDrop * 100)); // Minimum 20% accuracy
  }

  private calculateAverageAccuracy(moves: MoveAnalysis[]): number {
    if (moves.length === 0) return 0;
    const total = moves.reduce((sum, move) => sum + move.accuracy, 0);
    return Math.round((total / moves.length) * 10) / 10;
  }

  // FIXED: More restrictive opening move detection
  private isOpeningMove(gamePositions: string[], moveIndex: number): boolean {
    // Only consider first 8 moves as potential opening moves (4 per side)
    if (moveIndex >= 8) return false;

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

// FIXED: Chess Bot Service with improved evaluation
class ChessBotService {
  private stockfish: StockfishManager;

  constructor(stockfishManager: StockfishManager) {
    this.stockfish = stockfishManager;
  }

  async getBestMove(request: BotMoveRequest): Promise<BotMoveResponse> {
    try {
      const { fen, depth, playerLevel, lastFen, lastPlayerMove } = request;
      
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
        const bestMoveSan = this.uciToSan(fen, bestMoveUci);

        // Make the move to evaluate the resulting position
        const tempChess = new Chess(fen);
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

        // Evaluate player's last move if provided
        let playerMoveEvaluation: PlayerMoveEvaluation | undefined;
        if (lastFen && lastPlayerMove) {
          playerMoveEvaluation = await this.evaluatePlayerMove(lastFen, lastPlayerMove, fen);
        }

        return {
          bestMove: bestMoveUci,
          bestMoveSan: bestMoveSan,
          evaluation: evaluation.score,
          classification,
          confidence: this.calculateConfidence(evaluation, analysisDepth),
          alternativeMoves: alternatives,
          analysis: gameAnalysis,
          playerMoveEvaluation
        };

      } else {
        throw new Error('Game is already over');
      }

    } catch (error) {
      console.error('Bot move generation failed:', error);
      throw new Error(`Failed to generate bot move: ${error}`);
    }
  }

  // FIXED: Methods needed by ChessBotService for score calculations
  private engineEvalToWhiteCp(ev: EngineEvaluation): number {
    // Convert mate to large cp so comparisons still work
    if (ev.mate !== undefined) {
      // positive mate => White mates in N
      if (ev.mate > 0) return 100000 - ev.mate;
      // negative mate => Black mates in N -> very negative
      return -100000 - ev.mate;
    }
    return ev.score; // assume score is in centipawns; interpret as White advantage
  }

  // Convert centipawns to win probability using logistic function
  private cpToWinProbability(cp: number): number {
    // cp: centipawns from White's perspective
    // logistic mapping: probability White wins
    const k = 0.004; // steepness parameter (tuned for chess positions)
    const probWhite = 1 / (1 + Math.exp(-k * cp));
    return Math.max(0, Math.min(1, probWhite)); // clamp to [0,1]
  }

  // Score drop calculation with consistent perspective handling
  private calculateScoreDropForPlayer(
    beforeEval: EngineEvaluation,
    afterEval: EngineEvaluation,
    isWhitePlayer: boolean // whether the player who just moved is White
  ): { scoreDrop: number; winChanceDrop: number } {
    const beforeWhite = this.engineEvalToWhiteCp(beforeEval);
    const afterWhite = this.engineEvalToWhiteCp(afterEval);

    // Convert to player's perspective: positive = better for the player who just moved
    const beforeForPlayer = isWhitePlayer ? beforeWhite : -beforeWhite;
    const afterForPlayer = isWhitePlayer ? afterWhite : -afterWhite;

    const scoreDrop = Math.max(0, Math.round(beforeForPlayer - afterForPlayer));

    // Calculate win probability drop (Lichess-style)
    const winBeforePlayer = isWhitePlayer 
      ? this.cpToWinProbability(beforeWhite)
      : 1 - this.cpToWinProbability(beforeWhite);
    
    const winAfterPlayer = isWhitePlayer
      ? this.cpToWinProbability(afterWhite)
      : 1 - this.cpToWinProbability(afterWhite);

    const winChanceDrop = Math.max(0, winBeforePlayer - winAfterPlayer);

    return { scoreDrop, winChanceDrop };
  }

  // NEW: Evaluate player's last move
  private async evaluatePlayerMove(beforeFen: string, playerMoveUci: string, afterFen: string): Promise<PlayerMoveEvaluation> {
    try {
      // Get evaluations before and after the move
      const beforeEval = await this.stockfish.evaluatePosition(beforeFen, 12);
      const afterEval = await this.stockfish.evaluatePosition(afterFen, 12);
      
      // Determine if player is white or black
      const tempChess = new Chess(beforeFen);
      const isWhitePlayer = tempChess.turn() === 'w';
      
      // Convert move to SAN
      const moveSan = this.uciToSan(beforeFen, playerMoveUci);
      
      // Calculate score drops using the bot service's own methods
      const { scoreDrop, winChanceDrop } = this.calculateScoreDropForPlayer(beforeEval, afterEval, isWhitePlayer);
      
      // Get best move
      const bestMoveUci = beforeEval.pv[0] || '';
      const bestMoveSan = bestMoveUci ? this.uciToSan(beforeFen, bestMoveUci) : '';
      
      // Classify the move
      const classification = this.classifyPlayerMove(winChanceDrop, playerMoveUci === bestMoveUci);
      
      // Calculate best alternative if player didn't play best move
      let bestAlternative: PlayerMoveEvaluation['bestAlternative'] | undefined;
      if (playerMoveUci !== bestMoveUci && bestMoveUci) {
        // Evaluate what would have happened with best move
        const tempChess2 = new Chess(beforeFen);
        tempChess2.move({
          from: bestMoveUci.slice(0, 2),
          to: bestMoveUci.slice(2, 4),
          promotion: bestMoveUci.slice(4) || undefined
        });
        const bestMoveAfterEval = await this.stockfish.evaluatePosition(tempChess2.fen(), 10);
        const { scoreDrop: bestScoreDrop } = this.calculateScoreDropForPlayer(beforeEval, bestMoveAfterEval, isWhitePlayer);
        
        bestAlternative = {
          move: bestMoveUci,
          moveSan: bestMoveSan,
          scoreDifference: scoreDrop - bestScoreDrop
        };
      }

      return {
        move: playerMoveUci,
        moveSan: moveSan,
        classification,
        accuracy: this.calculatePlayerAccuracy(winChanceDrop),
        scoreDrop,
        winChanceDrop,
        isBlunder: classification === MoveClassification.BLUNDER,
        isMistake: classification === MoveClassification.MISTAKE,
        isInaccuracy: classification === MoveClassification.INACCURACY,
        isBrilliant: classification === MoveClassification.BRILLIANT,
        isGreat: classification === MoveClassification.GREAT,
        isGood: classification === MoveClassification.GOOD,
        bestAlternative
      };
      
    } catch (error) {
      console.error('Failed to evaluate player move:', error);
      throw new Error(`Player move evaluation failed: ${error}`);
    }
  }

  private classifyPlayerMove(winChanceDrop: number, isBestMove: boolean): MoveClassification {
    if (isBestMove || winChanceDrop <= 0.02) {
      if (winChanceDrop <= 0.01) return MoveClassification.GREAT;
      return MoveClassification.GOOD;
    }
    
    if (winChanceDrop >= 0.30) return MoveClassification.BLUNDER;
    if (winChanceDrop >= 0.20) return MoveClassification.MISTAKE;
    if (winChanceDrop >= 0.10) return MoveClassification.INACCURACY;
    
    return MoveClassification.GOOD;
  }

  private calculatePlayerAccuracy(winChanceDrop: number): number {
    if (winChanceDrop <= 0.01) return 100;
    if (winChanceDrop <= 0.02) return 99;
    if (winChanceDrop <= 0.05) return 97;
    if (winChanceDrop <= 0.08) return 94;
    if (winChanceDrop <= 0.10) return 90;
    if (winChanceDrop <= 0.15) return 85;
    if (winChanceDrop <= 0.20) return 75;
    if (winChanceDrop <= 0.25) return 65;
    if (winChanceDrop <= 0.30) return 50;
    return Math.max(20, 45 - (winChanceDrop * 100));
  }



  private getDepthFromLevel(depth?: number, playerLevel?: string): number {
    if (depth) {
      return Math.max(1, Math.min(20, depth)); // Clamp between 1-20
    }

    // Convert player level to appropriate depth
    switch (playerLevel) {
      case 'beginner': return 8;   // ~800-1200 ELO (increased from 6)
      case 'intermediate': return 12; // ~1200-1600 ELO  
      case 'advanced': return 16;  // ~1600-2000 ELO (increased from 15)
      case 'expert': return 20;    // ~2000+ ELO (increased from 18)
      default: return 14;          // Default intermediate-advanced level
    }
  }

  private uciToSan(fen: string, uciMove: string): string {
    try {
      const chess = new Chess(fen);
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
    let confidence = Math.min(100, depth * 4); // Base confidence on depth
    
    // Increase confidence for clear evaluations
    if (Math.abs(evaluation.score) > 300) confidence += 15;
    if (evaluation.mate !== undefined) confidence = 100;
    
    // Decrease confidence for complex positions
    if (evaluation.pv && evaluation.pv.length > 10) confidence -= 10;
    
    return Math.max(70, Math.min(100, confidence));
  }

  private async getAlternativeMoves(
    fen: string, 
    mainEvaluation: EngineEvaluation, 
    depth: number
  ): Promise<BotMoveResponse['alternativeMoves']> {
    try {
      // MultiPV should give us multiple moves in the PV array
      const alternatives: BotMoveResponse['alternativeMoves'] = [];
      
      for (let i = 1; i < Math.min(4, mainEvaluation.pv.length); i++) {
        const altMoveUci = mainEvaluation.pv[i];
        if (altMoveUci) {
          const altMoveSan = this.uciToSan(fen, altMoveUci);
          
          // Make the alternative move and evaluate
          const tempChess = new Chess(fen);
          try {
            tempChess.move({
              from: altMoveUci.slice(0, 2),
              to: altMoveUci.slice(2, 4),
              promotion: altMoveUci.slice(4) || undefined
            });
            
            const altEval = await this.stockfish.evaluatePosition(tempChess.fen(), Math.max(8, depth - 4));
            
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
    const totalPieces = board.flat().filter(square => square !== null).length;
    
    if (moveCount <= 12) {
      gamePhase = 'opening';
    } else if (totalPieces <= 16) { // Many pieces traded off
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
// @ts-ignore
app.post('/engine/api/analyze-moves', async (req, res) => {
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
app.post('/engine/api/analyze', upload.single('pgn'), async (req, res) => {
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
app.post('/engine/api/analyze-position', async (req, res) => {
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
app.post('/engine/api/bot-move', async (req, res) => {
  try {
    const { fen, depth, playerLevel, lastFen, lastPlayerMove }: BotMoveRequest = req.body;
    console.log('Bot move request received');
    
    if (!fen) {
      return res.status(400).json({ 
        error: 'FEN position is required',
        example: {
          fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
          depth: depth, 
          playerLevel: "intermediate",
          lastFen: "previous position FEN (optional)",
          lastPlayerMove: "e2e4 (optional)" 
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
    
    const botResponse = await botService.getBestMove({ fen, depth, playerLevel, lastFen, lastPlayerMove });
    
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

// Health Check Endpoint
app.get('/engine/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Chess Analytics Server is running (FIXED VERSION)',
    timestamp: new Date().toISOString(),
    improvements: [
      'Fixed score drop calculations with proper perspective handling',
      'Implemented Lichess-style win probability classification',
      'Added robust queue-based Stockfish engine management',
      'Enhanced MultiPV support for better alternatives',
      'Improved player move evaluation with win chance drops'
    ],
    endpoints: {
      '/api/analyze-moves': 'POST - Analyze game from FEN + UCI moves',
      '/api/analyze': 'POST - Analyze game from PGN',
      '/api/analyze-position': 'POST - Analyze single position',
      '/api/bot-move': 'POST - Get best move for bot gameplay (Enhanced)',
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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Chess Analytics Server (FIXED VERSION) running on port ${PORT}`);
  console.log(`Health check: http://0.0.0.0:${PORT}/engine/api/health`);
  console.log(`Key improvements:`);
  console.log(`- Fixed score drop calculations with proper perspective`);
  console.log(`- Lichess-style win probability classification`);
  console.log(`- Robust queue-based engine management`);
  console.log(`- Enhanced player move evaluation`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  analysisService['stockfish'].destroy();
  process.exit(0);
});

export { app, GameAnalysisService, StockfishManager };