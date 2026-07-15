import React from 'react';
import { useCCTVStore } from '../store';
import { Users, Server, AlertTriangle, ShieldAlert, Car, Activity, Box, Users2, Flame, RefreshCw, Maximize2, Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockOccupancyData = [
  { time: '08:00', occupancy: 12 },
  { time: '10:00', occupancy: 45 },
  { time: '12:00', occupancy: 85 },
  { time: '14:00', occupancy: 110 },
  { time: '16:00', occupancy: 65 },
  { time: '18:00', occupancy: 30 },
];

const mockAlertData = [
  { name: 'Smoke', count: 12 },
  { name: 'Fire', count: 2 },
  { name: 'Intrusion', count: 8 },
  { name: 'Tamper', count: 3 },
  { name: 'Loitering', count: 15 },
];

export default function DashboardPage() {
  const data = useCCTVStore(state => state.data);
  const notifications = useCCTVStore(state => state.notifications);
  
  const cameraIds = Object.keys(data);
  const onlineCameras = cameraIds.length;
  
  const totalPeople = cameraIds.reduce((sum, id) => sum + (data[id]?.events?.PeopleCountingPlugin?.current_people_in_frame || 0), 0);
  const totalVehicles = cameraIds.reduce((sum, id) => sum + (data[id]?.events?.ParkingAnalyticsPlugin?.vehicle_count || 0), 0);
  const avgQueue = cameraIds.length > 0 
    ? cameraIds.reduce((sum, id) => sum + (data[id]?.events?.QueueAnalyticsPlugin?.predicted_wait_time_seconds || 0), 0) / cameraIds.length 
    : 0;

  const smokeAlerts = notifications.filter(n => n.type === 'SMOKE_DETECTED' || n.type === 'FIRE_DETECTED').length;
  const unauthAlerts = notifications.filter(n => n.type === 'INTRUSION' || n.type === 'UNKNOWN_PERSON').length;
  const todaysAttendance = new Set(notifications.filter(n => n.type === 'ATTENDANCE' && n.action === 'CHECK IN').map(n => n.message)).size;

  // macOS-style Widget component (Small)
  const MacWidgetSmall = ({ title, value, subtitle, icon: Icon, colorClass, glowColor }: any) => (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01, boxShadow: `0 15px 30px -10px ${glowColor || 'rgba(0,0,0,0.5)'}` }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-[#1C1C1E]/80 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 flex flex-col justify-between h-[170px] relative overflow-hidden select-none"
    >
      <div className="flex justify-between items-start">
        <div className={`p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
        </div>
      </div>
      <div>
        <h3 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1">{title}</h3>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-black text-white tracking-tight">{value}</span>
          {subtitle && <span className="text-xs text-slate-500 font-medium">{subtitle}</span>}
        </div>
      </div>
    </motion.div>
  );

  // macOS-style Widget component (Medium)
  const MacWidgetMedium = ({ title, children, headerRight }: any) => (
    <motion.div 
      whileHover={{ y: -4, scale: 1.005 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-[#1C1C1E]/80 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 flex flex-col justify-between min-h-[170px] relative overflow-hidden col-span-1 md:col-span-2 select-none"
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">{title}</h3>
        {headerRight || (
          <div className="flex space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-white/10"></span>
            <span className="w-2 h-2 rounded-full bg-white/10"></span>
            <span className="w-2 h-2 rounded-full bg-white/10"></span>
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-center">
        {children}
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-[1600px] mx-auto pb-24 h-full flex flex-col space-y-8">
      
      {/* Fake macOS Application Window Header wrapper */}
      <motion.div 
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1C1C1E]/60 backdrop-blur-3xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          {/* macOS window controls */}
          <div className="flex space-x-2">
            <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E] flex items-center justify-center group cursor-pointer">
              <span className="text-[7px] text-black font-bold hidden group-hover:block">×</span>
            </div>
            <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123] flex items-center justify-center group cursor-pointer">
              <span className="text-[7px] text-black font-bold hidden group-hover:block">-</span>
            </div>
            <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29] flex items-center justify-center group cursor-pointer">
              <span className="text-[7px] text-black font-bold hidden group-hover:block">+</span>
            </div>
          </div>
          <div className="h-4 w-[1px] bg-white/10"></div>
          <div>
            <h1 className="text-xl font-black tracking-wider text-white">System Dashboard</h1>
            <p className="text-xs text-slate-400 font-medium">Real-time status updates and telemetry feeds</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-white/5 rounded-full p-1.5 border border-white/5">
          <button className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-all">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Widgets Grid - macOS style widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Widget: Active Nodes */}
        <MacWidgetSmall 
          title="Active Nodes" 
          value={`${onlineCameras} / 32`} 
          subtitle="Nodes connected" 
          icon={Server} 
          colorClass="text-blue-400" 
          glowColor="rgba(59,130,246,0.15)"
        />

        {/* Widget: Live Occupancy (Medium) */}
        <MacWidgetMedium title="Live Occupancy Overview">
          <div className="flex justify-between items-center h-full">
            <div>
              <span className="text-4xl font-black text-white tracking-tight">{totalPeople}</span>
              <p className="text-xs text-emerald-400 font-bold mt-1">▲ +12% in last hour</p>
            </div>
            <div className="w-32 h-14 opacity-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockOccupancyData.slice(-4)}>
                  <Area type="monotone" dataKey="occupancy" stroke="#10B981" fill="#10B981" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </MacWidgetMedium>

        {/* Widget: Vehicle Count */}
        <MacWidgetSmall 
          title="Vehicles Detected" 
          value={totalVehicles} 
          subtitle="Smart Parking" 
          icon={Car} 
          colorClass="text-purple-400" 
          glowColor="rgba(168,85,247,0.15)"
        />

        {/* Widget: Avg Queue Time */}
        <MacWidgetSmall 
          title="Avg Queue Time" 
          value={`${avgQueue.toFixed(1)}s`} 
          subtitle="Predicted wait" 
          icon={Users2} 
          colorClass="text-amber-400" 
          glowColor="rgba(245,158,11,0.15)"
        />

        {/* Widget: System Safety Alerts */}
        <MacWidgetSmall 
          title="Safety Alerts" 
          value={smokeAlerts} 
          subtitle="Active hazards" 
          icon={Flame} 
          colorClass="text-red-400" 
          glowColor="rgba(239,68,68,0.15)"
        />

        {/* Widget: Security Status (Medium) */}
        <MacWidgetMedium title="Security Incidents & Attendance">
          <div className="grid grid-cols-2 gap-4 h-full items-center">
            <div className="border-r border-white/5 pr-4">
              <span className="text-2xl font-black text-white">{unauthAlerts}</span>
              <p className="text-[10px] font-bold text-orange-400 uppercase mt-0.5">Access Warnings</p>
            </div>
            <div className="pl-2">
              <span className="text-2xl font-black text-white">{todaysAttendance}</span>
              <p className="text-[10px] font-bold text-teal-400 uppercase mt-0.5">Checked-in today</p>
            </div>
          </div>
        </MacWidgetMedium>

        {/* Widget: System Load */}
        <MacWidgetSmall 
          title="System Load" 
          value="42%" 
          subtitle="GPU Cluster" 
          icon={Activity} 
          colorClass="text-slate-300" 
          glowColor="rgba(255,255,255,0.05)"
        />

      </div>

      {/* Main Graph Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Graph 1: Hourly Occupancy Trend */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1C1C1E]/80 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 h-[400px] flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black tracking-widest text-slate-200 uppercase flex items-center">
              <Activity className="w-4 h-4 mr-2 text-blue-400" /> Hourly Occupancy Trend
            </h3>
            <div className="flex space-x-1">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active</span>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockOccupancyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOccDash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" vertical={false} />
                <XAxis dataKey="time" stroke="#48484A" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#48484A" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(28, 28, 30, 0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(20px)', shadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="occupancy" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorOccDash)" animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Graph 2: Alert Distribution */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#1C1C1E]/80 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 h-[400px] flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black tracking-widest text-slate-200 uppercase flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-amber-400" /> Alert Distribution
            </h3>
            <div className="flex space-x-1">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aggregate</span>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockAlertData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#48484A" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#AEAEB2" fontSize={11} tickLine={false} axisLine={false} width={80} />
                <Tooltip 
                  cursor={{fill: 'rgba(255, 255, 255, 0.03)'}}
                  contentStyle={{ backgroundColor: 'rgba(28, 28, 30, 0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(20px)' }}
                  itemStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" fill="#F59E0B" radius={[0, 8, 8, 0]} animationDuration={1000} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
