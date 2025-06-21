import Image from "next/image"
import { Button } from "../ui/button"
export function AboutGame(){
    return(
        <div className="w-full h-full flex justify-between items-center">
            <div className="w-1/2">
                <div>
                    <h1 className="text-6xl font-extrabold">
                        Live Low Latency Video calling
                    </h1>
                    <h1 className="text-lg mt-2">
                        Experience chess like never before with our built-in live video calling, 
                        powered by low-latency WebRTC technology. Now, every match goes beyond just moving pieces on a board — 
                        you can see and interact with your opponent in real time. The seamless, high-quality video makes each game more personal, 
                        social, and immersive. Whether you're challenging friends or facing off against players around the world, our interactive 
                        chess platform brings strategy and connection together like never before. Play, chat, and outsmart your rival — all in one place!
                    </h1>
                </div>

                <div className="mt-8 flex gap-4">
                    <Button className="w-32 h-10">Play Game</Button>
                    <Button className="w-32 h-10">Spectate Game</Button>
                </div>
            </div>
            <div>
                <Image src={"/images/video-call-home.svg"}
                width={600} height={600} alt="Alt Image"/>
            </div>
        </div>
    )
}