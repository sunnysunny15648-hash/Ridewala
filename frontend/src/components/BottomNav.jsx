import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Clock, User } from 'lucide-react';

export default function BottomNav({ active }) {
  const navigate = useNavigate();
  const tabs = [
    { id: 'home', label: 'Home', icon: <Home size={20} />, path: '/' },
    { id: 'rides', label: 'Rides', icon: <Clock size={20} />, path: '/history' },
    { id: 'profile', label: 'Profile', icon: <User size={20} />, path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 shadow-lg z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center gap-0.5 px-5 py-1 rounded-xl transition-all ${
              active === tab.id ? 'text-secondary' : 'text-gray-400'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${active === tab.id ? 'bg-primary' : ''}`}>
              {tab.icon}
            </div>
            <span className="text-[10px] font-semibold">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

