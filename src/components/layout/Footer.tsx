import React from 'react';
import { useCCTVStore } from '../../store';
import { Cpu, MemoryStick, Monitor, Video, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  const data = useCCTVStore((state) => state.data);
  const isConnected = useCCTVStore((state) => state.isConnected);
  
  const cameraIds = Object.keys(data);
  const totalCameras = cameraIds.length;
  const connectedCameras = totalCameras; 
  
  const avgCameraFps = totalCameras > 0 
    ? cameraIds.reduce((sum, id) => sum + (data[id]?.fps || 0), 0) / totalCameras 
    : 0;
    
  const aiFps = avgCameraFps / 2;

  return (
    <motion.footer 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 h-12 border border-white/10 bg-[#0A101D]/80 backdrop-blur-xl flex items-center px-8 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.8)] z-50 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase"
    >
      <div className="flex items-center space-x-6 divide-x divide-white/10">
        <div className="flex items-center space-x-2">
            <Video className="w-4 h-4 text-slate-500" />
            <span className="text-white">Cameras : <span className="text-blue-400">{totalCameras || 4}</span></span>
        </div>
        <div className="flex items-center space-x-3 pl-6">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]'}`}></div>
            <span className="text-white">Connected : <span className="text-emerald-400">{connectedCameras || 4}</span></span>
        </div>
        <div className="flex items-center space-x-2 pl-6">
            <Activity className="w-4 h-4 text-purple-500" />
            <span className="text-white">AI FPS : <span className="text-purple-400 drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]">{aiFps.toFixed(0) || 15}</span></span>
        </div>
        <div className="flex items-center space-x-2 pl-6">
            <Monitor className="w-4 h-4 text-blue-500" />
            <span className="text-white">Cam FPS : <span className="text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]">{avgCameraFps.toFixed(0) || 30}</span></span>
        </div>
        <div className="flex items-center space-x-2 pl-6">
            <Cpu className="w-4 h-4 text-slate-500" />
            <span className="text-white">CPU : <span className="text-amber-400">42%</span></span>
        </div>
        <div className="flex items-center space-x-2 pl-6">
            <MemoryStick className="w-4 h-4 text-slate-500" />
            <span className="text-white">RAM : <span className="text-emerald-400">5.1GB</span></span>
        </div>
        <div className="flex items-center space-x-2 pl-6">
            <Activity className="w-4 h-4 text-slate-500" />
            <span className="text-white">GPU : <span className="text-slate-400">0%</span></span>
        </div>
      </div>
    </motion.footer>
  );
}
