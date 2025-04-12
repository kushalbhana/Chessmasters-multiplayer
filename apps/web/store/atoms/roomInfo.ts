import { RedisRoom } from '@repo/lib/types';
import { atom } from 'recoil';

export const userAtom = atom<RedisRoom | null>({
  key: 'gameRoom',
  default: null,
});