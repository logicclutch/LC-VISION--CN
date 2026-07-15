import React from 'react';
import { Car, MapPin, Truck, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ParkingAnalyticsPage() {
  return (
    <div className="max-w-[1600px] mx-auto pb-24 h-full flex flex-col space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1C1C1E]/80 backdrop-blur-3xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-black tracking-wider text-white flex items-center">
            <Car className="w-6 h-6 mr-3 text-indigo-400" />
            Smart Parking
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-1">Vehicle counting, classification, and spot availability.</p>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Vehicles", val: "34", icon: Car, color: "text-indigo-400" },
          { title: "Available Spots", val: "12", icon: CheckCircle, color: "text-emerald-400" },
          { title: "Heavy Vehicles", val: "2", icon: Truck, color: "text-orange-400" },
          { title: "Zones Monitored", val: "4", icon: MapPin, color: "text-blue-400" },
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
            Parking zone maps and ANPR history will appear here.
         </div>
      </motion.div>
    </div>
  );
}
