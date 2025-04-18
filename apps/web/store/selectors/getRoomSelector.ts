import { selector } from 'recoil';
import { userAtom } from '../atoms/roomInfo';
import { clientSideRoom, RedisRoom } from '@repo/lib/types';

export const roomInfo = selector({
  key: 'roomInfo',
  get: ({ get }) => {
    return get(userAtom);
  },
  set: ({ set }, newValue) => {
    set(userAtom, newValue as clientSideRoom | null);
  },
});
