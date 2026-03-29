import React, { useState } from 'react';
import { Activity, AlertTriangle, Filter, Search, ArrowUpDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const wardPatients = [
  { id: 'IND-8821', name: 'Aditi Sharma', age: 42, bed: 'ICU-4', mortality: 84, cr: 87, status: 'critical', admitted: '2d ago' },
  { id: 'IND-9012', name: 'Rajesh Kumar', age: 55, bed: 'ICU-12', mortality: 62, cr: 45, status: 'high', admitted: '5h ago' },
  { id: 'IND-9105', name: 'Sunita Devi', age: 38, bed: 'HDU-2', mortality: 35, cr: 20, status: 'moderate', admitted: '1d ago' },
  { id: 'IND-8754', name: 'Mohammad Ali', age: 61, bed: 'ICU-1', mortality: 72, cr: 60, status: 'critical', admitted: '3d ago' },
  { id: 'IND-9201', name: 'Priya Patel', age: 29, bed: 'HDU-5', mortality: 15, cr: 10, status: 'low', admitted: '12h ago' },
];

export default function WardView() {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('mortality'); // 'mortality', 'cr', 'age', 'admitted'
  const [customPatients, setCustomPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    const loadCustomPatients = () => {
      const stored = localStorage.getItem('sepsis_patients');
      if (stored) {
        setCustomPatients(JSON.parse(stored));
      }
    };

    loadCustomPatients();
    window.addEventListener('storage', loadCustomPatients);
    return () => window.removeEventListener('storage', loadCustomPatients);
  }, []);

  const combined = [...customPatients, ...wardPatients];
  const allPatients = combined.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);

  const filteredPatients = allPatients
    .filter(p => filter === 'all' || p.status === filter)
    .filter(p => (p.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (p.id?.toLowerCase() || '').includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'mortality') return b.mortality - a.mortality;
      if (sortBy === 'cr') return b.cr - a.cr;
      if (sortBy === 'age') return b.age - a.age;
      // Simple string comparison for admitted time for demo purposes
      if (sortBy === 'admitted') return a.admitted.localeCompare(b.admitted);
      return 0;
    });

  return (
    <div className="p-6 max-w-4xl mx-auto bg-slate-50 min-h-screen">
      <div className="flex justify-between items-end mb-6">
        <div>
          <div className="text-[10px] font-bold text-blue-600 tracking-wider mb-1 uppercase">Live Monitoring</div>
          <h1 className="text-3xl font-extrabold tracking-tight">Ward View</h1>
        </div>
        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-xs font-bold">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Live Sync
        </div>
      </div>

      {/* Critical Alert Banner */}
      <div className="bg-[#c81e1e] text-white p-4 rounded-2xl shadow-md mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle size={20} />
          <span className="font-bold text-sm">2 Patients in Critical Zone (Mortality &gt; 70%)</span>
        </div>
        <Link to="/alerts" className="bg-white/20 px-3 py-1 rounded-lg text-xs font-bold hover:bg-white/30 transition">
          View Alerts
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search patients..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 sm:pb-0">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${filter === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>All</button>
          <button onClick={() => setFilter('critical')} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${filter === 'critical' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-white text-slate-600 border border-slate-200'}`}>Critical</button>
          <button onClick={() => setFilter('high')} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${filter === 'high' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-white text-slate-600 border border-slate-200'}`}>High Risk</button>
          
          <div className="relative ml-auto flex items-center">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-xl py-2 pl-4 pr-8 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="mortality">Sort: Mortality</option>
              <option value="cr">Sort: CR Risk</option>
              <option value="age">Sort: Age</option>
              <option value="admitted">Sort: Admitted</option>
            </select>
            <ArrowUpDown size={14} className="absolute right-3 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Patient Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map(p => (
          <Link to="/results" key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition block relative overflow-hidden">
            {p.status === 'critical' && (
              <div className="absolute top-0 left-0 w-full h-1 bg-[#c81e1e]"></div>
            )}
            {p.status === 'high' && (
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
            )}
            
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-slate-800">{p.name}</h3>
                <div className="text-[10px] font-bold text-slate-500 tracking-wider">{p.id} • {p.age}y</div>
              </div>
              <div className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded">
                {p.bed}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <div className="text-[9px] font-bold text-slate-400 tracking-wider mb-0.5">MORTALITY</div>
                <div className={`text-lg font-extrabold ${p.mortality >= 70 ? 'text-[#c81e1e]' : p.mortality >= 50 ? 'text-amber-600' : 'text-slate-700'}`}>
                  {p.mortality}%
                </div>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <div className="text-[9px] font-bold text-slate-400 tracking-wider mb-0.5">CR RISK</div>
                <div className={`text-lg font-extrabold ${p.cr >= 60 ? 'text-[#0066cc]' : 'text-slate-700'}`}>
                  {p.cr}%
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Activity size={12} className={p.status === 'critical' ? 'text-red-500 animate-pulse' : ''} />
                {p.status === 'critical' ? <span className="text-red-500 font-bold">Unstable</span> : 'Stable'}
              </div>
              <div>Admitted: {p.admitted}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
