"use client"
import React, { useState, useEffect } from "react";
import { MdOutlineTimer } from "react-icons/md";

import { Dispatch, SetStateAction } from 'react';

interface TimerProps {
  time: number;
  setTime: Dispatch<SetStateAction<number>>;
  countType: string;
}


const Countdown: React.FC = () => {

  const [time, setTime] = useState(600);
  useEffect(() => {
    const timerId = setInterval(() => {
      setTime((prevTime: any) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${
      remainingSeconds < 10 ? "0" : ""
    }${remainingSeconds}`;
  };

  return (
    <div className="flex items-end justify-end h-10 p-1">
      <div className="bg-slate-200 p-1 h-full w-24 text-slate-900 rounded">
        <div className="flex items-center justify-between h-full w-full font-bold text-lg p-1">
          <MdOutlineTimer />
          {formatTime(time)}
        </div>
      </div>
    </div>
  );
};

export default Countdown;
