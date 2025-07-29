"use client"
import { useSetRecoilState } from "recoil";
import { Chess } from "chess.js";
import axios from "axios";
import { useRouter } from "next/navigation";

import { movesAtom, finalFENAtom, moveAnalyticsData } from "@/store/atoms/analysis"

export function usePGNParser() {
  const setMoves = useSetRecoilState(movesAtom);
  const setFinalFEN = useSetRecoilState(finalFENAtom);
  const setDataRecieved = useSetRecoilState(moveAnalyticsData)
  const setFen = useSetRecoilState(finalFENAtom);
    const router = useRouter();

  async function getAnalysis(fen: string, moves: string[]){
    try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_CHESS_ENGINE}api/analyze-moves`, {
      "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "moves": moves,
      "gameInfo": {
        "white": "Player 1",
        "black": "Player 2",
        "result": "*"
      }
    });

    setFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    setDataRecieved({
      data: response.data.analysis,
      currentMoveIndex: -1,
    });
    router.push("/analysis/game-review/game");

  } catch (error) {
    console.error('Error analyzing PGN:', error|| error);
  }
  }
  const parsePGN = (pgnText: string) => {
    try {
      const chess = new Chess();
      chess.loadPgn(pgnText); 

      const history = chess.history(); 
      const fen = chess.fen();         

      setMoves(history);
      setFinalFEN(fen);
      getAnalysis(fen, history);

    } catch (error) {
      console.log(error);
    }
  };

  return { parsePGN };
}
