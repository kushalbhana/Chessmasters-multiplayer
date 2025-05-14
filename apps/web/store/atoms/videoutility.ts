import { atom } from 'recoil';

export const camStatus = atom<boolean>({
  key: 'camStatus',
  default: true,
});

export const micStatus = atom<boolean>({
  key: 'micStatus',
  default: true,
});

export const micInUse = atom<number>({
  key: 'micInUse',
  default: 0,
});
export const camInUse = atom<number>({
  key: 'camInUse',
  default: 0,
});

