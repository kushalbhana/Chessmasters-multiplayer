import { atom } from 'recoil';

export const camStatus = atom<boolean>({
  key: 'camStatus',
  default: typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('cameraStatus') ?? 'true')
    : true,
});

export const micStatus = atom<boolean>({
  key: 'micStatus',
  default: typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('microphoneStatus') ?? 'true')
    : true,
});


export const micInUse = atom<number>({
  key: 'micInUse',
  default: 0,
});
export const camInUse = atom<number>({
  key: 'camInUse',
  default: 0,
});

