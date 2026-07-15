import React from 'react';
import { Camera, AlertCircle, Users, Clock, UserCheck, UserX, Car, AlertTriangle, Flame, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface CameraCardProps {
  id: string;
  url: string;
  events: any;
}

const CameraCard: React.FC<CameraCardProps> = ({ id, url, events }) => {
  const videoFeedUrl = `http://localhost:8000/video?camera_id=${encodeURIComponent(id)}`;

  return (
    <div className="relative group perspective-1000">
      {/* Glow Effect behind card */}
      <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
      
      <motion.div 
        whileHover={{ scale: 1.02, rotateX: 2, rotateY: 2 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-[#0A101D] rounded-3xl overflow-hidden border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col relative z-10 h-full before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none"
      >
        {/* Header Overlay */}
        <div className="p-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex justify-between items-center absolute w-full top-0 z-20">
          <div className="flex items-center space-x-3 w-3/4">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center backdrop-blur-md shadow-[0_0_10px_rgba(59,130,246,0.5)]">
              <Camera className="w-4 h-4 text-blue-400 flex-shrink-0" />
            </div>
            <span className="text-sm font-black tracking-widest uppercase text-white drop-shadow-md truncate" title={id}>
              {id.split('/').pop() || id}
            </span>
          </div>
          <div className="flex items-center space-x-3 bg-black/40 px-3 py-1.5 rounded-full border border-emerald-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em]">LIVE</span>
          </div>
        </div>

        {/* Video Feed */}
        <div className="aspect-video bg-black relative group-hover:shadow-inner transition-all duration-500 overflow-hidden">
          <img 
            src={videoFeedUrl} 
            alt={`Feed from ${id}`} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://via.placeholder.com/640x360.png?text=Stream+Offline&bg=000000&text_color=ffffff";
            }}
          />

          {/* Tampering Alert Widget (Full Overlay) */}
          {events && events.TamperAnalyticsPlugin && events.TamperAnalyticsPlugin.tamper_alert && (
            <div className="absolute inset-0 bg-orange-600/60 backdrop-blur-md border-[4px] border-orange-500 flex flex-col items-center justify-center z-50 pointer-events-none animate-pulse">
              <AlertTriangle className="w-24 h-24 text-white mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
              <h2 className="text-5xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] text-center">
                Sabotage Alert
              </h2>
              <p className="text-white font-bold text-2xl mt-4 drop-shadow-md bg-black/50 px-4 py-2 rounded-full">
                {events.TamperAnalyticsPlugin.is_covered ? "LENS COVERED / BLINDED" : "CAMERA PHYSICALLY SHIFTED"}
              </p>
            </div>
          )}
          
          {/* Enterprise Safety Alert (Toned Down Overlay) */}
          {events && events.EnterpriseSafetyPlugin && events.EnterpriseSafetyPlugin.has_critical_alert && (
            <div className="absolute top-4 right-4 bg-red-600/90 backdrop-blur-xl border border-red-400 p-3 rounded-2xl flex items-center shadow-[0_10px_30px_rgba(239,68,68,0.6)] z-50 animate-pulse pointer-events-none">
              <Flame className="w-8 h-8 text-white mr-3 drop-shadow-md animate-bounce" />
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-widest drop-shadow-md">
                  EMERGENCY
                </h2>
                <div className="flex flex-col mt-0.5 space-y-1">
                  {events.EnterpriseSafetyPlugin.active_alerts.filter((a: string) => ["FIRE_DETECTED", "SMOKE_DETECTED", "FALL_DETECTED", "FIGHT_DETECTED"].includes(a)).map((alert: string, idx: number) => (
                    <span key={idx} className="text-[10px] font-black text-white bg-black/50 px-2 py-0.5 rounded border border-red-500/50">
                      {alert.replace("_", " ")}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Overlay Analytics Data */}
          {events && (
            <div className="absolute bottom-4 left-4 flex flex-col space-y-2 pointer-events-none z-30">
              
              {/* Queue Analytics Widget */}
              {events.QueueAnalyticsPlugin && (
                <div className="bg-blue-900/80 backdrop-blur-xl border border-blue-500/50 rounded-xl p-3 shadow-[0_5px_15px_rgba(59,130,246,0.3)]">
                  <div className="text-[10px] text-blue-200 font-black mb-1 uppercase tracking-widest flex items-center">
                    <Users className="w-3 h-3 mr-1" /> Queue Status
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <div>
                      <div className="text-[9px] text-blue-300/70 uppercase tracking-widest">Length</div>
                      <div className="text-lg font-black text-white leading-none mt-1">
                        {events.QueueAnalyticsPlugin.queue_length} <span className="text-[10px] font-bold text-blue-200">pax</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-[9px] text-blue-300/70 uppercase tracking-widest flex items-center justify-end">
                        <Clock className="w-2.5 h-2.5 mr-1" /> Est. Wait
                      </div>
                      <div className="text-lg font-black text-white leading-none mt-1">
                        {events.QueueAnalyticsPlugin.predicted_wait_time_seconds} <span className="text-[10px] font-bold text-blue-200">s</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Identity & Access Control Widget */}
              {events.IdentityAnalyticsPlugin && (events.IdentityAnalyticsPlugin.authorized_employees_in_frame.length > 0 || events.IdentityAnalyticsPlugin.unauthorized_count > 0) && (
                <div className="bg-purple-900/80 backdrop-blur-xl border border-purple-500/50 rounded-xl p-3 shadow-[0_5px_15px_rgba(168,85,247,0.3)] max-w-xs">
                  <div className="text-[10px] text-purple-200 font-black mb-2 uppercase tracking-widest flex items-center border-b border-purple-500/30 pb-1">
                    Access Control
                  </div>
                  
                  {events.IdentityAnalyticsPlugin.authorized_employees_in_frame.length > 0 && (
                    <div className="mb-2">
                      <div className="text-[9px] text-emerald-300 uppercase tracking-widest mb-1 flex items-center">
                        <UserCheck className="w-3 h-3 mr-1" /> Checked In
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {events.IdentityAnalyticsPlugin.authorized_employees_in_frame.map((name: string, idx: number) => (
                          <span key={idx} className="bg-emerald-500/20 text-emerald-200 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {events.IdentityAnalyticsPlugin.unauthorized_count > 0 && (
                    <div>
                      <div className="text-[9px] text-red-300 uppercase tracking-widest mb-1 flex items-center">
                        <UserX className="w-3 h-3 mr-1" /> Unknown Persons
                      </div>
                      <div className="text-xs font-black text-red-400">
                        {events.IdentityAnalyticsPlugin.unauthorized_count} detected
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3D Glassmorphism Stats Footer (Matching ASCII Data) */}
        <div className="w-full bg-white/5 backdrop-blur-2xl border-t border-white/10 p-4 grid grid-cols-2 gap-x-6 gap-y-3 z-30">
            <div className="flex justify-between items-center bg-black/30 rounded-lg px-3 py-1.5 border border-white/5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cam FPS</span> 
              <span className="text-sm font-black text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]">{events?.fps?.toFixed(0) || 30}</span>
            </div>
            <div className="flex justify-between items-center bg-black/30 rounded-lg px-3 py-1.5 border border-white/5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI FPS</span> 
              <span className="text-sm font-black text-purple-400 drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]">{((events?.fps || 30) / 2).toFixed(0)}</span>
            </div>
            
            <div className="col-span-2 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-1"></div>
            
            <div className="flex justify-between items-center bg-emerald-900/20 rounded-lg px-3 py-1.5 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">People</span> 
              <span className="text-sm font-black text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]">{events?.PeopleCountingPlugin?.current_people_in_frame || 0}</span>
            </div>
            
            <div className="flex space-x-2">
              <div className="flex-1 flex justify-between items-center bg-black/30 rounded-lg px-3 py-1.5 border border-white/5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">IN</span> 
                <span className="text-sm font-black text-white">{events?.PeopleCountingPlugin?.total_unique_people_seen || 0}</span>
              </div>
              <div className="flex-1 flex justify-between items-center bg-black/30 rounded-lg px-3 py-1.5 border border-white/5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">OUT</span> 
                <span className="text-sm font-black text-white">{Math.max(0, (events?.PeopleCountingPlugin?.total_unique_people_seen || 0) - (events?.PeopleCountingPlugin?.current_people_in_frame || 0))}</span>
              </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CameraCard;
