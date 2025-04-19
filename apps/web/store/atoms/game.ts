import { atom } from "recoil";

export const fenState = atom({
    key: 'fenState',
    default: '', 
  });

export const playerTime = atom({
    key: 'playerTime',
    default: '', 
});
export const opponentTime = atom({
    key: 'opponentTime',
    default: '', 
  });