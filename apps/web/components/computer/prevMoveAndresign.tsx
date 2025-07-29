"use client"
import { FaArrowLeft } from "react-icons/fa";
import { useRecoilState } from "recoil";
import { prevMove } from "@/store/atoms/bot";
import { useRouter } from "next/navigation";

export function PrevUtility() {
  const [, setPrev] = useRecoilState(prevMove);
  const router = useRouter();

  const handlePrev = () => {
    setPrev((prev) => prev - 1);
  };

  const handleResign = () => {
    localStorage.removeItem("fen")
    localStorage.removeItem("moves");
    router.push('/');
    console.log('Done>>')
  }

  return (
    <div className="h-24 flex items-center justify-between gap-6 bg-[#111114]/20">
      <span
        onClick={handlePrev}
        className="text-2xl cursor-pointer hover:text-blue-500 transition w-1/3 flex justify-center bg-[#111114]/80 p-4"
      >
        <FaArrowLeft />
      </span>
      {/* <span
        onClick={handleNext}
        className="text-2xl cursor-pointer hover:text-blue-500 transition w-1/3 flex justify-center bg-[#111114]/80 p-4"
      >
        <FaArrowRight />
      </span> */}
      <span
        className="text-2xl cursor-pointer hover:text-green-500 transition w-1/3 flex justify-center bg-[#111114]/80 p-4"
        onClick={handleResign}
      >
        Resign
      </span>
    </div>
  );
}
