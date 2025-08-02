import { AboutGame } from "@/components/homepage/aboutSection";
import AnalyticsSection from "@/components/homepage/analytics";
import Footer from "@/components/homepage/Footer";
import { Header } from "@/components/homepage/header";
import { HeroSection } from "@/components/homepage/herosection";
import { SpectateSection } from "@/components/homepage/spectatesection";


export default function Home() {
  return (
    <div className="overflow-x-hidden"> {/* ✅ Prevents unwanted horizontal scroll */}
      <div className="w-full h-screen bg-white flex flex-col">
        <Header />
        <div className="h-full">
          <HeroSection />
        </div>
      </div>

      <div>
        <div className="h-full lg:px-32 lg:py-32">
          <AboutGame />
        </div>
        <div className="h-full w-full">
          <SpectateSection />
        </div>
        <div className="h-full">
          <AnalyticsSection />
        </div>
      </div>

      <Footer />
    </div>
  );
}

