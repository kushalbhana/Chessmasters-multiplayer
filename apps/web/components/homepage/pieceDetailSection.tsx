const PieceDetails = () => {
  const pieces = [
    {
      name: "THE KING",
      symbol: "♚",
      description: "In chess, the king is the most important piece. The object of the game is to trap the opponent's king so that its escape is not possible (checkmate). If a player's king is threatened with capture, it is said to be in check, and the player must remove the threat of capture on the next move.",
      dimensions: "W: 3.2cm   D: 3.2cm   H: 6.2cm"
    },
    {
      name: "THE QUEEN",
      symbol: "♛",
      description: "The queen is the most powerful piece in the game of chess, able to move any number of squares vertically, horizontally or diagonally. Each player starts the game with one queen, placed in the middle of the first rank next to the king.",
      dimensions: "W: 2.9cm   D: 2.9cm   H: 5.8cm"
    },
    {
      name: "THE BISHOP",
      symbol: "♝",
      description: "A bishop is a piece in the board game of chess. Each player begins the game with two bishops. One starts between the king's knight and the king, the other between the queen's knight and the queen.",
      dimensions: "W: 2.4cm   D: 2.4cm   H: 5.2cm"
    },
    {
      name: "THE KNIGHT",
      symbol: "♞",
      description: "The knight is a piece in the game of chess, representing a knight (armored cavalry). It is normally represented by a horse's head and neck. Each player starts with two knights, which begin on the row closest to the player.",
      dimensions: "W: 2.5cm   D: 2.5cm   H: 4.4cm"
    },
    {
      name: "THE ROOK",
      symbol: "♜",
      description: "A rook is a piece in the strategy board game of chess. Formerly the piece was called the tower, marquess, rector, and comes. Each player starts the game with two rooks, one on each of the corner squares on their side of the board.",
      dimensions: "W: 2.6cm   D: 2.6cm   H: 4.1cm"
    },
    {
      name: "THE PAWN",
      symbol: "♟",
      description: "The pawn is the most numerous piece in the game of chess, and in most circumstances, also the weakest. It historically represents infantry, or more particularly, armed peasants or pikemen.",
      dimensions: "W: 2.1cm   D: 2.1cm   H: 3.5cm"
    }
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pieces.map((piece, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-8 text-center group hover:bg-gray-750 transition-colors duration-300">
              <div className="text-8xl mb-6 text-gray-300 group-hover:text-white transition-colors duration-300">
                {piece.symbol}
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4 tracking-wider">
                {piece.name}
              </h3>
              
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {piece.description}
              </p>
              
              <div className="border-t border-gray-700 pt-4">
                <p className="text-red-500 font-semibold text-xs tracking-wider">
                  DIMENSIONS
                </p>
                <p className="text-gray-300 text-sm mt-1">
                  {piece.dimensions}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PieceDetails;