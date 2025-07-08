import express from 'express';
import { spawn } from 'child_process';

const app = express();
app.use(express.json());

function getBestMove(fen: string, depth: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const engine = spawn('stockfish');

    // Safety timeout in case engine hangs
    const timeout = setTimeout(() => {
      engine.kill();
      reject(new Error('Stockfish response timed out.'));
    }, 5000); // 5s timeout

    engine.stdin.write(`uci\n`);
    engine.stdin.write(`position fen ${fen}\n`);
    engine.stdin.write(`go depth ${depth}\n`);

    engine.stdout.on('data', (data: Buffer) => {
      const output = data.toString();
      const match = output.match(/bestmove\s(\S+)/);
      if (match && match[1]) {
        clearTimeout(timeout);
        resolve(match[1]);
        engine.kill(); // stop Stockfish after move is found
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

// @ts-ignore
app.post('/bestmove', async (req, res) => {
  const { fen, depth } = req.body;
  if (!fen || typeof fen !== 'string') {
    return res.status(400).json({ error: 'FEN must be a valid string.' });
  }

  try {
    const bestMove = await getBestMove(fen, depth);
    res.json({ bestMove });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get best move.' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`♟️ Chess engine API running on http://localhost:${PORT}`);
});
