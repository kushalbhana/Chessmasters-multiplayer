import { atom } from 'recoil';

export const userAtom = atom<String>({
  key: 'gameRoom',
  default: 'Home',
});