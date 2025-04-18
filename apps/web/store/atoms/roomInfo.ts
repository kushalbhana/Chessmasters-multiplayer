import { clientSideRoom } from '@repo/lib/types';
import { atom } from 'recoil';

export const userAtom = atom<clientSideRoom | null>({
  key: 'gameRoom',
  default: null,
});