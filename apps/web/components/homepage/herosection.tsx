import Image from "next/image";

export function HeroSection() {
  return (
    <div className="w-full flex flex-col justify-center items-center h-full px-4">
      {/* Heading */}
      <div className="flex flex-col justify-center items-center text-center">
        <h1 className="text-black font-extrabold text-4xl sm:text-6xl md:text-7xl lg:text-8xl">
          Where Chess Meets Video.
        </h1>
        <div className="text-black font-extrabold text-3xl sm:text-6xl md:text-7xl lg:text-8xl mt-2">
          Play Live. See Live.
        </div>
      </div>

      {/* Chess Images */}
      <div className="flex flex-wrap justify-center lg:flex-nowrap gap-3 text-black mt-16 items-end">
        <Image
          src="/images/pawn.svg"
          alt="Chessmasters"
          width={100}
          height={250}
          className="w-12 sm:w-16 md:w-20 lg:w-[100px] h-auto"
        />
        <Image
          src="/images/bishop.svg"
          alt="Chessmasters"
          width={120}
          height={250}
          className="w-14 sm:w-20 md:w-24 lg:w-[120px] h-auto"
        />
        <Image
          src="/images/knight.svg"
          alt="Chessmasters"
          width={120}
          height={250}
          className="w-14 sm:w-20 md:w-24 lg:w-[120px] h-auto"
        />
        <Image
          src="/images/rook1.svg"
          alt="Chessmasters"
          width={120}
          height={250}
          className="w-14 sm:w-20 md:w-24 lg:w-[120px] h-auto"
        />
        <Image
          src="/images/queen1.svg"
          alt="Chessmasters"
          width={130}
          height={250}
          className="w-16 sm:w-24 md:w-28 lg:w-[130px] h-auto"
        />
        <Image
          src="/images/king.svg"
          alt="Chessmasters"
          width={140}
          height={250}
          className="w-16 sm:w-24 md:w-28 lg:w-[140px] h-auto -ml-2 lg:-ml-4"
        />
      </div>

      {/* Subtext */}
      <div className="flex text-center justify-center mt-10 px-2">
        <h1 className="font-bold text-sm sm:text-lg md:text-xl">
          They've been waiting since the 6th century CE
        </h1>
      </div>
    </div>
  );
}
