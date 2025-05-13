import { atom } from 'recoil';

export const gameMoves = atom<string[]>({
  key: 'gameMoves',
  default: [],
});
