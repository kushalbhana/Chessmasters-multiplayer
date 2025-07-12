"use client"
import { Button } from "../ui/button"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation";

export function PlayButton(){
    const [selectedColor, setSelectedColor] = useState("white");
    const router = useRouter();

    return(
        <div>
            <Button className="w-full" onClick={() => router.push('/play/computer')}>
                Play the game
            </Button>  
            <div className="flex gap-4 mt-6 w-full justify-center">
                <span 
                    onClick={() =>{
                        setSelectedColor("white");
                        localStorage.setItem('color', 'white')
                    }}
                    className={`w-8 h-8 rounded-full border cursor-pointer ${
                    selectedColor === "white" ? "ring-2 ring-blue-500" : ""
                    }`}
                    style={{ backgroundColor: "white", borderColor: "black" }}
                    />
                <span 
                    onClick={() =>{
                        setSelectedColor("black");
                        localStorage.setItem('color', 'black')
                    }}
                    className={`w-8 h-8 rounded-full border cursor-pointer ${
                        selectedColor === "black" ? "ring-2 ring-blue-500" : "ring-2 ring-white"
                    }`}
                    style={{ backgroundColor: "black" }}
                    />       
            </div>
        </div>
    )
}