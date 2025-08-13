"use client"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"

export function AboutButtons(){
    const router =  useRouter();    
    return(
        <div className="mt-8 flex sm:flex-row justify-center lg:justify-start gap-4">
          <Button className="w-32 h-10" onClick={() => router.push('/play/online')}>Play Game</Button>
          <Button className="w-32 h-10" onClick={() => router.push('/spectate')}>Play with friend</Button>
        </div>
    )
}