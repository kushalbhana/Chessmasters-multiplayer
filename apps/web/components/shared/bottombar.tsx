'use client';
import { useRouter, usePathname } from 'next/navigation';
import { FaHome, FaRandom, FaUserFriends } from "react-icons/fa";
import { BsRobot } from "react-icons/bs";
import { IoMdAnalytics } from "react-icons/io";

export function BottomBar() {
  const router = useRouter();
  const pathname = usePathname();

  const Tabs: Record<
    string,
    { icon: JSX.Element; path: string }
  > = {
    Home: { icon: <FaHome className="w-6 h-6" />, path: '/' },
    'Random': { icon: <FaRandom className="w-6 h-6" />, path: '/play/online' },
    'Friend': { icon: <FaUserFriends className="w-6 h-6" />, path: '/play/friend' },
    'Computer': { icon: <BsRobot className="w-6 h-6" />, path: '/play/computer' },
    'Review': { icon: <IoMdAnalytics className="w-6 h-6" />, path: '/analysis/game-review' },
  };

  const activeTab = Object.entries(Tabs).find(([label, { path }]) => {
    if (label === 'Review') return pathname.startsWith('/analysis/game-review');
    return pathname === path;
  })?.[0];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white flex justify-around items-center py-2 border-t border-gray-700 z-50 lg:hidden">
      {Object.entries(Tabs).map(([label, { icon, path }], index) => (
        <button
          key={index}
          onClick={() => router.push(path)}
          className={`flex flex-col items-center text-xs transition-all 
            ${activeTab === label ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
        >
          {icon}
          <span className="mt-1">{label}</span>
        </button>
      ))}
    </div>
  );
}
