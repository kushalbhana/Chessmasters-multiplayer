import {atom} from "recoil";

const countDown = atom<{localCount: any}>({
  key: 'countDown',
  default: {
    localCount: 600 
  }
});

export default countDown;