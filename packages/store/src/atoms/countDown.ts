import {atom} from "recoil";

export const countDown = atom<{isLoading: boolean, localCount: any, remoteCount: any}>({
  key: 'countDown',
  default: {
    isLoading: true,
    localCount: 600,
    remoteCount: 600
  },
});