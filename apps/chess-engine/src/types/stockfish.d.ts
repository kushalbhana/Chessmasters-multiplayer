declare module 'stockfish' {
  const stockfish: () => {
    postMessage: (msg: string) => void;
    onmessage: ((event: { data: string }) => void) | null;
  };
  export default stockfish;
}
