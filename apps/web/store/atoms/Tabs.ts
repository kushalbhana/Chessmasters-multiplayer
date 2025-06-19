import { atom } from 'recoil';

export const ActiveTab = atom<string>({
  key: 'activeTab',
  default: 'Home',
});