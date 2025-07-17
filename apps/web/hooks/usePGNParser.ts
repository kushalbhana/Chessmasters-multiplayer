"use client"
import { useSetRecoilState } from "recoil";
import { movesAtom, finalFENAtom } from "@/store/atoms/analysis"
import { Chess } from "chess.js";

export function usePGNParser() {
  const setMoves = useSetRecoilState(movesAtom);
  const setFinalFEN = useSetRecoilState(finalFENAtom);

  const parsePGN = (pgnText: string) => {
    try {
      const chess = new Chess();
      chess.loadPgn(pgnText); 

      const history = chess.history(); 
      const fen = chess.fen();         

      setMoves(history);
      setFinalFEN(fen);
      console.log(history);
      console.log(fen);

    } catch (error) {
      console.log(error);
    }
    
  };

  return { parsePGN };
}
