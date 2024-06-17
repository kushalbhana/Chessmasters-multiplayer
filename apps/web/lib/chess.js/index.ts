
const highlightSquare = ( customSquareStyles: any, setCustomSquareStyles: any ,square: string) => {
    setCustomSquareStyles({
      ...customSquareStyles,
      [square]: { backgroundColor: '#FF6347' }, // Change to tomato
    });
  };