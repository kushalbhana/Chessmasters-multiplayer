import { selector } from "recoil";
import { fenState } from "../atoms/game";

export const playerTurnState = selector({
    key: 'playerTurnState',
    get: ({ get }) => {
      const fen = get(fenState);
      return fen.split(' ')[1] === 'w' ? 'white' : 'black';
    },
  });