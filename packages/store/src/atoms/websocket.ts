import { atom } from "recoil";

export const websocketConnection = atom<WebSocket | null>({
    key: "jwtAuthToken",
    default: null,
})