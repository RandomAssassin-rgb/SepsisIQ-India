import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Cloud } from 'lucide-react';

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadHistory = () => {
      const initialHistory = [
        {
          id: 'IND-8821',
          name: 'Aditi Sharma',
          mortality: 84,
          status: 'critical',
          admitted: '14m ago',
          notes: '"High lactate levels observed in latest labs. Hypotension persisting despite fluid..."'
        },
        {
          id: 'IND-9012',
          name: 'Rajesh Kumar',
          mortality: 42,
          status: 'high',
          admitted: '2h ago',
          notes: '"Temperature spike to 102.4F. WBC count elevated. Monitoring for respiratory distress."'
        }
      ];

      const storedPatients = localStorage.getItem('sepsis_patients');
      let customPatients = [];
      if (storedPatients) {
        try {
          customPatients = JSON.parse(storedPatients).map((p: any) => ({
            ...p,
            notes: '"Custom patient assessment completed."'
          }));
        } catch (e) {
          console.error("Failed to parse custom patients", e);
        }
      }
      
      const combined = [...customPatients, ...initialHistory];
      // Remove duplicates by ID
      const unique = combined.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
      setHistory(unique);
    };

    loadHistory();
    window.addEventListener('storage', loadHistory);
    return () => window.removeEventListener('storage', loadHistory);
  }, []);

  const filteredHistory = history.filter(patient => 
    (patient.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (patient.id?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-md mx-auto bg-slate-50 min-h-screen">
      <div className="text-[10px] font-bold text-blue-600 tracking-wider mb-1 uppercase">Clinical Archive</div>
      <h1 className="text-4xl font-extrabold tracking-tight mb-6">Patient History</h1>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search ID or Name..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-200/50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="bg-[#0066cc] text-white rounded-3xl p-6 shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-2">Launch Insights</h2>
        <p className="text-white/80 text-sm mb-6 leading-relaxed">
          View population-level sepsis trends and historical predictive accuracy across the facility.
        </p>
        <button 
          onClick={() => navigate('/stewardship')}
          className="bg-white text-[#0066cc] font-bold py-3 px-5 rounded-xl text-sm flex items-center gap-2 hover:bg-blue-50 transition-colors"
        >
          Analyze Trends <TrendingUp size={16} />
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Recent Assessments</h3>
        <button className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
        </button>
      </div>

      <div className="space-y-4 mb-8">
        {filteredHistory.map((patient, index) => (
          <div key={index} className={`bg-white rounded-3xl p-5 shadow-sm border-l-4 ${patient.status === 'critical' ? 'border-[#c81e1e]' : patient.status === 'high' ? 'border-amber-500' : 'border-blue-500'}`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className={`text-[10px] font-bold ${patient.status === 'critical' ? 'text-[#c81e1e]' : patient.status === 'high' ? 'text-amber-500' : 'text-blue-500'} tracking-wider mb-1`}>{patient.id}</div>
                <h4 className="font-bold text-lg">{patient.name}</h4>
                <div className="text-xs text-slate-400">Last Update: {patient.admitted}</div>
              </div>
            </div>
            <p className="text-sm text-slate-600 italic mb-4">{patient.notes || '"Assessment completed. Monitoring ongoing."'}</p>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-[8px] font-bold text-slate-400 tracking-wider">MORTALITY RISK</div>
                <div className={`text-2xl font-extrabold ${patient.status === 'critical' ? 'text-[#c81e1e]' : patient.status === 'high' ? 'text-amber-600' : 'text-blue-600'}`}>{patient.mortality}%</div>
              </div>
              <div className={`${patient.status === 'critical' ? 'bg-red-100 text-red-800' : patient.status === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'} text-[10px] font-bold px-3 py-1 rounded-full uppercase`}>
                {patient.status}
              </div>
              <div className="text-slate-400">&gt;</div>
            </div>
          </div>
        ))}

        {filteredHistory.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No history found.
          </div>
        )}
      </div>

      <div className="bg-slate-100 rounded-3xl p-6 mb-8">
        <h3 className="font-bold text-lg mb-4">Archive Analytics</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-2xl text-center">
            <div className="text-[9px] font-bold text-slate-500 tracking-wider mb-1">TOTAL PROCESSED</div>
            <div className="text-xl font-bold text-[#0066cc]">{1284 + history.length}</div>
          </div>
          <div className="bg-white p-3 rounded-2xl text-center">
            <div className="text-[9px] font-bold text-slate-500 tracking-wider mb-1">EARLY DETECTIONS</div>
            <div className="text-xl font-bold text-teal-600">92%</div>
          </div>
          <div className="bg-white p-3 rounded-2xl text-center">
            <div className="text-[9px] font-bold text-slate-500 tracking-wider mb-1">ALERTS RESOLVED</div>
            <div className="text-xl font-bold text-[#c81e1e]">342</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 text-center shadow-sm flex flex-col items-center">
        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
          <Cloud size={24} className="text-[#0066cc]" />
        </div>
        <h4 className="font-bold">Azure Clinical Cloud</h4>
        <p className="text-xs text-slate-500">Last synced 2m ago</p>
      </div>
    </div>
  );
}
