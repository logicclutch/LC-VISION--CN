import { create } from 'zustand';

export interface Notification {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'critical';
  camera: string;
}

interface CCTVState {
  data: Record<string, any>;
  notifications: Notification[];
  isConnected: boolean;
  error: string | null;
  startPolling: () => void;
  stopPolling: () => void;
}

// Track last alert times outside the store to avoid re-renders on every update
const lastAlertTimes: Record<string, number> = {};
let wsConnection: WebSocket | null = null;

export const useCCTVStore = create<CCTVState>((set, get) => ({
  data: {},
  notifications: [],
  isConnected: false,
  error: null,
  
  startPolling: () => {
    if (wsConnection) return;
    
    try {
        wsConnection = new WebSocket('ws://localhost:8000/ws/events');
        
        wsConnection.onopen = () => {
            set({ isConnected: true, error: null });
        };
        
        wsConnection.onmessage = (event) => {
            const json = JSON.parse(event.data);
            const newNotifications: Notification[] = [];
            
            // Parse global notifications
            Object.keys(json).forEach(camId => {
                const ev = json[camId]?.events;
                if(!ev) return;
                
                const pushAlert = (type: string, msg: string, level: 'info'|'warning'|'critical') => {
                    const key = `${camId}_${type}`;
                    const lastTime = lastAlertTimes[key] || 0;
                    if (Date.now() - lastTime > 15000) { // Cooldown 15s per alert type
                        newNotifications.push({
                            id: Math.random().toString(), type, message: msg, timestamp: new Date(), level, camera: camId
                        });
                        lastAlertTimes[key] = Date.now();
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
                       if (!lastAlertTimes[logKey]) {
                           lastAlertTimes[logKey] = Date.now();
                           newNotifications.push({
                               id: logKey, type: 'ATTENDANCE', message: `${log.employee} ${log.action}`, timestamp: new Date(), level: 'info', camera: camId
                           });
                       }
                    });
                }
            });
            
            set((state) => {
                const updatedNotifications = [...newNotifications, ...state.notifications].slice(0, 100);
                return {
                    data: json,
                    notifications: updatedNotifications,
                    isConnected: true,
                    error: null
                };
            });
        };
        
        wsConnection.onclose = () => {
            set({ isConnected: false, error: "WebSocket disconnected. Reconnecting..." });
            wsConnection = null;
            setTimeout(() => get().startPolling(), 3000);
        };
        
        wsConnection.onerror = (err) => {
            console.error("WebSocket error:", err);
            wsConnection?.close();
        };

    } catch (err: any) {
        set({ isConnected: false, error: err.message });
    }
  },
  
  stopPolling: () => {
    if (wsConnection) {
      wsConnection.close();
      wsConnection = null;
    }
  }
}));
