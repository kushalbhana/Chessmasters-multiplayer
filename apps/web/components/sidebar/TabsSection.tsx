'use client';

import { useRecoilState } from 'recoil';
import { ActiveTab } from '@/store/atoms/Tabs';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { FaHome, FaRandom, FaUserFriends, FaSignOutAlt } from "react-icons/fa";
import { BsRobot } from "react-icons/bs";
import { IoIosSettings } from "react-icons/io";
import { GiSpectacleLenses } from "react-icons/gi";

export function TabsSection() {
  const [activeTab, setActiveTab] = useRecoilState(ActiveTab);
  const router = useRouter();

  const Tabs = {
    Home: { icon: <FaHome />, path: '/' },
    'Random Match': { icon: <FaRandom />, path: '/play/online' },
    'Vs friend': { icon: <FaUserFriends />, path: '/play/friend' },
    'Vs Computer': { icon: <BsRobot />, path: '/play/computer' },
    'Spectate': { icon: <GiSpectacleLenses />, path: '/play/spectate' },
    'Settings': { icon: <IoIosSettings />, path: '/settings' },
    'Sign Out': { icon: <FaSignOutAlt />, path: () => signOut() },
  };

  return (
    <div className="flex flex-col gap-6 justify-center">
      {Object.entries(Tabs).map(([label, { icon, path }], index) => (
        <button
          key={index}
          onClick={() => {
            setActiveTab(label);
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
