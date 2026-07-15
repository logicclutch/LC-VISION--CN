import React from 'react';
import { NavLink } from 'react-router-dom';
import { Video, LayoutDashboard, Bell, FileText, Settings, Users, HelpCircle } from 'lucide-react';
import { useCCTVStore } from '../../store';
import { format } from 'date-fns';
import { cn } from './Sidebar';
import { motion } from 'framer-motion';

export default function TopNav() {
  const isConnected = useCCTVStore((state) => state.isConnected);

  const navItems = [
    { name: 'Live Cameras', path: '/cameras', icon: Video },
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Events', path: '/alerts', icon: Bell },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Help', path: '/help', icon: HelpCircle },
  ];

  return (
    <div className="flex flex-col border-b border-white/5 bg-[#0A101D]/70 backdrop-blur-2xl sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Header Bar */}
      <div className="h-16 px-8 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center space-x-4 group cursor-default">
            {/* Logic Clutch Icon */}
            <div className="w-12 h-12 rounded-2xl bg-[#EF4444] flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.4)] group-hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] transition-all duration-500 relative overflow-hidden border border-red-400">
                <div className="text-white font-serif font-black italic text-xl absolute transform -translate-x-2 -translate-y-1">L</div>
                <div className="text-white font-serif font-black italic text-xl absolute transform translate-x-1.5 translate-y-1.5">C</div>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-3xl font-black tracking-tight text-white mb-[-4px]">
                Logic Clutch
              </span>
              <span className="text-[10px] tracking-[0.2em] text-red-400 uppercase font-bold">Enterprise Analytics</span>
            </div>
        </div>
        
        <div className="flex items-center space-x-8 text-sm font-bold text-slate-300">
            <div className={`flex items-center space-x-3 bg-black/40 px-4 py-2 rounded-full border ${isConnected ? 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]'}`}>
                <div className="relative flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-red-500'}`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                </div>
                <span className={`tracking-widest uppercase text-xs ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>{isConnected ? 'System Online' : 'System Offline'}</span>
            </div>
            
            <div className="flex items-center space-x-3 bg-white/5 pl-2 pr-4 py-1.5 rounded-full border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-black shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                    AD
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-white">Admin User</span>
                  <span className="text-[9px] text-blue-400 uppercase tracking-widest">Superadmin</span>
                </div>
            </div>

            <div className="text-slate-200 font-mono text-lg font-black tracking-wider bg-black/40 px-4 py-1.5 rounded-xl border border-white/10 shadow-inner">
                {format(new Date(), 'HH:mm')}
                <span className="text-xs text-slate-500 ml-1">{format(new Date(), 'ss')}</span>
            </div>
        </div>
      </div>

      {/* Sub-Navigation */}
      <div className="px-8 flex items-center space-x-2 bg-black/20">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "relative flex items-center px-5 py-4 text-sm font-bold transition-all duration-300 group overflow-hidden",
                isActive 
                  ? "text-blue-400" 
                  : "text-slate-400 hover:text-white"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110", isActive ? "text-blue-400" : "text-slate-500")} />
                {item.name}
                
                {/* Active Indicator Line */}
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 rounded-t-full shadow-[0_-3px_10px_rgba(59,130,246,0.8)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                
                {/* Hover Background */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 rounded-t-lg"></div>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
