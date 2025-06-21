import { Header } from "@/components/homepage/header";
import { HeroSection } from "@/components/homepage/herosection";
import PieceDetails from "@/components/homepage/pieceDetailSection";


export default function Home() {

  return (
    <div>
      <div className="w-full h-[90vh] bg-white flex flex-col">
        <div>
          <Header/>
        </div>
        <div className="h-full">
          <HeroSection/>
        </div>
      </div>

      <div>
        <div className="h-full">
          <PieceDetails/>
        </div>
      </div>

    </div>
  );
  
}
