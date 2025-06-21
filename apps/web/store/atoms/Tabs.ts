import { atom } from 'recoil';

export const ActiveTab = atom<string>({
  key: 'ActiveTab',
  default: 'Home',
  effects: [
    ({ setSelf, onSet }) => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('activeTab');
        if (saved) setSelf(saved);
      }

      onSet((newTab) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('activeTab', newTab);
        }
      });
    },
  ],
});
