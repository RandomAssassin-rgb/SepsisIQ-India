import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Trash2, Clock, Activity, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const initialAlerts = [
  { id: 1, type: 'critical', patientId: 'IND-8821', patientName: 'Aditi Sharma', message: 'Mortality risk spiked to 84% (+16%) in last 2 hours.', time: '14m ago', acknowledged: false },
  { id: 2, type: 'critical', patientId: 'IND-9012', patientName: 'Rajesh Kumar', message: 'First entry into critical zone (CR Risk 87%).', time: '1h ago', acknowledged: false },
  { id: 3, type: 'warning', patientId: 'IND-9105', patientName: 'Sunita Devi', message: 'Deterioration risk 72% over next 6 hours.', time: '2h ago', acknowledged: true },
  { id: 4, type: 'warning', patientId: 'IND-8754', patientName: 'Mohammad Ali', message: 'Lactate elevated (3.8 mmol/L).', time: '4h ago', acknowledged: true },
];

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const loadAlerts = () => {
      const storedAlerts = localStorage.getItem('sepsis_alerts');
      if (storedAlerts) {
        setAlerts(JSON.parse(storedAlerts));
      } else {
        setAlerts(initialAlerts);
        localStorage.setItem('sepsis_alerts', JSON.stringify(initialAlerts));
      }
    };

    loadAlerts();

    window.addEventListener('alertsUpdated', loadAlerts);
    return () => window.removeEventListener('alertsUpdated', loadAlerts);
  }, []);

  const saveAlerts = (newAlerts: any[]) => {
    setAlerts(newAlerts);
    localStorage.setItem('sepsis_alerts', JSON.stringify(newAlerts));
    window.dispatchEvent(new Event('alertsUpdated'));
  };

  const handleAcknowledge = (id: number) => {
    saveAlerts(alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const handleDelete = (id: number) => {
    saveAlerts(alerts.filter(a => a.id !== id));
  };

  const unreadCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className="p-6 max-w-md mx-auto bg-slate-50 min-h-screen">
      <div className="flex justify-between items-end mb-6">
        <div>
          <div className="text-[10px] font-bold text-red-600 tracking-wider mb-1 uppercase">Live Feed</div>
          <h1 className="text-3xl font-extrabold tracking-tight">Active Alerts</h1>
        </div>
        <div className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
          <AlertTriangle size={14} /> {unreadCount} Unread
        </div>
      </div>

      <div className="space-y-4">
        {alerts.map(alert => (
          <div 
            key={alert.id} 
            className={`bg-white rounded-3xl p-5 shadow-sm border-l-4 ${alert.type === 'critical' ? 'border-[#c81e1e]' : 'border-amber-500'} ${!alert.acknowledged ? 'bg-red-50/30' : ''}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                {alert.type === 'critical' ? (
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-[#c81e1e]">
                    <Activity size={16} />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                    <AlertTriangle size={16} />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-slate-800">{alert.patientName}</h3>
                  <div className="text-[10px] font-bold text-slate-500 tracking-wider">{alert.patientId}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                <Clock size={12} /> {alert.time}
              </div>
            </div>
            
            <p className="text-sm text-slate-700 mb-4">{alert.message}</p>
            
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Link to="/results" className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline">
                View Patient <ArrowRight size={12} />
              </Link>
              <div className="flex gap-2">
                {!alert.acknowledged && (
                  <button 
                    onClick={() => handleAcknowledge(alert.id)}
                    className="w-8 h-8 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 hover:bg-teal-100 transition"
                  >
                    <CheckCircle2 size={16} />
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(alert.id)}
                  className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {alerts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">All Clear</h3>
            <p className="text-sm text-slate-500">No active alerts at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
