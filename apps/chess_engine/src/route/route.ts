import express, { Request, Response } from 'express';
import StockfishEngine from '../engine/stockfishEngine';

const router = express.Router();

router.post('/get-move', async (req: any, res: any) => {
  const { fen } = req.body;

  if (!fen) {
    return res.status(400).json({ error: 'FEN is required' });
  }

  try {
    const engine = StockfishEngine.getInstance();
    const bestMove = await engine.getBestMove(fen);
    res.json({ bestMove });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get move from Stockfish' });
  }
});

export default router;
