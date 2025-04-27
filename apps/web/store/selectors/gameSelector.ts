import { selector } from "recoil";
import { fenState } from "../atoms/game";

export const fenSelector = selector<string>({
  key: 'fenSelector',
  get: ({ get }) => {
    return get(fenState);
  },
  set: ({ set }, newValue) => {
    if (typeof newValue === 'string') {
      set(fenState, newValue);
    }
  },
});

export const playerTurnState = selector({
    key: 'playerTurnState',
    get: ({ get }) => {
      const fen = get(fenState);
      return fen.split(' ')[1] === 'w' ? 'white' : 'black';
    },
  });