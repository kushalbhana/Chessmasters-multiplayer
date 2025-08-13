import Image from "next/image";
import { Button } from "../ui/button";
import { AboutButtons } from "./about-buttons";

export function AboutGame() {
  return (
    <div className="w-full h-full flex flex-col lg:flex-row justify-between items-center gap-10 px-6 py-12 lg:py-20">
      
      {/* Text Section */}
      <div className="w-full lg:w-1/2 text-center lg:text-left">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold">
          Live Low Latency Video Calling
        </h1>
        <h1 className="text-sm sm:text-base md:text-lg mt-4 text-gray-400">
          Experience chess like never before with our built-in live video calling, 
          powered by low-latency WebRTC technology. Now, every match goes beyond 
          just moving pieces on a board — you can see and interact with your 
          opponent in real time. The seamless, high-quality video makes each game 
          more personal, social, and immersive. Whether you're challenging friends 
          or facing off against players around the world, our interactive chess 
          platform brings strategy and connection together like never before. 
          Play, chat, and outsmart your rival — all in one place!
        </h1>

        {/* Buttons */}
        <AboutButtons/>
      </div>

      {/* Image Section - Hidden on screens smaller than lg */}
      <div className="hidden lg:block">
        <Image
          src="/images/video-call-home.svg"
          width={600}
          height={600}
          alt="Video Call Illustration"
          className="max-w-full h-auto"
        />
      </div>
    </div>
  );
}
