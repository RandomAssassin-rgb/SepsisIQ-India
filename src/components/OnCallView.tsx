import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertTriangle, ChevronDown, ChevronUp, Bell, Activity, PhoneCall, CheckCircle2, X, Check, Send, Menu } from 'lucide-react';

const initialPatients = [
  { id: 'IND-8821', name: 'Aditi Sharma', bed: 'ICU-4', tier: 'Critical', mortality: 84, cr: 87, alerts: 3, hr: 124, map: 58, spo2: 88, lactate: 4.2 },
  { id: 'IND-9012', name: 'Rajesh Kumar', bed: 'ICU-12', tier: 'High', mortality: 62, cr: 45, alerts: 1, hr: 105, map: 68, spo2: 94, lactate: 2.4 },
  { id: 'IND-9105', name: 'Sunita Devi', bed: 'HDU-2', tier: 'Moderate', mortality: 35, cr: 20, alerts: 0, hr: 95, map: 75, spo2: 96, lactate: 1.8 },
];

export default function OnCallView() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>(initialPatients);
  const [filter, setFilter] = useState<string>('All');

  useEffect(() => {
    const loadPatients = () => {
      const stored = localStorage.getItem('sepsis_patients');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const customPatients = parsed.map((p: any) => {
            const mortality = Number(p.mortality) || 0;
            return {
              id: p.id || `IND-${Math.floor(Math.random() * 10000)}`,
              name: p.name || 'Custom Patient',
              bed: p.bed || 'ICU-X',
              tier: mortality > 70 ? 'Critical' : mortality > 40 ? 'High' : mortality > 20 ? 'Moderate' : 'Low',
              mortality: mortality,
              cr: Number(p.cr) || 0,
              alerts: p.alerts?.length || 0,
              hr: p.vitals?.hr || 90,
              map: p.vitals?.map || 70,
              spo2: p.vitals?.spo2 || 98,
              lactate: p.vitals?.lactate || 1.5
            };
          });
          
          // Combine and remove duplicates by ID
          const combined = [...initialPatients, ...customPatients];
          const unique = combined.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
          
          // Sort by mortality risk descending
          unique.sort((a, b) => b.mortality - a.mortality);
          
          setPatients(unique);
        } catch (e) {
          console.error("Failed to parse custom patients", e);
        }
      }
    };
    
    loadPatients();
    window.addEventListener('storage', loadPatients);
    return () => window.removeEventListener('storage', loadPatients);
  }, []);

  const [expandedId, setExpandedId] = useState<string | null>('IND-8821');
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [escalationLevel, setEscalationLevel] = useState('Senior Resident On-Call');
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [escalatedIds, setEscalatedIds] = useState<Set<string>>(new Set());

  const handleEscalateClick = (patient: any) => {
    setSelectedPatient(patient);
    setEscalationLevel('Senior Resident On-Call');
    setSelectedReasons([]);
    setShowEscalateModal(true);
  };

  const handleAcknowledge = () => {
    if (selectedPatient) {
      setEscalatedIds(prev => new Set(prev).add(selectedPatient.id));
    }
    setShowEscalateModal(false);
    setShowSuccessModal(true);
    
    // Auto hide success modal after 3 seconds
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 3000);
  };

  return (
    <div className="bg-slate-50 h-full text-slate-900 pb-20">
      {/* Sub-Header / Context */}
      <div className="bg-white px-4 py-4 flex justify-between items-center border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.dispatchEvent(new Event('openMobileMenu'))}
            className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors md:hidden"
          >
            <Menu size={24} />
          </button>
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shadow-sm border border-red-100">
            <PhoneCall size={20} className="text-red-600" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 leading-tight">On-Call Active</h1>
            <div className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">DR. SHARMA • ICU NIGHT SHIFT</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-red-500 w-2 h-2 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-red-600 tracking-widest uppercase">Live Node</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto gap-2 px-4 py-4 hide-scrollbar bg-white/50 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-100/50">
        <button 
          onClick={() => setFilter('All')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-sm ${filter === 'All' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
        >
          All ({patients.length})
        </button>
        <button 
          onClick={() => setFilter('Critical')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1 shadow-sm transition-all ${filter === 'Critical' ? 'bg-red-600 text-white' : 'bg-white text-red-600 border border-red-100'}`}
        >
          <AlertTriangle size={12} /> Critical ({patients.filter(p => p.tier === 'Critical').length})
        </button>
        <button 
          onClick={() => setFilter('High')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-sm transition-all ${filter === 'High' ? 'bg-orange-500 text-white' : 'bg-white text-orange-600 border border-orange-100'}`}
        >
          High ({patients.filter(p => p.tier === 'High').length})
        </button>
        <button 
          onClick={() => setFilter('Moderate')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-sm transition-all ${filter === 'Moderate' ? 'bg-slate-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
        >
          Moderate ({patients.filter(p => p.tier === 'Moderate').length})
        </button>
        <button 
          onClick={() => setFilter('Low')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-sm transition-all ${filter === 'Low' ? 'bg-slate-400 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}
        >
          Low ({patients.filter(p => p.tier === 'Low').length})
        </button>
      </div>

      {/* Patient List */}
      <div className="px-4 space-y-4 mt-2">
        {patients.filter(p => filter === 'All' || p.tier === filter).map((p) => {
          const isExpanded = expandedId === p.id;
          const isCritical = p.tier === 'Critical';
          const isEscalated = escalatedIds.has(p.id);
          
          return (
            <div key={p.id} className={`bg-white rounded-2xl overflow-hidden border transition-all ${isEscalated ? 'border-green-200 bg-green-50/10' : isCritical ? 'border-red-200 shadow-md shadow-red-50' : 'border-slate-200 shadow-sm'}`}>
              {/* Card Header */}
              <div 
                className="p-4 flex justify-between items-center cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : p.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-1.5 h-12 rounded-full ${isEscalated ? 'bg-green-500' : isCritical ? 'bg-red-500' : p.tier === 'High' ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-slate-900">{p.name}</h3>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{p.bed}</span>
                      {isEscalated && (
                        <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-1">
                          <CheckCircle2 size={10} /> Escalated
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold">
                      <span className={isCritical ? 'text-red-600' : 'text-amber-600'}>MORT: {p.mortality}%</span>
                      <span className="text-slate-500">CR: {p.cr}%</span>
                      {p.alerts > 0 && !isEscalated && (
                        <span className="flex items-center gap-1 text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                          <AlertTriangle size={10} /> {p.alerts}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-slate-400 p-2 hover:bg-slate-50 rounded-full transition-colors">
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {/* Expanded Vitals & Actions */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-50 bg-slate-50/30">
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="bg-white p-2 rounded-xl text-center border border-slate-100 shadow-sm">
                      <div className="text-[9px] font-bold text-slate-400 tracking-wider mb-0.5 uppercase">HR</div>
                      <div className={`font-bold text-base ${p.hr > 110 ? 'text-red-600' : 'text-slate-700'}`}>{p.hr}</div>
                    </div>
                    <div className="bg-white p-2 rounded-xl text-center border border-slate-100 shadow-sm">
                      <div className="text-[9px] font-bold text-slate-400 tracking-wider mb-0.5 uppercase">MAP</div>
                      <div className={`font-bold text-base ${p.map < 65 ? 'text-red-600' : 'text-slate-700'}`}>{p.map}</div>
                    </div>
                    <div className="bg-white p-2 rounded-xl text-center border border-slate-100 shadow-sm">
                      <div className="text-[9px] font-bold text-slate-400 tracking-wider mb-0.5 uppercase">SPO2</div>
                      <div className={`font-bold text-base ${p.spo2 < 92 ? 'text-red-600' : 'text-slate-700'}`}>{p.spo2}</div>
                    </div>
                    <div className="bg-white p-2 rounded-xl text-center border border-slate-100 shadow-sm">
                      <div className="text-[9px] font-bold text-slate-400 tracking-wider mb-0.5 uppercase">LACT</div>
                      <div className={`font-bold text-base ${p.lactate > 2.0 ? 'text-red-600' : 'text-slate-700'}`}>{p.lactate}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link 
                      to={`/trajectory?id=${p.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-200 transition-colors"
                    >
                      <Activity size={16} /> Full Chart
                    </Link>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEscalateClick(p); }}
                      disabled={isEscalated}
                      className={`flex-1 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
                        isEscalated 
                          ? 'bg-green-100 text-green-700 border border-green-200 shadow-none cursor-default' 
                          : isCritical 
                            ? 'bg-red-600 text-white shadow-red-100 hover:bg-red-700' 
                            : 'bg-amber-500 text-white shadow-amber-100 hover:bg-amber-600'
                      }`}
                    >
                      {isEscalated ? (
                        <>
                          <CheckCircle2 size={16} /> Escalated
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={16} /> Escalate
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Escalate Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white w-full max-w-md sm:rounded-3xl rounded-t-3xl h-[85vh] sm:h-auto flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
              <h2 className="text-xl font-bold text-slate-900">Acknowledge & Escalate</h2>
              <button onClick={() => setShowEscalateModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* Patient Info Context (Optional but good for safety) */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Patient</div>
                  <div className="font-bold text-slate-900">{selectedPatient?.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 font-medium">Location</div>
                  <div className="font-bold text-slate-900">{selectedPatient?.bed}</div>
                </div>
              </div>

              {/* Escalation Level */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Escalation Level</h3>
                <div className="space-y-2">
                  {[
                    { id: 'resident', label: 'Senior Resident On-Call' },
                    { id: 'intensivist', label: 'Intensivist Consultant' },
                    { id: 'hod', label: 'Department Head / HOD' }
                  ].map(level => (
                    <button 
                      key={level.id}
                      onClick={() => setEscalationLevel(level.label)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                        escalationLevel === level.label 
                          ? 'bg-orange-50 border-orange-200 text-orange-700 shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <PhoneCall size={18} className={escalationLevel === level.label ? 'text-orange-500' : 'text-slate-400'} />
                        <span className="font-semibold text-base">{level.label}</span>
                      </div>
                      {escalationLevel === level.label && <Check size={20} className="text-orange-500" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason for Escalation */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Reason(s) for Escalation</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Mortality risk spike >15%',
                    'Hemodynamic instability — vasopressor titration needed',
                    'Worsening respiratory status — ventilator setting review',
                    'Suspected CR organism — empiric regimen change needed',
                    'GCS declining — neurology / CT head required',
                    'Rising lactate despite resuscitation',
                    'Family conference required'
                  ].map(reason => {
                    const isSelected = selectedReasons.includes(reason);
                    return (
                      <button 
                        key={reason}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedReasons(selectedReasons.filter(r => r !== reason));
                          } else {
                            setSelectedReasons([...selectedReasons, reason]);
                          }
                        }}
                        className={`px-4 py-2.5 rounded-full text-sm transition-all border text-left ${
                          isSelected 
                            ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {reason}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <textarea 
                  placeholder="Additional clinical notes (optional)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none h-28"
                ></textarea>
              </div>
            </div>

            {/* Modal Footer (Sticky) */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <button 
                onClick={handleAcknowledge}
                disabled={selectedReasons.length === 0}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition-all ${
                  selectedReasons.length > 0
                    ? 'bg-[#8baef2] text-white shadow-md shadow-blue-200 hover:bg-blue-500'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send size={20} /> Log Escalation
              </button>
              <div className="text-center mt-3 text-xs text-slate-500">
                {selectedReasons.length === 0 ? 'Select at least one reason to escalate' : 'Ready to log'}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 border border-slate-100 shadow-2xl animate-in zoom-in-95 duration-200 relative">
            
            <button onClick={() => setShowSuccessModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                <Check size={40} className="text-green-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Escalation Logged</h2>
              <p className="text-slate-500 mb-8">Alert sent and recorded in system</p>
              
              <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-100 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-red-500" />
                  <span className="font-bold text-slate-900 text-sm">Acknowledge & Escalate</span>
                </div>
                <div className="text-sm text-slate-600">{selectedPatient?.name}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
