import Image from "next/image";
import { Button } from "../ui/button";

export function HeroSection(){
    return(
        <div className="w-full flex flex-col justify-center items-center h-full">
            <div className="flex flex-col justify-center items-center">
                <div>
                    <h1 className="text-black text-8xl font-extrabold">
                        Where Chess Meets Video.
                    </h1>
                </div>
                <div className="text-black text-8xl font-extrabold"> 
                     Play Live. See Live.
                </div>
            </div>

            <div className="flex gap-3 text-black mt-20 items-end">
                <Image
                    src="/images/pawn.svg"
                    alt="Chessmasters"
                    width={100}
                    height={250}
                />
                <Image
                    src="/images/bishop.svg"
                    alt="Chessmasters"
                    width={120}
                    height={250}
                /><Image
                    src="/images/knight.svg"
                    alt="Chessmasters"
                    width={120}
                    height={250}
                />
                <Image
                    src="/images/rook1.svg"
                    alt="Chessmasters"
                    width={120}
                    height={250}
                />
                <Image
                    src="/images/queen1.svg"
                    alt="Chessmasters"
                    width={130}
                    height={250}
                /><Image
                    src="/images/king.svg"
                    alt="Chessmasters"
                    width={140}
                    height={250}
                    className="-ml-4"
                />
              
            </div>
            <div className="flex gap-6 text-black mt-10">
                <h1 className="font-bold text-lg">
                    They've been waiting since the 6th centeury CE
                </h1>
            </div>
            {/* <div className=" flex justify-center items-center gap-8 mt-6">
                <Button className="w-36" variant={"outline"}>Join match</Button>
                <Button className="w-36" variant={"outline"}>Spectate</Button>
            </div> */}
        </div>
    )
}