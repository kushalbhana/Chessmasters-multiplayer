// components/NextPrevUtility.tsx
import { FaArrowLeft, FaArrowRight, FaSyncAlt } from "react-icons/fa";
import { useRecoilState } from "recoil";
import { moveAnalyticsData } from "@/store/atoms/analysis";

export function NextPrevUtility() {
  const [analytics, setAnalytics] = useRecoilState(moveAnalyticsData);

  const handlePrev = () => {
    setAnalytics((prev) => ({
      ...prev,
      currentMoveIndex: Math.max(prev.currentMoveIndex - 1, 0),
    }));
  };

  const handleNext = () => {
    setAnalytics((prev) => ({
      ...prev,
      currentMoveIndex: prev.currentMoveIndex + 1,
    }));
  };


  return (
    <div className="h-24 flex items-center justify-center gap-6 bg-[#111114]/20">
      <span
        onClick={handlePrev}
        className="text-2xl cursor-pointer hover:text-blue-500 transition w-1/3 flex justify-center bg-[#111114]/80 p-4"
      >
        <FaArrowLeft />
      </span>
      <span
        onClick={handleNext}
        className="text-2xl cursor-pointer hover:text-blue-500 transition w-1/3 flex justify-center bg-[#111114]/80 p-4"
      >
        <FaArrowRight />
      </span>
      <span
        className="text-2xl cursor-pointer hover:text-green-500 transition w-1/3 flex justify-center bg-[#111114]/80 p-4"
      >
        <FaSyncAlt />
      </span>
    </div>
  );
}
