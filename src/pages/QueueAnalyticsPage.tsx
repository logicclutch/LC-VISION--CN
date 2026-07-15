import React from 'react';
import { Users2, Clock, Hourglass, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QueueAnalyticsPage() {
  return (
    <div className="max-w-[1600px] mx-auto pb-24 h-full flex flex-col space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1C1C1E]/80 backdrop-blur-3xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-black tracking-wider text-white flex items-center">
            <Users2 className="w-6 h-6 mr-3 text-purple-400" />
            Queue Management
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-1">Wait time prediction and line optimization.</p>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total in Queue", val: "14", icon: Users2, color: "text-purple-400" },
          { title: "Avg Wait Time", val: "2.4m", icon: Clock, color: "text-amber-400" },
          { title: "Service Rate", val: "45/hr", icon: Activity, color: "text-emerald-400" },
          { title: "Longest Wait", val: "5.1m", icon: Hourglass, color: "text-red-400" },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#1C1C1E]/80 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 hover:-translate-y-1 transition-transform cursor-default shadow-lg"
          >
            <stat.icon className={`w-6 h-6 ${stat.color} mb-4`} />
            <div className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">{stat.title}</div>
            <div className="text-3xl font-black text-white">{stat.val}</div>
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex-1 bg-[#1C1C1E]/80 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 min-h-[400px] flex items-center justify-center"
      >
         <div className="text-center text-slate-500 font-bold uppercase tracking-widest">
            Queue historical trends and prediction models will appear here.
         </div>
      </motion.div>
    </div>
  );
}
