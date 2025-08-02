import Image from "next/image";
import { HeroButtons } from "./hero-buttons";

export function HeroSection() {
  return (
    <div className="w-full flex flex-col justify-center items-center h-full px-4 overflow-hidden">
      {/* Heading */}
      <div className="flex flex-col justify-center items-center text-center -mt-20 whitespace-nowrap">
        <h1 className="text-black font-extrabold text-[clamp(1.5rem,6vw,5rem)]">
          Where Chess Meets Video.
        </h1>
        <div className="text-black font-extrabold text-[clamp(1.5rem,6vw,5rem)] lg:mt-2">
          Play Live. See Live.
        </div>
      </div>

      {/* Chess Images */}
      <div className="flex justify-center items-end gap-2 sm:gap-3 text-black mt-16 overflow-hidden whitespace-nowrap">
        <Image
          src="/images/pawn.svg"
          alt="Chessmasters"
          width={100}
          height={250}
          className="w-[clamp(2rem,8vw,100px)] h-auto shrink-0"
        />
        <Image
          src="/images/bishop.svg"
          alt="Chessmasters"
          width={120}
          height={250}
          className="w-[clamp(2.5rem,9vw,120px)] h-auto shrink-0"
        />
        <Image
          src="/images/knight.svg"
          alt="Chessmasters"
          width={120}
          height={250}
          className="w-[clamp(2.5rem,9vw,120px)] h-auto shrink-0"
        />
        <Image
          src="/images/rook1.svg"
          alt="Chessmasters"
          width={120}
          height={250}
          className="w-[clamp(2.5rem,9vw,120px)] h-auto shrink-0"
        />
        <Image
          src="/images/queen1.svg"
          alt="Chessmasters"
          width={130}
          height={250}
          className="w-[clamp(3rem,10vw,130px)] h-auto shrink-0"
        />
        <Image
          src="/images/king.svg"
          alt="Chessmasters"
          width={140}
          height={250}
          className="w-[clamp(3rem,10vw,140px)] h-auto shrink-0 -ml-1 lg:-ml-4"
        />
      </div>

      <div className="flex text-center justify-center mt-10 px-2 text-black whitespace-nowrap">
        <h1 className="font-bold text-[clamp(0.75rem,3vw,1.25rem)]">
          They've been waiting since the 6th century CE
        </h1>
      </div>

      <div className="w-full mt-4 flex lg:hidden">
        <HeroButtons />
      </div>
    </div>
  );
}
