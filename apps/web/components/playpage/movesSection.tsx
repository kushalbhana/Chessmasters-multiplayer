import * as React from "react"
import { useRecoilValue } from "recoil"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { gameMoves } from "@/store/atoms/moves" // Adjust path as needed

export function MovesSection() {
  const moves = useRecoilValue(gameMoves) // array of SAN moves

  // Group moves as [moveNumber, whiteMove, blackMove]
  const formattedMoves = moves.reduce((acc, move, i) => {
    const moveIndex = Math.floor(i / 2)
    const isWhite = i % 2 === 0
    if (!acc[moveIndex]) acc[moveIndex] = { number: moveIndex + 1 }
    if (isWhite) acc[moveIndex].white = move
    else acc[moveIndex].black = move
    return acc
  }, [] as { number: number; white?: string; black?: string }[])

  return (
    <ScrollArea className="h-full w-48 lg:w-72 rounded-md border bg-[#111114]">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Moves</h4>
        {formattedMoves.map(({ number, white, black }) => (
          <React.Fragment key={number}>
            <div className="text-sm flex justify-between">
              <span className="font-semibold">{number}.</span>
              <span className="ml-2">{white || '-'}</span>
              <span className="ml-4">{black || '-'}</span>
            </div>
            <Separator className="my-2" />
          </React.Fragment>
        ))}
      </div>
    </ScrollArea>
  )
}
