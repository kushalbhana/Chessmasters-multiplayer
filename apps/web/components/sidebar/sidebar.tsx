import Image from "next/image";
import { ProfileSection } from "./profileSection";
export function Sidebar(){
    return(
        <div className="w-72 h-full bg-[#111114] absolute z-10 flex flex-col items-center">
            <div className="p-5 mt-28">
                <Image
                    src="/images/logo.png"
                    alt="My photo"
                    width={500}
                    height={300}
                />
            </div>
            <div className="w-full px-6 mt-4">
                <ProfileSection/>
            </div>
        </div>
    )
}