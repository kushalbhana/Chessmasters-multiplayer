import Image from "next/image";
import { ProfileSection } from "./profileSection";
import { TabsSection } from "./TabsSection";
export function Sidebar(){
    return(
        <div className="w-72 h-full bg-[#111114] absolute z-10 flex flex-col items-center">
            <div className="p-5 mt-20">
                <Image
                    src="/images/logo.png"
                    alt="Chessmasters"
                    width={500}
                    height={300}
                />
            </div>
            <div className="w-full px-6 mt-4">
                <ProfileSection/>
            </div>
            <div className="w-full px-6 mt-4">
                <TabsSection/>
            </div>
        </div>
    )
}