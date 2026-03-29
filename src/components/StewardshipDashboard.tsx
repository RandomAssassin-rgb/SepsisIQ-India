import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, FileText, PieChart as PieChartIcon, BarChart3, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const trendData = [
  { month: 'Oct', concordant: 75, discordant: 25 },
  { month: 'Nov', concordant: 80, discordant: 20 },
  { month: 'Dec', concordant: 82, discordant: 18 },
  { month: 'Jan', concordant: 85, discordant: 15 },
  { month: 'Feb', concordant: 88, discordant: 12 },
  { month: 'Mar', concordant: 92, discordant: 8 },
];

const tierData = [
  { name: 'Reserve', value: 15, color: '#c81e1e' },
  { name: 'Carbapenem', value: 35, color: '#f59e0b' },
  { name: 'Broad Spec', value: 40, color: '#3b82f6' },
  { name: 'Standard', value: 10, color: '#10b981' },
];

const initialDiscordantCases = [
  { id: 'IND-8821', bed: 'ICU-4', crRisk: 87, prescribed: 'Meropenem', recommended: 'Polymyxin B + Tigecycline', reason: 'CR Risk > 60% with Carbapenem monotherapy' },
  { id: 'IND-9012', bed: 'ICU-12', crRisk: 42, prescribed: 'Colistin', recommended: 'Piperacillin-Tazobactam', reason: 'Reserve tier used for low CR risk' },
  { id: 'IND-9105', bed: 'HDU-2', crRisk: 75, prescribed: 'Ceftriaxone', recommended: 'Meropenem', reason: 'Standard tier used for high CR risk' },
];

export default function StewardshipDashboard() {
  const navigate = useNavigate();
  const [discordantCases, setDiscordantCases] = useState(initialDiscordantCases);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const loadDiscordantCases = () => {
      const stored = localStorage.getItem('sepsis_patients');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const customDiscordant = parsed
            .filter((p: any) => p.cr > 50) // Just an example condition
            .map((p: any) => ({
              id: p.id || `IND-${Math.floor(Math.random() * 10000)}`,
              name: p.name || 'Custom Patient',
              bed: p.bed || 'ICU-X',
              crRisk: p.cr || 0,
              prescribed: 'Standard Therapy',
              recommended: 'Escalated Therapy',
              reason: 'High CR Risk detected'
            }));
          
          const combined = [...initialDiscordantCases, ...customDiscordant];
          const unique = combined.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
          setDiscordantCases(unique);
        } catch (e) {
          console.error("Failed to parse custom patients", e);
        }
      }
    };

    loadDiscordantCases();
    window.addEventListener('storage', loadDiscordantCases);
    return () => window.removeEventListener('storage', loadDiscordantCases);
  }, []);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const doc = new jsPDF();
      
      doc.setFontSize(22);
      doc.setTextColor(0, 102, 204);
      doc.text('Antimicrobial Stewardship Report', 20, 30);
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 40);
      
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 45, 190, 45);
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Executive Summary', 20, 60);
      
      doc.setFontSize(11);
      doc.text([
        `Total Prescriptions Reviewed: 142`,
        `Overall Concordance Rate: 92%`,
        `Carbapenem Utilization: 35%`,
        `Flagged Discordant Cases: ${discordantCases.length}`
      ], 20, 70);
      
      doc.setFontSize(16);
      doc.text('Discordant Cases Requiring Review', 20, 100);
      
      let y = 110;
      discordantCases.forEach((c, i) => {
        if (y > 250) {
          doc.addPage();
          y = 30;
        }
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${i + 1}. ${c.id} (${c.bed})`, 20, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Reason: ${c.reason}`, 25, y + 5);
        doc.text(`Prescribed: ${c.prescribed} | Recommended: ${c.recommended}`, 25, y + 10);
        y += 20;
      });
      
      doc.save('Stewardship_Report.pdf');
      setIsGenerating(false);
      alert("Stewardship Report Generated Successfully and downloaded to your device.");
    }, 1500);
  };

  const filteredCases = discordantCases.filter(c => 
    (c.id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (c.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-4xl mx-auto bg-slate-50 min-h-screen">
      <div className="flex justify-between items-end mb-6">
        <div>
          <div className="text-[10px] font-bold text-teal-600 tracking-wider mb-1 uppercase">HICC Admin</div>
          <h1 className="text-3xl font-extrabold tracking-tight">Stewardship Dashboard</h1>
        </div>
        <button 
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className={`bg-[#0066cc] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm hover:bg-blue-700 transition ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generating...
            </>
          ) : (
            <>
              <FileText size={16} /> Generate Report
            </>
          )}
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-3xl shadow-sm border-l-4 border-teal-500">
          <div className="text-[10px] font-bold text-slate-500 tracking-wider mb-1">CONCORDANCE RATE</div>
          <div className="text-3xl font-extrabold text-teal-600">92%</div>
          <div className="text-xs text-slate-400 mt-1">↑ 4% from last month</div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border-l-4 border-amber-500">
          <div className="text-[10px] font-bold text-slate-500 tracking-wider mb-1">CARBAPENEM USE</div>
          <div className="text-3xl font-extrabold text-amber-600">35%</div>
          <div className="text-xs text-slate-400 mt-1">↓ 2% from last month</div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border-l-4 border-[#c81e1e]">
          <div className="text-[10px] font-bold text-slate-500 tracking-wider mb-1">DISCORDANT CASES</div>
          <div className="text-3xl font-extrabold text-[#c81e1e]">8</div>
          <div className="text-xs text-slate-400 mt-1">Active alerts requiring review</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Concordance Trend */}
        <div className="bg-white p-5 rounded-3xl shadow-sm">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><BarChart3 size={18} className="text-blue-600"/> 6-Month Concordance Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} cursor={{fill: '#f8fafc'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                <Bar dataKey="concordant" name="Concordant (%)" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                <Bar dataKey="discordant" name="Discordant (%)" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tier Utilization */}
        <div className="bg-white p-5 rounded-3xl shadow-sm">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><PieChartIcon size={18} className="text-amber-500"/> Antibiotic Tier Utilization</h3>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tierData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {tierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pr-24">
              <div className="text-center">
                <div className="text-2xl font-extrabold text-slate-800">142</div>
                <div className="text-[8px] font-bold text-slate-400 tracking-wider">TOTAL RX</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Discordant Cases List */}
      <div className="bg-white p-5 rounded-3xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg flex items-center gap-2"><ShieldAlert size={18} className="text-[#c81e1e]"/> Flagged Discordant Therapy</h3>
            <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-1 rounded-full">ACTION REQUIRED</span>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search ID or Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
        
        <div className="space-y-3">
          {filteredCases.map((c, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-800">{c.id}</span>
                  {c.name && <span className="text-xs font-bold text-slate-600">{c.name}</span>}
                  <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded">{c.bed}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.crRisk >= 60 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    CR RISK: {c.crRisk}%
                  </span>
                </div>
                <div className="text-sm text-slate-600 flex items-center gap-1 mt-2">
                  <AlertCircle size={14} className="text-[#c81e1e]" />
                  <span className="font-semibold text-[#c81e1e]">{c.reason}</span>
                </div>
              </div>
              
              <div className="flex-1 bg-white p-3 rounded-xl border border-slate-100 w-full md:w-auto">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 tracking-wider mb-0.5">PRESCRIBED</div>
                    <div className="font-semibold text-slate-700 line-through decoration-red-400">{c.prescribed}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-teal-600 tracking-wider mb-0.5">ML RECOMMENDED</div>
                    <div className="font-semibold text-teal-700">{c.recommended}</div>
                  </div>
                </div>
              </div>
              
              <Link 
                to={`/trajectory?id=${c.id}`}
                className="bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap hover:bg-slate-700 transition w-full md:w-auto text-center"
              >
                Review Case
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
