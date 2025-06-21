import { FaEye } from "react-icons/fa";
import { IoPeopleSharp } from "react-icons/io5";
import { FaTrophy } from "react-icons/fa6";
import { IoCloudUploadSharp } from "react-icons/io5";
import { Button } from "../ui/button";
import Image from "next/image";

export function SpectateSection(){
    return(
        <div className="bg-white w-full">
            <div className="w-full flex justify-center">
                <h1 className="text-5xl mt-10 font-bold text-black">Spactate Matches</h1>
            </div>
            <div className="bg-white w-full h-full flex items-center py-12">
                <div className=" w-1/2 ml-16">
                    <Image src={"/images/spectate-home.gif"}
                    width={500} height={500} alt="Alt Image" className="ml-36"/>
                </div>
                <div className="text-black flex flex-col gap-8">
                    <div className="flex gap-4 items-center">
                        <div className=" bg-black text-stone-300 p-4 rounded-full">
                            <FaEye className="text-xl"/>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">
                                Live Spectating
                            </h1>
                            <h1>
                                Watch games unfold move by move in real-time

                            </h1>
                        </div>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className=" bg-black text-stone-300 p-4 rounded-full">
                            <IoPeopleSharp className="text-xl" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">
                                Join Thousands

                            </h1>
                            <h1>
                                Spectate alongside chess enthusiasts worldwide
                            </h1>
                        </div>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className=" bg-black text-stone-300 p-4 rounded-full">
                            <FaTrophy className="text-xl"/>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">
                                Tournament Coverage
                            </h1>
                            <h1>
                                Follow major tournaments and championship matches
                            </h1>
                        </div>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className=" bg-black text-stone-300 p-4 rounded-full">
                            <IoCloudUploadSharp className="text-xl" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">
                                Publish Your Games
                            </h1>
                            <h1>
                                Publish Your Live Games For Live Spectators
                            </h1>
                        </div>
                    </div>
                    <div className="mt-4 w-full">
                        <Button className="bg-black text-white h-12 w-full">Start Spectating</Button>
                    </div>
                </div>

            </div>
        </div>
    )
}