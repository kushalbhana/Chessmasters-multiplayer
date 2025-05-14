"use client"
import { useRecoilState} from "recoil";

import { DropdownInGame } from "../ui/dropdown";
import { FaCamera, FaMicrophone } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { FaFlag } from "react-icons/fa";
import { GiPerspectiveDiceOne } from "react-icons/gi";
import { MdOutlineReportGmailerrorred } from "react-icons/md";
import { FaMicrophoneAltSlash } from "react-icons/fa";
import { micStatus, camStatus } from "@/store/atoms/videoutility";
import { BiSolidCameraOff } from "react-icons/bi";

export function UtilitySection() {
    const [micropohoneStatus, setMicropohoneStatus] = useRecoilState(micStatus);
  const [cameraStatus, setCameraStatus] = useRecoilState(camStatus);
    return (
        <div className="w-full h-full flex flex-col gap-2">
            <div className="pt-6 flex gap-4 flex-wrap justify-center items-center">
                <div className="hidden lg:block">
                    <DropdownInGame/>
                </div>
                <div className="flex justify-center items-center rounded-2xl hover:bg-red-700 hover:cursor-pointer" onClick={() => {setCameraStatus(!cameraStatus)}}>
                    {cameraStatus ? <FaCamera className="text-lg"/> : <BiSolidCameraOff className="text-lg"/>}
                </div>
                <div className="hidden lg:block">
                    <DropdownInGame/>
                </div>
                <div className="flex justify-center items-center rounded-2xl hover:bg-red-700 h-6 w-6 hover:cursor-pointer" onClick={() => {setMicropohoneStatus(!micropohoneStatus)}}>
                    {micropohoneStatus ? <FaMicrophone className="text-lg"/> : <FaMicrophoneAltSlash className="text-lg"/>}
                </div>
            </div>
            <div className=" flex pt-6 gap-2 flex-wrap justify-center items-center">
                <div>
                    <Button variant="secondary" className="w-28"> <FaFlag/> Resign</Button>
                </div>
                <div>
                    <Button variant="secondary" className="w-28"> <GiPerspectiveDiceOne/> Draw</Button>
                </div>
                <div>
                    <Button variant="secondary" className="w-28"><MdOutlineReportGmailerrorred/> Report</Button>
                </div>
            </div>
        </div>
    );
}