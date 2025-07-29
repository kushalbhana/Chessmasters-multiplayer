'use client';

import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { FaHome, FaRandom, FaUserFriends, FaSignOutAlt } from "react-icons/fa";
import { BsRobot } from "react-icons/bs";
import { IoIosSettings } from "react-icons/io";
import { GiSpectacleLenses } from "react-icons/gi";
import { IoMdAnalytics } from "react-icons/io";

export function TabsSection() {
  const router = useRouter();
  const pathname = usePathname();

  const Tabs: Record<
    string,
    { icon: JSX.Element; path: string | (() => void) }
  > = {
    Home: { icon: <FaHome />, path: '/' },
    'Random Match': { icon: <FaRandom />, path: '/play/online' },
    'Vs friend': { icon: <FaUserFriends />, path: '/play/friend' },
    'Vs Computer': { icon: <BsRobot />, path: '/play/computer' },
    // 'Spectate Game': { icon: <GiSpectacleLenses />, path: '/spectate' },
    'Game Review': { icon: <IoMdAnalytics />, path: '/analysis/game-review' },
    Settings: { icon: <IoIosSettings />, path: '/settings' },
    'Sign Out': { icon: <FaSignOutAlt />, path: () => signOut() },
  };

  // Determine which tab should be active
  const activeTab = Object.entries(Tabs).find(([label, { path }]) => {
    if (typeof path !== 'string') return false;
    if (label === 'Game Review') {
      return pathname.startsWith('/analysis/game-review');
    }
    return pathname === path;
  })?.[0];

  return (
    <div className="flex flex-col gap-6 justify-center">
      {Object.entries(Tabs).map(([label, { icon, path }], index) => (
        <button
          key={index}
          onClick={() => {
            if (typeof path === 'function') {
              path();
            } else {
              router.push(path);
            }
          }}
          className={`flex items-center gap-3 text-lg px-4 py-2 rounded-lg transition-all
            ${activeTab === label ? 'bg-white text-black font-semibold' : 'text-white hover:bg-gray-700'}`}
        >
          {icon}
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
