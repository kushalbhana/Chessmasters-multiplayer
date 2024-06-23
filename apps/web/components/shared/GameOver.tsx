import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { FaCrown, FaHandshake } from "react-icons/fa";

interface GameOver {
  open: boolean;
  gameResult: string | null;
  onClose: () => void;
}

export default function GameOver({ open, onClose, gameResult }: GameOver) {

  if( gameResult === 'Winner'){
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogTitle>Checkmate!</DialogTitle>
          <div className="flex flex-col justify-center">
            <FaCrown className="text-8xl text-yellow-500 mx-auto" />
            <p className=" text-2xl mx-auto">Congratulations!!</p>
            <p className="mx-auto">You won the game with a checkmate!!</p>
          </div>
          <p className="mt-4 mx-auto text-center text-slate-400">The game has ended in checkmate, The result will be added to decide your rank</p>
        </DialogContent>
      </Dialog>
    );
  }

  if( gameResult === 'Lost'){
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogTitle>Checkmate!</DialogTitle>
          <div className="flex flex-col justify-center">
            <FaCrown className="text-8xl text-red-500 mx-auto" />
            <p className=" text-2xl mx-auto">Better luck next time!!</p>
            <p className="mx-auto">You lost the game with a checkmate!!</p>
          </div>
          <p className="mt-4 mx-auto text-center text-slate-400">The game has ended in checkmate, The result will be added to decide your rank</p>
        </DialogContent>
      </Dialog>
    );
  }

  if( gameResult === 'Draw'){
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogTitle>Draw!</DialogTitle>
          <div className="flex flex-col justify-center">
            <FaHandshake className="text-8xl text-yellow-500 mx-auto" />
            <p className=" text-2xl mx-auto">It's a Draw!!</p>
            <p className="mx-auto">The game has ended in Draw!!</p>
          </div>
          <p className="mt-4 mx-auto text-center text-slate-400">The game has ended in Draw, The result will be added to decide your rank</p>
        </DialogContent>
      </Dialog>
    );
  }

  if( gameResult === 'Draw'){
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogTitle>Stale!</DialogTitle>
          <div className="flex flex-col justify-center">
            <FaHandshake className="text-8xl text-yellow-500 mx-auto" />
            <p className=" text-2xl mx-auto">It's a Draw!!</p>
            <p className="mx-auto">The game has ended with Stalemate!!</p>
          </div>
          <p className="mt-4 mx-auto text-center text-slate-400">The game has ended in Draw, The result will be added to decide your rank</p>
        </DialogContent>
      </Dialog>
    );
  }
  
}
