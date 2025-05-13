import { selector } from 'recoil';
import { gameMoves } from '../atoms/moves';

export const addMoveSelector = selector<void>({
  key: 'addMoveSelector',
  get: () => {}, // we don't use it for reading
  set: ({ get, set }, newValue) => {
    if (typeof newValue === 'string') {
      const current = get(gameMoves);
      set(gameMoves, [...current, newValue]);
    }
  },
});


export const allMovesSelector = selector<string[]>({
  key: 'allMovesSelector',
  get: ({ get }) => {
    return get(gameMoves);
  },
});
