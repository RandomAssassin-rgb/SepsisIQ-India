import React, { useState, useEffect } from 'react';
import { Search, Activity, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';

const mockData = [
  { time: '08:00', mortality: 45, cr: 30, sofa: 4, hr: 95, map: 75, spo2: 96, lactate: 1.8, wbc: 12, treatment: 'Initial Assessment' },
  { time: '12:00', mortality: 52, cr: 45, sofa: 5, hr: 105, map: 68, spo2: 94, lactate: 2.4, wbc: 14, treatment: null },
  { time: '16:00', mortality: 68, cr: 60, sofa: 7, hr: 115, map: 62, spo2: 92, lactate: 3.5, wbc: 16, treatment: 'Fluid Resuscitation' },
  { time: '20:00', mortality: 84, cr: 87, sofa: 9, hr: 124, map: 58, spo2: 88, lactate: 4.2, wbc: 18.5, treatment: 'Started Polymyxin B' },
  { time: '00:00', mortality: 75, cr: 85, sofa: 8, hr: 110, map: 65, spo2: 92, lactate: 3.1, wbc: 17, treatment: null },
  { time: '04:00', mortality: 60, cr: 80, sofa: 6, hr: 98, map: 70, spo2: 95, lactate: 2.2, wbc: 15, treatment: null },
];

export default function PatientTrajectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  useEffect(() => {
    const loadPatients = () => {
      // Load custom patients from localStorage
      const stored = localStorage.getItem('sepsis_patients');
      let customPatients = [];
      if (stored) {
        try {
          customPatients = JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse custom patients", e);
        }
      }

      const defaultPatient = {
        id: 'IND-8821',
        name: 'Aditi Sharma',
        age: 42,
        gender: 'F',
        bed: 'ICU Bed 4',
        mortalityRisk: 60,
        crRisk: 87,
        sofaScore: 9,
        vitals: { hr: 124, map: 58, spo2: 88, lactate: 4.2 }
      };

      const allPatients = [defaultPatient, ...customPatients];
      setPatients(allPatients);
      
      // Check URL for ID
      const params = new URLSearchParams(window.location.search);
      const idParam = params.get('id');
      if (idParam) {
        const found = allPatients.find(p => p.id === idParam);
        if (found) {
          setSelectedPatient(found);
          setSearchTerm(found.id);
        } else {
          setSelectedPatient(defaultPatient);
        }
      } else {
        setSelectedPatient(defaultPatient);
      }
    };

    loadPatients();
    window.addEventListener('storage', loadPatients);
    return () => window.removeEventListener('storage', loadPatients);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.length > 2) {
      const found = patients.find(p => 
        p.id?.toLowerCase().includes(term.toLowerCase()) || 
        p.name?.toLowerCase().includes(term.toLowerCase())
      );
      if (found) {
        setSelectedPatient(found);
      }
    }
  };

  const displayPatient = selectedPatient || patients[0];

  return (
    <div className="p-6 max-w-4xl mx-auto bg-slate-50 min-h-screen">
      <div className="text-[10px] font-bold text-blue-600 tracking-wider mb-1 uppercase">ICU Analytics</div>
      <h1 className="text-3xl font-extrabold tracking-tight mb-6">Patient Trajectory</h1>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search Patient ID or Name..." 
          className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
        />
        {searchTerm.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
            {patients.filter(p => p.id?.toLowerCase().includes(searchTerm.toLowerCase()) || p.name?.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
              <button 
                key={p.id} 
                className="w-full text-left p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors"
                onClick={() => {
                  setSelectedPatient(p);
                  setSearchTerm('');
                }}
              >
                <div className="font-bold text-slate-800">{p.name} <span className="text-slate-500 font-normal">({p.id})</span></div>
                <div className="text-xs text-slate-500">{p.bed}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {displayPatient && (
        <div className="bg-white p-5 rounded-3xl shadow-sm mb-6 flex justify-between items-center border-l-4 border-[#c81e1e]">
          <div>
            <h2 className="text-xl font-bold">{displayPatient.name} ({displayPatient.id})</h2>
            <p className="text-sm text-slate-500">{displayPatient.age || 42}{displayPatient.gender || 'F'} • {displayPatient.bed || 'ICU Bed 4'} • Admitted: 2 days ago</p>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 tracking-wider">CURRENT RISK</div>
            <div className="text-2xl font-extrabold text-[#c81e1e]">{displayPatient.mortalityRisk || 60}%</div>
          </div>
        </div>
      )}

      {/* Risk Scores Chart */}
      <div className="bg-white p-5 rounded-3xl shadow-sm mb-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-blue-600"/> Risk Scores (Mortality / CR / SOFA)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMortality" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c81e1e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#c81e1e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0066cc" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0066cc" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
              <Area yAxisId="left" type="monotone" dataKey="mortality" name="Mortality %" stroke="#c81e1e" strokeWidth={3} fillOpacity={1} fill="url(#colorMortality)" />
              <Area yAxisId="left" type="monotone" dataKey="cr" name="CR Risk %" stroke="#0066cc" strokeWidth={3} fillOpacity={1} fill="url(#colorCR)" />
              <Line yAxisId="right" type="step" dataKey="sofa" name="SOFA Score" stroke="#f59e0b" strokeWidth={2} dot={{r: 4}} />
              
              {mockData.filter(d => d.treatment).map((d, i) => (
                <ReferenceLine key={i} yAxisId="left" x={d.time} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'top', value: d.treatment, fill: '#64748b', fontSize: 10 }} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hemodynamic Vitals Chart */}
      <div className="bg-white p-5 rounded-3xl shadow-sm mb-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Activity size={18} className="text-teal-600"/> Hemodynamic Vitals</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
              <Line type="monotone" dataKey="hr" name="HR (bpm)" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="map" name="MAP (mmHg)" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="spo2" name="SpO2 (%)" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Inflammatory Markers Chart */}
      <div className="bg-white p-5 rounded-3xl shadow-sm mb-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><AlertTriangle size={18} className="text-amber-500"/> Inflammatory Markers</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
              <Line yAxisId="left" type="monotone" dataKey="lactate" name="Lactate (mmol/L)" stroke="#8b5cf6" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="wbc" name="WBC (x10^9/L)" stroke="#ec4899" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Timeline Table */}
      <div className="bg-white p-5 rounded-3xl shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Clock size={18} className="text-slate-600"/> Assessment Timeline</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100">
                <th className="pb-2 font-medium">Time</th>
                <th className="pb-2 font-medium">Risk</th>
                <th className="pb-2 font-medium">Lactate</th>
                <th className="pb-2 font-medium">Trend Summary</th>
              </tr>
            </thead>
            <tbody>
              {mockData.slice().reverse().map((row, idx) => (
                <tr key={idx} className="border-b border-slate-50 last:border-0">
                  <td className="py-3 font-medium text-slate-700">{row.time}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${row.mortality >= 70 ? 'bg-red-100 text-red-700' : row.mortality >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                      {row.mortality}%
                    </span>
                  </td>
                  <td className="py-3 text-slate-600">{row.lactate}</td>
                  <td className="py-3 text-slate-600 text-xs">
                    {row.treatment ? <span className="font-semibold text-blue-600">{row.treatment}. </span> : ''}
                    {idx === 0 ? 'Patient stabilizing post-antibiotics. Lactate clearing.' : 
                     idx === 1 ? 'Peak deterioration. Hemodynamic collapse imminent.' : 
                     'Gradual worsening of parameters.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
