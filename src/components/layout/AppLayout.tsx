import React from 'react';
import TopNav from './TopNav';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { useCCTVStore } from '../../store';
import { Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const error = useCCTVStore((state) => state.error);

  return (
    <div className="flex flex-col h-screen bg-[#050B14] overflow-hidden text-slate-200 relative selection:bg-blue-500/30">
      {/* 3D Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-900/10 blur-[150px] rounded-full mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-emerald-900/10 blur-[100px] rounded-full mix-blend-screen animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="z-10 flex flex-col h-full w-full">
        <TopNav />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto relative custom-scrollbar p-6">
              <AnimatePresence>
              {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -50, rotateX: 90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, y: -50, rotateX: -90 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500/80 backdrop-blur-xl border border-red-400 text-white px-8 py-3 flex items-center justify-center rounded-2xl shadow-[0_10px_40px_rgba(239,68,68,0.4)] text-sm font-black tracking-wider uppercase"
                    style={{ transformPerspective: 1000 }}
                  >
                    <Activity className="w-5 h-5 mr-3 animate-ping" />
                    API Connection Error: {error}
                  </motion.div>
              )}
            </AnimatePresence>
            {children}
          </main>
        </div>
        <Footer />
      </div>
    </div>
  );
}
