import { FaEye } from "react-icons/fa";
import { IoPeopleSharp } from "react-icons/io5";
import { FaTrophy } from "react-icons/fa6";
import { IoCloudUploadSharp } from "react-icons/io5";
import { Button } from "../ui/button";
import Image from "next/image";

export function SpectateSection() {
  return (
    <div className="bg-white w-full">
      {/* Section Title */}
      <div className="w-full flex justify-center text-center px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl mt-10 font-bold text-black">
          Spectate Matches
        </h1>
      </div>

      {/* Content */}
      <div className="bg-white w-full h-full flex flex-col lg:flex-row items-center py-12 px-6 gap-12">
        
        {/* Image Section (hidden on small) */}
        <div className="hidden lg:flex w-1/2 justify-center">
          <Image
            src="/images/spectate-home.gif"
            width={500}
            height={500}
            alt="Spectate Matches"
            className="max-w-full h-auto"
          />
        </div>

        {/* Features Section */}
        <div className="text-black flex flex-col gap-8 w-full lg:w-1/2 text-center lg:text-left">
          
          {/* Feature 1 */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="bg-black text-stone-300 p-4 rounded-full">
              <FaEye className="text-xl" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">Live Spectating</h1>
              <p className="text-sm sm:text-base">
                Watch games unfold move by move in real-time
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="bg-black text-stone-300 p-4 rounded-full">
              <IoPeopleSharp className="text-xl" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">Join Thousands</h1>
              <p className="text-sm sm:text-base">
                Spectate alongside chess enthusiasts worldwide
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="bg-black text-stone-300 p-4 rounded-full">
              <FaTrophy className="text-xl" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">Tournament Coverage</h1>
              <p className="text-sm sm:text-base">
                Follow major tournaments and championship matches
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="bg-black text-stone-300 p-4 rounded-full">
              <IoCloudUploadSharp className="text-xl" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">Publish Your Games</h1>
              <p className="text-sm sm:text-base">
                Publish your live games for spectators to watch
              </p>
            </div>
          </div>

          {/* Button */}
          <div className="mt-4 w-full flex justify-center lg:justify-start">
            <Button className="bg-black text-white h-12 w-full sm:w-48 hover:bg-slate-900">
              Start Spectating
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
