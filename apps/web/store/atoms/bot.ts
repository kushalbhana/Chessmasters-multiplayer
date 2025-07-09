import { atom } from "recoil";

export const fenState = atom({
    key: 'fenState',
    default: '', 
  });

export const color = atom({
    key: 'color',
    default: 'white'
})