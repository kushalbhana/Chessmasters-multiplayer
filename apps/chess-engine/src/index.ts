import express from 'express';
import { spawn } from 'child_process';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());

function evaluatePosition(fen: string, move: string, depth: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const engine = spawn('stockfish');
    let score: number | null = null;

    const timeout = setTimeout(() => {
      engine.kill();
      reject(new Error('Evaluation timeout'));
    }, 5000);

    engine.stdin.write('uci\n');
    engine.stdin.write(`position fen ${fen} moves ${move}\n`);
    engine.stdin.write(`go depth ${depth}\n`);

    engine.stdout.on('data', (data: Buffer) => {
      const output = data.toString();
      const match = output.match(/score cp (-?\d+)/);
      if (match) score = parseInt(match[1]!);

      if (/bestmove/.test(output)) {
        clearTimeout(timeout);
        engine.kill();
        resolve(score ?? 0);
      }
    });

    engine.stderr.on('data', (err) => {
      clearTimeout(timeout);
      reject(new Error(`Stockfish error: ${err.toString()}`));
    });

    engine.on('error', (err) => {
      clearTimeout(timeout);
      reject(new Error(`Failed to run Stockfish: ${err.message}`));
    });
  });
}

function getBestMove(fen: string, depth: number, skillLevel = 1): Promise<string> {
  return new Promise((resolve, reject) => {
    const engine = spawn('stockfish');

    const timeout = setTimeout(() => {
      engine.kill();
      reject(new Error('Best move timeout'));
    }, 5000);

    engine.stdin.write('uci\n');

    const onData = (data: Buffer) => {
      const output = data.toString();

      if (output.includes('uciok')) {
        engine.stdin.write(`setoption name Skill Level value ${skillLevel}\n`);
        engine.stdin.write(`ucinewgame\n`);
        engine.stdin.write(`position fen ${fen}\n`);
        engine.stdin.write(`go depth ${depth}\n`);
      }

      const match = output.match(/bestmove\s(\S+)/);
      if (match && match[1]) {
        clearTimeout(timeout);
        engine.kill();
        resolve(match[1]);
      }
    };

    engine.stdout.on('data', onData);

    engine.stderr.on('data', (err) => {
      clearTimeout(timeout);
      reject(new Error(`Stockfish error: ${err.toString()}`));
    });

    engine.on('error', (err) => {
      clearTimeout(timeout);
      reject(new Error(`Failed to run Stockfish: ${err.message}`));
    });
  });
}

function classifyMove(scoreLoss: number): string {
  if (scoreLoss <= 20) return "Best";
  if (scoreLoss <= 100) return "Good";
  if (scoreLoss <= 200) return "Inaccuracy";
  if (scoreLoss <= 400) return "Mistake";
  return "Blunder";
}

// @ts-ignore
app.post('/bestmove', async (req, res) => {
  const { fen, depth = 10, lastPlayerMove } = req.body;

  if (!fen || typeof fen !== 'string') {
    return res.status(400).json({ error: 'FEN must be a valid string.' });
  }

  try {
    const bestMove = await getBestMove(fen, depth);
    const bestMoveScore = await evaluatePosition(fen, bestMove, depth);

    let playerMoveScore: number | null = null;
    let moveLoss: number | null = null;
    let classification: string | null = null;

    if (lastPlayerMove) {
      playerMoveScore = await evaluatePosition(fen, lastPlayerMove, depth);
      moveLoss = bestMoveScore - playerMoveScore;
      classification = classifyMove(moveLoss);
    }

    return res.json({
      bestMove,
      evaluation: {
        bestMoveScore,
        lastPlayerMove: lastPlayerMove || null,
        lastPlayerScore: playerMoveScore,
        scoreLoss: moveLoss,
        classification,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get best move.' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`♟️ Chess engine API running on http://localhost:${PORT}`);
});
