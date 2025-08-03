"use client";
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
    localStorage.removeItem("fen");
    localStorage.removeItem("moves");
    router.push("/");
    console.log("Done>>");
  };

  return (
    <div className="flex justify-center w-full mt-4">
      <div
        className="flex items-center justify-between gap-4 bg-[#111114]/20 rounded-lg 
                   w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-2 py-2"
      >
        {/* Previous Button */}
        <span
          onClick={handlePrev}
          className="text-lg sm:text-xl cursor-pointer hover:text-blue-500 transition 
                     w-12 sm:w-14 flex justify-center items-center bg-[#111114]/80 p-2 sm:p-3 rounded-md"
        >
          <FaArrowLeft />
        </span>

        {/* Resign Button */}
        <span
          onClick={handleResign}
          className="text-sm sm:text-base cursor-pointer hover:text-green-500 transition 
                     px-4 sm:px-6 py-2 sm:py-2.5 bg-[#111114]/80 rounded-md"
        >
          Resign
        </span>
      </div>
    </div>
  );
}
