import React from 'react';
import { useCCTVStore } from '../store';
import CameraCard from '../components/CameraCard';
import { Bell, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CamerasPage() {
  const data = useCCTVStore(state => state.data);
  const error = useCCTVStore(state => state.error);
  const notifications = useCCTVStore(state => state.notifications);
  
  const cameraIds = Object.keys(data);

  return (
    <div className="max-w-[1800px] mx-auto pb-24 h-full flex flex-col">
      <div className="flex flex-col xl:flex-row gap-8 flex-1 min-h-0">
        
        {/* Left Side: Video Grid */}
        <div className="flex-1 min-w-0 flex flex-col h-full">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 flex items-center"
          >
            <div className="w-1.5 h-6 bg-blue-500 mr-3 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
            <h1 className="text-2xl font-black tracking-[0.2em] text-white uppercase text-shadow-sm">CAMERA GRID</h1>
          </motion.div>

          {cameraIds.length === 0 && !error ? (
            <div className="flex-1 flex flex-col items-center justify-center border border-white/5 bg-white/5 rounded-3xl backdrop-blur-md shadow-2xl">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-8 relative z-10"></div>
              </div>
              <div className="text-slate-400 font-bold tracking-widest uppercase">Initializing Telemetry Streams...</div>
            </div>
          ) : (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.2 }
                }
              }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto custom-scrollbar pb-10 pr-2"
            >
              {cameraIds.map(id => (
                <motion.div 
                  key={id}
                  variants={{
                    hidden: { opacity: 0, y: 50, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } }
                  }}
                >
                  <CameraCard 
                    id={id} 
                    url={id} 
                    events={data[id]?.events} 
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Right Side: Global Live Notifications */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:w-[450px] flex-shrink-0 flex flex-col h-full"
        >
          <div className="mb-6 flex items-center">
            <div className="w-1.5 h-6 bg-purple-500 mr-3 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)] animate-pulse"></div>
            <h1 className="text-2xl font-black tracking-[0.2em] text-white uppercase text-shadow-sm">LIVE EVENTS</h1>
          </div>
          
          <div className="relative flex-1 rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-[#0A101D]/60 backdrop-blur-2xl flex flex-col before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none">
            
            <div className="p-5 border-b border-white/5 flex justify-between items-center relative z-10">
              <h2 className="text-xs font-black text-slate-300 flex items-center tracking-widest uppercase">
                <Bell className="w-4 h-4 mr-2 text-purple-400 drop-shadow-[0_0_5px_rgba(168,85,247,0.8)] animate-bounce" />
                Global Event Stream
              </h2>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-md opacity-40 rounded-full"></div>
                <span className="relative bg-blue-500/20 border border-blue-500/50 text-blue-300 px-3 py-1 rounded-full text-[10px] font-black tracking-widest">
                  {notifications.length} CAPTURED
                </span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar relative z-10">
              {notifications.length === 0 ? (
                <div className="text-slate-500 text-sm font-bold text-center mt-10 uppercase tracking-widest">Monitoring for events...</div>
              ) : (
                notifications.map((notif, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={notif.id} 
                    className="relative group p-4 rounded-2xl border border-white/5 bg-black/40 hover:bg-white/5 transition-all duration-300"
                  >
                    {/* Glowing Accent Line */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${
                      notif.level === 'critical' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' :
                      notif.level === 'warning' ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]' :
                      'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]'
                    }`}></div>

                    <div className="flex justify-between items-start pl-2">
                      <div className="flex items-center space-x-3">
                        <div className="relative flex h-2 w-2">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            notif.level === 'critical' ? 'bg-red-500' :
                            notif.level === 'warning' ? 'bg-amber-400' :
                            'bg-emerald-400'
                          }`}></span>
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${
                            notif.level === 'critical' ? 'bg-red-500' :
                            notif.level === 'warning' ? 'bg-amber-400' :
                            'bg-emerald-500'
                          }`}></span>
                        </div>
                        <span className="text-xs font-black tracking-widest text-slate-300 uppercase">{notif.camera.split('/').pop() || notif.camera}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        {notif.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                      </span>
                    </div>
                    <div className="mt-2 pl-2">
                      <div className={`text-xs font-black tracking-widest uppercase mb-1 ${
                        notif.level === 'critical' ? 'text-red-400' :
                        notif.level === 'warning' ? 'text-amber-400' :
                        'text-emerald-400'
                      }`}>
                        {notif.type.replace(/_/g, ' ')}
                      </div>
                      <div className="text-sm text-white font-medium">{notif.message}</div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
