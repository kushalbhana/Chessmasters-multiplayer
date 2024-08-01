"use client"; // Add this at the top of your file if needed

import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { MdOutlineTimer } from "react-icons/md";
import { countDown } from '@repo/store/countDown';

// Define the props interface
interface CountdownProps {
  time: number;
  setTime: Dispatch<SetStateAction<number>>;
}

// Correctly typing the component with props
const Countdown: React.FC<CountdownProps> = ({ time, setTime }) => {
  // Effect to decrement the timer every second
  useEffect(() => {
    const timerId = setInterval(() => {
      setTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 2000);

    return () => clearInterval(timerId);
  }, [setTime]);

  // Function to format time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
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
