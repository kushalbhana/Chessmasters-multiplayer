import { atom } from 'recoil';

export const ActiveTab = atom<string>({
  key: 'ativeTab',
  default: 'Home',
});