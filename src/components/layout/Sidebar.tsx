import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, UserCheck, Flame, AlertTriangle, 
  Car, Shield, Camera, LayoutDashboard, Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { name: 'People Analytics', path: '/analytics/people', icon: Users, color: 'text-blue-400', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]', bg: 'bg-blue-500/10 border-blue-500/30' },
  { name: 'Spatial Intrusion', path: '/analytics/spatial', icon: AlertTriangle, color: 'text-orange-400', glow: 'shadow-[0_0_15px_rgba(251,146,60,0.3)]', bg: 'bg-orange-500/10 border-orange-500/30' },
  { name: 'Queue Management', path: '/analytics/queue', icon: Users, color: 'text-purple-400', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.3)]', bg: 'bg-purple-500/10 border-purple-500/30' },
  { name: 'Identity & Access', path: '/analytics/identity', icon: UserCheck, color: 'text-emerald-400', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  { name: 'Smart Parking', path: '/analytics/parking', icon: Car, color: 'text-indigo-400', glow: 'shadow-[0_0_15px_rgba(99,102,241,0.3)]', bg: 'bg-indigo-500/10 border-indigo-500/30' },
  { name: 'Camera Health', path: '/analytics/health', icon: Camera, color: 'text-teal-400', glow: 'shadow-[0_0_15px_rgba(20,184,166,0.3)]', bg: 'bg-teal-500/10 border-teal-500/30' },
  { name: 'Safety Alerts', path: '/analytics/safety', icon: Flame, color: 'text-red-400', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]', bg: 'bg-red-500/10 border-red-500/30' },
];

export default function Sidebar() {
  return (
    <motion.aside 
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-72 bg-[#0A101D]/60 backdrop-blur-3xl border-r border-white/[0.05] flex flex-col h-full shadow-[20px_0_50px_rgba(0,0,0,0.3)] z-20 relative"
    >
      <div className="p-6">
        <h2 className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase mb-4 pl-2">
          AI Features
        </h2>
        
        <nav className="space-y-3">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative flex items-center px-4 py-3 rounded-2xl transition-all duration-300 group overflow-hidden border ${
                  isActive 
                    ? `${item.bg} ${item.glow}` 
                    : 'bg-white/[0.02] border-transparent hover:bg-white/[0.05] hover:border-white/10'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-2 rounded-xl mr-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? `bg-black/40 shadow-inner` : 'bg-black/20'}`}>
                    <item.icon className={`w-5 h-5 ${isActive ? item.color : 'text-slate-400 group-hover:text-white transition-colors'}`} />
                  </div>
                  <span className={`text-sm font-bold tracking-wide transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {item.name}
                  </span>
                  
                  {/* Glowing active indicator dot */}
                  {isActive && (
                    <motion.div 
                      layoutId="sidebarActiveDot"
                      className={`absolute right-4 w-2 h-2 rounded-full bg-current ${item.color} ${item.glow}`}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-white/[0.05]">
        <div className="bg-gradient-to-tr from-blue-900/40 to-purple-900/40 p-4 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden group cursor-pointer">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mr-3 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] text-blue-300 uppercase tracking-widest font-black">System Status</p>
              <p className="text-sm text-white font-bold tracking-wider">Secure</p>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
