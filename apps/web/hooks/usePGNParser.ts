"use client"
import { useSetRecoilState } from "recoil";
import { movesAtom, finalFENAtom } from "@/store/atoms/analysis"
import { Chess } from "chess.js";
import axios from "axios";

export function usePGNParser() {
  const setMoves = useSetRecoilState(movesAtom);
  const setFinalFEN = useSetRecoilState(finalFENAtom);


  async function getAnalysis(pgnAnalysis: string){
    try {
    const response = await axios.post('http://localhost:4000//api/analyze-moves', {
      pgn: pgnAnalysis, // sending as JSON body
    });

    console.log('Analysis result:', response.data);
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
      getAnalysis(pgnText);

    } catch (error) {
      console.log(error);
    }

    
    
  };

  return { parsePGN };
}
