import countDown from '@repo/store/src/atoms/countDown'
import {selector} from "recoil";

const countDownHook = selector({
    key: 'countDownHook',
    get: ({get}) => {
      const state = get(countDown);
  
      return state.localCount;
    },
  });

export default countDownHook;