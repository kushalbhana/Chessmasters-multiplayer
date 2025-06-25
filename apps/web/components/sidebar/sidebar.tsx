import Image from "next/image";
import { ProfileSection } from "./profileSection";
import { TabsSection } from "./TabsSection";

export function Sidebar() {
  return (
    <div className="w-64 h-screen bg-[#151516] fixed top-0 left-0 z-10 flex flex-col items-center">
      <div className="p-5 mt-2">
        <Image
          src="/images/logo.png"
          alt="Chessmasters"
          width={500}
          height={300}
        />
      </div>
      <div className="w-full px-6 mt-10">
        <TabsSection />
      </div>
      <div className="h-full flex items-end">
        <div className="w-full px-6 mt-4 h-24">
          <ProfileSection />
        </div>
      </div>
    </div>
  );
}
