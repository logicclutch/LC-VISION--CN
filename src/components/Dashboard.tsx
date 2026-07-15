import React, { useEffect, useState, useRef } from 'react';
import { Activity, ShieldAlert, Users, Server, Bell, AlertTriangle } from 'lucide-react';
import CameraCard from './CameraCard';

const Dashboard = () => {
  const [data, setData] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const lastAlertTimes = useRef<{[key: string]: number}>({});

  // Poll the FastAPI analytics events endpoint
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:8000/events');
        if (!response.ok) throw new Error("Failed to fetch events");
        const json = await response.json();
        setData(json);
        setError(null);
        
        // Parse global notifications
        Object.keys(json).forEach(camId => {
            const ev = json[camId]?.events;
            if(!ev) return;
            
            const pushAlert = (type: string, msg: string, level: 'info'|'warning'|'critical') => {
                const key = `${camId}_${type}`;
                const lastTime = lastAlertTimes.current[key] || 0;
                if (Date.now() - lastTime > 15000) { // Cooldown 15s per alert type
                    setNotifications(prev => [{
                        id: Math.random().toString(), type, message: msg, timestamp: new Date(), level, camera: camId
                    }, ...prev].slice(0, 50));
                    lastAlertTimes.current[key] = Date.now();
                }
            };

            if (ev.EnterpriseSafetyPlugin?.active_alerts) {
                ev.EnterpriseSafetyPlugin.active_alerts.forEach((a: string) => 
                    pushAlert(a, `${a.replace('_', ' ')}`, 'critical')
                );
            }
            if (ev.SpatialAnalyticsPlugin?.intrusions?.length > 0) {
                pushAlert('INTRUSION', `Zone Intrusion (${ev.SpatialAnalyticsPlugin.intrusions.length})`, 'warning');
            }
            if (ev.TamperAnalyticsPlugin?.tamper_alert) {
                pushAlert('TAMPER', 'Camera Tampering', 'warning');
            }
            if (ev.IdentityAnalyticsPlugin?.attendance_logs) {
                ev.IdentityAnalyticsPlugin.attendance_logs.forEach((log: any) => {
                   const logKey = `${camId}_${log.employee}_${log.action}_${log.time}`;
                   if (!lastAlertTimes.current[logKey]) {
                       lastAlertTimes.current[logKey] = Date.now();
                       setNotifications(prev => [{
                           id: logKey, type: 'ATTENDANCE', message: `${log.employee} ${log.action}`, timestamp: new Date(), level: 'info', camera: camId
                       }, ...prev].slice(0, 50));
                   }
                });
            }
        });
        
      } catch (err: any) {
        setError(err.message);
      }
    };

    const interval = setInterval(fetchEvents, 1000);
    return () => clearInterval(interval);
  }, []);

  const cameraIds = Object.keys(data);
  const totalPeople = cameraIds.reduce((sum, id) => {
    return sum + (data[id]?.events?.PeopleCountingPlugin?.current_people_in_frame || 0);
  }, 0);
  
  const avgFps = cameraIds.length > 0 
    ? cameraIds.reduce((sum, id) => sum + (data[id]?.fps || 0), 0) / cameraIds.length 
    : 0;

  return (
    <div className="p-8 max-w-[1800px] mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
            <ShieldAlert className="text-blue-500 w-10 h-10" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              Enterprise CCTV Platform
            </span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium tracking-wide">DISTRIBUTED AI SURVEILLANCE NODE</p>
        </div>
        
        {/* Top KPI Stats */}
        <div className="flex space-x-4 w-full md:w-auto">
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-xl px-5 py-3 flex items-center space-x-4 flex-1 md:flex-none">
            <Server className="w-6 h-6 text-blue-400 opacity-80" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Streams</div>
              <div className="text-2xl font-black text-white">{cameraIds.length}</div>
            </div>
          </div>
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-xl px-5 py-3 flex items-center space-x-4 flex-1 md:flex-none">
            <Users className="w-6 h-6 text-emerald-400 opacity-80" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Live Occupancy</div>
              <div className="text-2xl font-black text-white">{totalPeople}</div>
            </div>
          </div>
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-xl px-5 py-3 flex items-center space-x-4 flex-1 md:flex-none">
            <Activity className="w-6 h-6 text-purple-400 opacity-80" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">System Health</div>
              <div className="text-xl font-black text-white mt-1">{avgFps.toFixed(1)} <span className="text-sm font-normal text-slate-400">FPS Avg</span></div>
            </div>
          </div>
        </div>
      </header>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-8 flex items-center shadow-lg">
          <Activity className="w-5 h-5 mr-3 animate-pulse" />
          <span className="font-medium">Backend API Disconnected:</span> 
          <span className="ml-2 opacity-80">{error}. Is the Python server running on port 8000?</span>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* Left Side: Video Grid (Takes up remaining space) */}
        <div className="flex-1">
          {cameraIds.length === 0 && !error ? (
            <div className="h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-slate-700/50 rounded-2xl bg-slate-800/20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mb-6"></div>
              <div className="text-slate-400 font-medium tracking-wide">Waiting for camera streams...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {cameraIds.map(id => (
                <CameraCard 
                  key={id} 
                  id={id} 
                  url={id} 
                  events={data[id]?.events} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Global Live Notifications */}
        <div className="xl:w-[400px] flex-shrink-0 flex flex-col">
          <div className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-xl overflow-hidden flex flex-col h-full max-h-[800px]">
            <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-200 flex items-center tracking-widest uppercase">
                <Bell className="w-4 h-4 mr-2 text-blue-400" />
                Live Feed
              </h2>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full font-bold">
                {notifications.length} EVENTS
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="text-slate-500 text-sm text-center mt-10">No recent events</div>
              ) : (
                notifications.map(notif => (
                  <div key={notif.id} className={`p-3 rounded-lg border flex flex-col gap-1 transition-all animate-in slide-in-from-right-4 duration-300 ${
                    notif.level === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                    notif.level === 'warning' ? 'bg-amber-500/10 border-amber-500/30' :
                    'bg-slate-700/30 border-slate-600/50'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        {notif.level === 'critical' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                        <span className={`text-xs font-black tracking-wider uppercase ${
                          notif.level === 'critical' ? 'text-red-400' :
                          notif.level === 'warning' ? 'text-amber-400' :
                          'text-emerald-400'
                        }`}>{notif.type}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {notif.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                      </span>
                    </div>
                    <div className="text-sm text-white font-medium">{notif.message}</div>
                    <div className="text-[10px] text-slate-500 mt-1 uppercase">Source: {notif.camera}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
