"use client"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"

export function HeroButtons(){
    const router = useRouter();

    return(
        <div className="w-full flex gap-4 justify-center items-center">
        <div>
            <Button
              variant="outline"
              className="bg-white text-black h-10 w-32"
              onClick={() => router.push("/play/online")}
            >
              Play now
            </Button>
          
        </div>
        <div>
          <Button
              variant="outline"
              className="bg-black text-white h-10 w-32" 
              onClick={() => router.push("/analysis/game-review")}
            >
            Review Game
            </Button>
        </div>
      </div>
    )
}