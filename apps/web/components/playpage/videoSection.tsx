export function VideoSection() {
    return (
        <div className="bg-slate-500 bg-opacity-20">
            <div className="w-full h-full flex shadow-xl">
                <div className="w-1/2 p-2 shadow-xl">
                    <video 
                        src="" 
                        className="bg-black w-full h-auto"
                        
                    />
                    <div className="h-8 flex justify-center items-center">
                        Opponent
                    </div>
                </div>
                <div className="w-1/2 p-2">
                    <video 
                        src="" 
                        className="bg-black w-full h-auto"
                    />
                    <div className="h-8 flex justify-center items-center">
                        You!!
                    </div>
                </div>
            </div>
            
        </div>
    );
}
