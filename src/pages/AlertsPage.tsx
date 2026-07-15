import React from 'react';
import { useCCTVStore } from '../store';
import { AlertTriangle, Bell } from 'lucide-react';

export default function AlertsPage() {
  const notifications = useCCTVStore(state => state.notifications);

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Global Notification Center</h1>
          <p className="text-sm text-slate-400 mt-1">Review all system alerts and events across the entire fleet.</p>
        </div>
        <div className="flex space-x-2">
            <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-lg border border-red-500/30">CRITICAL ({notifications.filter(n=>n.level==='critical').length})</span>
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-lg border border-amber-500/30">WARNING ({notifications.filter(n=>n.level==='warning').length})</span>
        </div>
      </div>

      <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl overflow-hidden">
        {notifications.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-500">
                <Bell className="w-12 h-12 mb-4 opacity-50" />
                <p>No alerts recorded yet.</p>
            </div>
        ) : (
            <div className="divide-y divide-slate-700/50">
                {notifications.map((notif, i) => (
                    <div key={i} className="p-4 hover:bg-slate-800/50 transition-colors flex items-center">
                        <div className={`p-3 rounded-full mr-4 ${
                            notif.level === 'critical' ? 'bg-red-500/20 text-red-400' :
                            notif.level === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-blue-500/20 text-blue-400'
                        }`}>
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-slate-200">{notif.type.replace('_', ' ')}</h4>
                            <p className="text-xs text-slate-400 mt-1">{notif.message}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-medium text-slate-300">{notif.timestamp.toLocaleTimeString()}</div>
                            <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{notif.camera}</div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
