import { FaStopwatch } from "react-icons/fa";

export function TimeSection(){
    return(
        <div className="flex h-10 w-32">
            <div className="bg-orange-700 w-4/12 flex justify-center items-center"><FaStopwatch/></div>
            <div className="bg-slate-300 w-8/12 flex justify-center items-center text-black font-bold text-xl" >
                10:00
            </div>
        </div>

    )
}