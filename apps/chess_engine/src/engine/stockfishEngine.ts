// stockfishEngine.ts
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

interface Job {
  fen: string;
  resolve: (move: string) => void;
  reject: (err: Error) => void;
}

class StockfishEngine {
  private static instance: StockfishEngine;
  private engine: ChildProcessWithoutNullStreams;
  private jobQueue: Job[] = [];
  private isReady = false;

  private constructor() {
    this.engine = spawn('stockfish');
    this.engine.stdout.setEncoding('utf-8');

    this.engine.stdout.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        if (line.startsWith('bestmove')) {
          const job = this.jobQueue.shift();
          if (job) {
            const bestMove = line.split(' ')[1];
            job.resolve(bestMove!);
          }
        }
      }
    });

    this.engine.stderr.on('data', (err) => {
      console.error('Stockfish stderr:', err.toString());
    });

    this.engine.on('exit', () => {
      console.error('Stockfish process exited unexpectedly');
    });

    // Initialize UCI
    this.engine.stdin.write('uci\n');
    setTimeout(() => {
      this.isReady = true;
    }, 500); // delay to ensure UCI is ready
  }

  public static getInstance(): StockfishEngine {
    if (!StockfishEngine.instance) {
      StockfishEngine.instance = new StockfishEngine();
    }
    return StockfishEngine.instance;
  }

  public async getBestMove(fen: string, depth: number = 15): Promise<string> {
    if (!this.isReady) {
      throw new Error('Engine not ready yet');
    }

    return new Promise((resolve, reject) => {
      this.jobQueue.push({ fen, resolve, reject });
      this.engine.stdin.write(`position fen ${fen}\n`);
      this.engine.stdin.write(`go depth ${depth}\n`);
    });
  }
}

export default StockfishEngine;
