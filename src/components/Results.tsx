import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, TrendingDown, TrendingUp, CheckCircle, PlusSquare, Info, Copy, Server, Activity, Clock, FileText, ChevronRight, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { polishNote } from '../lib/geminiService';

export default function Results() {
  const [activeTab, setActiveTab] = useState('treatment');
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishedNoteText, setPolishedNoteText] = useState('');
  const location = useLocation();
  
  const patientData = location.state?.patientData || {
    hr: '124', map: '58', temp: '38.4', rr: '28', spo2: '88', gcs: '13',
    lactate: '4.2', wbc: '18.5', creatinine: '2.1', platelets: '95', age: '42', icu_stay: '8',
    origin: 'Nosocomial', organism: 'GN', source: 'Lung', shock: 'Yes',
    comorbidities: ['Diabetes'], weight: '70'
  };

  const scores = location.state?.scores || {
    sofa: 8,
    qsofa: 2,
    apacheII: 18,
    risc: 12
  };

  const aiResults = location.state?.aiResults || {
    mortalityRisk: 84,
    crRisk: 87,
    deteriorationProb6h: 72,
    organisms: [
      { name: 'Klebsiella pneumoniae', likelihood: 45, crRiskLevel: 'High' },
      { name: 'Acinetobacter baumannii', likelihood: 30, crRiskLevel: 'High' },
      { name: 'Escherichia coli', likelihood: 15, crRiskLevel: 'Medium' }
    ],
    recommendedRegimen: [
      { drug: 'Polymyxin B', dose: '105 mg IV q12h (Loading: 175 mg)', route: 'IV', frequency: 'q12h', rationale: 'Weight-based: 1.5 mg/kg IV q12h' },
      { drug: 'Tigecycline', dose: '100 mg IV q12h (Loading: 200 mg)', route: 'IV', frequency: 'q12h', rationale: 'Standard dosing' }
    ],
    cultureRecommendations: ['Obtain blood cultures BEFORE initiating new antibiotics.'],
    escalationThresholds: [
      'Repeat Lactate in 2 hours. Escalate if > 5.0 mmol/L.',
      'Continuous MAP monitoring. Target > 65 mmHg.'
    ],
    shapExplainability: {
      riskIncreasing: [
        { factor: 'Septic Shock', impact: 0.24 },
        { factor: `Serum Lactate (${patientData.lactate} mmol/L)`, impact: 0.18 },
        { factor: 'Diabetes History', impact: 0.09 }
      ],
      protective: [
        { factor: `Age (${patientData.age}y)`, impact: 0.05 }
      ]
    },
    clinicalReasoning: 'The model identifies Septic Shock as the primary driver for the elevated mortality risk. The synergistic effect between elevated Serum Lactate and pre-existing Diabetes indicates a significantly compromised metabolic state.'
  };

  const generateProgressNote = () => {
    return `SepsisIQ Assessment - ${new Date().toLocaleString()}
Patient: IND-8829-X (${patientData.age}y)
Status: CRITICAL RISK DETECTED

Scores:
- SOFA: ${scores.sofa}
- qSOFA: ${scores.qsofa}
- APACHE II: ${scores.apacheII}
- RISC: ${scores.risc}

Vitals:
- SpO2: ${patientData.spo2}%
- HR: ${patientData.hr} bpm
- Lactate: ${patientData.lactate} mmol/L
- MAP: ${patientData.map} mmHg

AI Predictions:
- Mortality Risk: ${aiResults.mortalityRisk}%
- CR Risk: ${aiResults.crRisk}%

Top Suspected Organisms:
${aiResults.organisms?.map((org: any, i: number) => `${i + 1}. ${org.name} (${org.likelihood}% likelihood, ${org.crRiskLevel} CR Risk)`).join('\n')}

Recommended Therapy:
${aiResults.recommendedRegimen?.map((reg: any) => `- ${reg.drug}: ${reg.dose}`).join('\n')}

Monitoring Plan:
- 6h Deterioration Risk: ${aiResults.deteriorationProb6h}%
${aiResults.escalationThresholds?.map((t: string) => `- ${t}`).join('\n')}
`;
  };

  const [isProtocolAuthorized, setIsProtocolAuthorized] = useState(false);

  useEffect(() => {
    setPolishedNoteText(generateProgressNote());

    // Save patient to Ward View (localStorage)
    const savePatientToWard = () => {
      const storedPatients = localStorage.getItem('sepsis_patients');
      const patients = storedPatients ? JSON.parse(storedPatients) : [];
      
      const patientId = `IND-${Math.floor(1000 + Math.random() * 9000)}`;
      const newPatient = {
        id: patientId,
        name: patientData.name || 'Anonymous Patient',
        age: parseInt(patientData.age) || 0,
        bed: patientData.bed || 'Ward',
        mortality: aiResults.mortalityRisk,
        cr: aiResults.crRisk,
        status: aiResults.mortalityRisk >= 70 ? 'critical' : aiResults.mortalityRisk >= 50 ? 'high' : aiResults.mortalityRisk >= 20 ? 'moderate' : 'low',
        admitted: 'Just now',
        protocolAuthorized: false
      };

      // Avoid duplicates if the user refreshes
      const exists = patients.some((p: any) => p.name === newPatient.name && p.bed === newPatient.bed && p.mortality === newPatient.mortality);
      if (!exists) {
        const updatedPatients = [newPatient, ...patients];
        localStorage.setItem('sepsis_patients', JSON.stringify(updatedPatients));
        
        // Add alert
        const storedAlerts = localStorage.getItem('sepsis_alerts');
        const initialAlerts = [
          { id: 1, type: 'critical', patientId: 'IND-8821', patientName: 'Aditi Sharma', message: 'Mortality risk spiked to 84% (+16%) in last 2 hours.', time: '14m ago', acknowledged: false },
          { id: 2, type: 'critical', patientId: 'IND-9012', patientName: 'Rajesh Kumar', message: 'First entry into critical zone (CR Risk 87%).', time: '1h ago', acknowledged: false },
          { id: 3, type: 'warning', patientId: 'IND-9105', patientName: 'Sunita Devi', message: 'Deterioration risk 72% over next 6 hours.', time: '2h ago', acknowledged: true },
          { id: 4, type: 'warning', patientId: 'IND-8754', patientName: 'Mohammad Ali', message: 'Lactate elevated (3.8 mmol/L).', time: '4h ago', acknowledged: true },
        ];
        const alerts = storedAlerts ? JSON.parse(storedAlerts) : initialAlerts;
        const newAlert = {
          id: Date.now(),
          type: newPatient.status === 'critical' ? 'critical' : 'warning',
          patientId: newPatient.id,
          patientName: newPatient.name,
          message: `New assessment completed. Mortality risk: ${newPatient.mortality}%.`,
          time: 'Just now',
          acknowledged: false
        };
        localStorage.setItem('sepsis_alerts', JSON.stringify([newAlert, ...alerts]));
        window.dispatchEvent(new Event('alertsUpdated'));

        // Trigger storage event for same-window updates
        window.dispatchEvent(new Event('storage'));
      }
    };

    savePatientToWard();
  }, []);

  const handleAuthorizeProtocol = () => {
    setIsProtocolAuthorized(true);
    // Update patient in localStorage
    const storedPatients = localStorage.getItem('sepsis_patients');
    if (storedPatients) {
      try {
        const patients = JSON.parse(storedPatients);
        const updatedPatients = patients.map((p: any) => {
          if (p.name === patientData.name && p.bed === patientData.bed && p.mortality === aiResults.mortalityRisk) {
            return { ...p, protocolAuthorized: true };
          }
          return p;
        });
        localStorage.setItem('sepsis_patients', JSON.stringify(updatedPatients));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.error("Failed to update protocol status", e);
      }
    }
    alert("Protocol Authorized Successfully.");
  };

  const handlePolishNote = async () => {
    setIsPolishing(true);
    try {
      const polished = await polishNote(polishedNoteText);
      setPolishedNoteText(polished);
    } catch (error) {
      console.error("Failed to polish note:", error);
    } finally {
      setIsPolishing(false);
    }
  };

  const [showHisDropdown, setShowHisDropdown] = useState(false);

  const handlePushToEMR = (target: string) => {
    alert(`Successfully pushed data to ${target}.`);
    setShowHisDropdown(false);
  };

  return (
    <div className="pb-8 bg-slate-50 min-h-screen">
      {/* Critical Risk Banner */}
      <div className="bg-[#c81e1e] text-white p-4 pt-8 pb-6 rounded-b-3xl shadow-lg mb-6 sticky top-0 z-20">
        <div className="flex items-start justify-between max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <AlertTriangle size={24} className="text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">Critical Risk Detected</h2>
              <p className="text-white/80 text-sm">Patient ID: IND-8829-X • Last Updated: 2m ago</p>
            </div>
          </div>
          <div className="relative">
            <button onClick={() => setShowHisDropdown(!showHisDropdown)} className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition flex items-center gap-1" title="Push to HIS/EMR">
              <Server size={20} className="text-white" />
            </button>
            {showHisDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                <div className="px-3 py-2 text-xs font-bold text-slate-500 bg-slate-50 border-b border-slate-100">Select Target System</div>
                <button onClick={() => handlePushToEMR('Epic (HL7 FHIR)')} className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition">Epic (HL7 FHIR)</button>
                <button onClick={() => handlePushToEMR('Cerner (JSON)')} className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition">Cerner (JSON)</button>
                <button onClick={() => handlePushToEMR('Local HIS (XML)')} className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition border-t border-slate-100">Local HIS (XML)</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 max-w-md mx-auto space-y-6">
        
        {/* Score Cards */}
        <div className="grid grid-cols-4 gap-2 mb-2">
          <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 text-center relative group">
            <div className="text-[9px] font-bold text-slate-500 tracking-wider mb-1">SOFA</div>
            <div className={`text-lg font-extrabold ${scores.sofa >= 8 ? 'text-[#c81e1e]' : 'text-slate-800'}`}>{scores.sofa}</div>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-xs p-2 rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none z-30">
              <div className="font-bold mb-1 border-b border-slate-600 pb-1">SOFA Breakdown</div>
              <div className="flex justify-between"><span>Resp:</span><span>{patientData.spo2 < 90 ? 2 : patientData.spo2 < 95 ? 1 : 0}</span></div>
              <div className="flex justify-between"><span>Coag:</span><span>{patientData.platelets < 50 ? 3 : patientData.platelets < 100 ? 2 : patientData.platelets < 150 ? 1 : 0}</span></div>
              <div className="flex justify-between"><span>Liver:</span><span>0</span></div>
              <div className="flex justify-between"><span>CV:</span><span>{patientData.map < 70 ? 1 : 0}</span></div>
              <div className="flex justify-between"><span>CNS:</span><span>{patientData.gcs < 6 ? 4 : patientData.gcs < 10 ? 3 : patientData.gcs < 13 ? 2 : patientData.gcs < 15 ? 1 : 0}</span></div>
              <div className="flex justify-between"><span>Renal:</span><span>{patientData.creatinine > 5.0 ? 4 : patientData.creatinine > 3.5 ? 3 : patientData.creatinine > 2.0 ? 2 : patientData.creatinine > 1.2 ? 1 : 0}</span></div>
            </div>
          </div>
          <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 text-center relative group">
            <div className="text-[9px] font-bold text-slate-500 tracking-wider mb-1">qSOFA</div>
            <div className={`text-lg font-extrabold ${scores.qsofa >= 2 ? 'text-amber-600' : 'text-slate-800'}`}>{scores.qsofa}</div>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-40 bg-slate-800 text-white text-xs p-2 rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none z-30">
              <div className="font-bold mb-1 border-b border-slate-600 pb-1">qSOFA Breakdown</div>
              <div className="flex justify-between"><span>RR &ge; 22:</span><span>{patientData.rr >= 22 ? 'Yes (1)' : 'No (0)'}</span></div>
              <div className="flex justify-between"><span>GCS &lt; 15:</span><span>{patientData.gcs < 15 ? 'Yes (1)' : 'No (0)'}</span></div>
              <div className="flex justify-between"><span>SBP &le; 100:</span><span>{patientData.map < 65 ? 'Yes (1)' : 'No (0)'}</span></div>
            </div>
          </div>
          <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 text-center relative group">
            <div className="text-[9px] font-bold text-slate-500 tracking-wider mb-1">APACHE II</div>
            <div className={`text-lg font-extrabold ${scores.apacheII >= 15 ? 'text-[#c81e1e]' : 'text-slate-800'}`}>{scores.apacheII}</div>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-xs p-2 rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none z-30">
              <div className="font-bold mb-1 border-b border-slate-600 pb-1">APACHE II Factors</div>
              <div>Age, Temp, MAP, HR, RR, Oxygenation, Arterial pH, Na, K, Creatinine, Hct, WBC, GCS</div>
            </div>
          </div>
          <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 text-center relative group">
            <div className="text-[9px] font-bold text-slate-500 tracking-wider mb-1">RISC</div>
            <div className={`text-lg font-extrabold ${scores.risc >= 10 ? 'text-[#c81e1e]' : 'text-slate-800'}`}>{scores.risc}</div>
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-800 text-white text-xs p-2 rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none z-30">
              <div className="font-bold mb-1 border-b border-slate-600 pb-1">RISC Factors</div>
              <div className="flex justify-between"><span>Lactate &gt; 4:</span><span>{patientData.lactate > 4.0 ? '+4' : patientData.lactate > 2.0 ? '+2' : '0'}</span></div>
              <div className="flex justify-between"><span>Shock:</span><span>{patientData.shock === 'Yes' ? '+5' : '0'}</span></div>
              <div className="flex justify-between"><span>ICU &gt; 5d:</span><span>{patientData.icu_stay > 5 ? '+3' : '0'}</span></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-200 p-1 rounded-xl mb-6">
          <button 
            onClick={() => setActiveTab('treatment')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'treatment' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
          >
            Treatment
          </button>
          <button 
            onClick={() => setActiveTab('explain')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'explain' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
          >
            Explainability
          </button>
          <button 
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'timeline' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
          >
            Timeline
          </button>
        </div>

        {activeTab === 'explain' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Mortality Risk Gauge */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border-l-4 border-[#c81e1e]">
              <div className="text-[10px] font-bold text-slate-500 tracking-wider text-center mb-4">MORTALITY RISK</div>
              
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                  <motion.circle 
                    cx="50" cy="50" r="40" fill="none" stroke="#c81e1e" strokeWidth="12"
                    strokeDasharray="251.2"
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * (aiResults.mortalityRisk / 100)) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-extrabold text-[#c81e1e]">{aiResults.mortalityRisk}<span className="text-2xl">%</span></div>
                  <div className="text-[8px] font-bold text-slate-400 tracking-widest mt-1">PROBABILITY</div>
                </div>
              </div>
              
              <p className="text-center text-sm text-slate-600 px-4">
                High correlation with escalating <span className="font-bold text-slate-800">Lactate</span> levels and declining <span className="font-bold text-slate-800">MAP</span>.
              </p>
            </div>

            {/* Resistance Probability Gauge */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border-l-4 border-[#0066cc]">
              <div className="text-[10px] font-bold text-slate-500 tracking-wider text-center mb-4">RESISTANCE PROBABILITY</div>
              
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                  <motion.circle 
                    cx="50" cy="50" r="40" fill="none" stroke="#0066cc" strokeWidth="12"
                    strokeDasharray="251.2"
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * (aiResults.crRisk / 100)) }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-extrabold text-[#0066cc]">{aiResults.crRisk}<span className="text-2xl">%</span></div>
                  <div className="text-[8px] font-bold text-slate-400 tracking-widest mt-1">MULTIDRUG-R</div>
                </div>
              </div>
              
              <p className="text-center text-sm text-slate-600 px-4">
                Likely <span className="font-bold text-slate-800">ESBL-producing</span> pathogen based on regional antibiogram.
              </p>
            </div>

            {/* SHAP Mortality Explainability */}
            <div className="mt-8">
              <div className="text-[10px] font-bold text-blue-600 tracking-wider mb-1 uppercase">DIAGNOSTIC INSIGHT</div>
              <h2 className="text-2xl font-extrabold tracking-tight mb-4">SHAP Explainability</h2>
              
              <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
                <div className="flex justify-between items-end mb-8">
                  <h3 className="font-bold text-lg leading-tight">Feature<br/>Contributions</h3>
                  <div className="flex gap-3 text-[10px] font-bold">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#c81e1e]"></div>Risk Increase</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-teal-600"></div>Protective</div>
                  </div>
                </div>

                <div className="space-y-6">
                  {aiResults.shapExplainability?.riskIncreasing?.map((item: any, index: number) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-700">{item.factor}</span>
                        <span className="font-bold text-[#c81e1e]">+{item.impact}</span>
                      </div>
                      <div className="h-6 bg-slate-50 rounded flex">
                        <div className="w-[30%]"></div>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${item.impact * 100}%` }} className="h-full bg-[#c81e1e]/90" />
                      </div>
                    </div>
                  ))}
                  {aiResults.shapExplainability?.protective?.map((item: any, index: number) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-700">{item.factor}</span>
                        <span className="font-bold text-teal-600">-{item.impact}</span>
                      </div>
                      <div className="h-6 bg-slate-50 rounded flex">
                        <div className="w-[75%]"></div>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${item.impact * 100}%` }} className="h-full bg-teal-600/90" />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between text-xs font-bold text-slate-500 tracking-wider">
                  <span>BASE MORTALITY RATE</span>
                  <span>0.38</span>
                </div>
              </div>

              <div className="bg-[#0066cc] text-white rounded-3xl p-6 shadow-md">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <Info size={20} />
                </div>
                <h3 className="text-xl font-bold mb-3">Clinical Reasoning</h3>
                <p className="text-white/90 text-sm leading-relaxed mb-6">
                  {aiResults.clinicalReasoning}
                </p>
                <div className="border-t border-white/20 pt-4">
                  <div className="text-[10px] font-bold text-white/60 tracking-wider mb-2 uppercase">Actionable Priority</div>
                  <p className="font-bold text-sm">Immediate hemodynamic stabilization and aggressive fluid resuscitation required.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'treatment' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            {/* Vitals Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 tracking-wider mb-1">SPO2</div>
                  <div className="text-xl font-bold">{patientData.spo2}%</div>
                </div>
                <TrendingDown size={20} className="text-red-500" />
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 tracking-wider mb-1">HEART RATE</div>
                  <div className="text-xl font-bold">{patientData.hr} <span className="text-xs font-normal text-slate-400">bpm</span></div>
                </div>
                <TrendingUp size={20} className="text-red-500" />
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 tracking-wider mb-1">LACTATE</div>
                  <div className="text-xl font-bold">{patientData.lactate} <span className="text-xs font-normal text-slate-400">mmol/L</span></div>
                </div>
                <TrendingUp size={20} className="text-red-500" />
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 tracking-wider mb-1">MAP</div>
                  <div className="text-xl font-bold">{patientData.map} <span className="text-xs font-normal text-slate-400">mmHg</span></div>
                </div>
                <TrendingDown size={20} className="text-red-500" />
              </div>
            </div>

            {/* Monitoring & Escalation */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity size={20} className="text-amber-500" />
                  <h3 className="font-bold text-lg">Monitoring & Escalation</h3>
                </div>
                <div className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                  6H RISK: {aiResults.deteriorationProb6h}%
                </div>
              </div>
              <ul className="space-y-3 text-sm text-slate-600">
                {aiResults.escalationThresholds?.map((threshold: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5"></div>
                    <span>{threshold}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Organism Differential */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold text-lg mb-4">Organism Differential</h3>
              <div className="space-y-4">
                {aiResults.organisms?.map((org: any, index: number) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-bold text-slate-800">{org.name}</span>
                      <span className="font-bold text-slate-500">{org.likelihood}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${org.crRiskLevel === 'High' ? 'bg-blue-600' : org.crRiskLevel === 'Medium' ? 'bg-blue-400' : 'bg-blue-300'} w-[${org.likelihood}%] rounded-full`} style={{ width: `${org.likelihood}%` }}></div>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${org.crRiskLevel === 'High' ? 'text-[#c81e1e] bg-red-50' : org.crRiskLevel === 'Medium' ? 'text-amber-600 bg-amber-50' : 'text-green-600 bg-green-50'}`}>
                        {org.crRiskLevel.toUpperCase()} CR RISK
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="bg-red-100 p-6 rounded-3xl">
               <div className="w-10 h-10 bg-[#c81e1e] rounded-xl flex items-center justify-center mb-4">
                  <AlertTriangle size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-red-900 mb-2">Avoid Standard Carbapenems — Initiate Broad Combination Therapy</h3>
                <p className="text-red-800 text-sm">Patient shows {aiResults.crRisk}% probability of Carbapenem-Resistant Enterobacteriaceae (CRE).</p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div className="text-xs font-bold text-slate-500 tracking-wider">RECOMMENDED REGIMEN</div>
                <div className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-1 rounded-full">PRIORITY 1</div>
              </div>

              {aiResults.recommendedRegimen?.map((regimen: any, index: number) => (
                <div key={index} className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100 relative overflow-hidden">
                  {regimen.rationale?.includes('Weight') && <div className="absolute top-0 right-0 bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-1 rounded-bl-lg">WEIGHT ADJ</div>}
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-blue-800 text-lg">{regimen.drug}</h4>
                    <PlusSquare size={16} className="text-blue-600" />
                  </div>
                  <p className="text-xs text-slate-600 mb-2">{regimen.rationale}</p>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-800">
                    Dose: {regimen.dose}<br/>
                  </div>
                </div>
              ))}

              <div className="border-t border-slate-100 pt-4">
                <div className="text-[10px] font-bold text-slate-500 tracking-wider mb-2">CULTURE RECOMMENDATIONS</div>
                <ul className="text-sm text-slate-600 leading-relaxed list-disc pl-4 space-y-1">
                  {aiResults.cultureRecommendations?.map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Authorize Protocol */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-teal-100 text-center">
              <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} className="text-teal-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Authorize Protocol</h3>
              <p className="text-sm text-slate-500 mb-6 px-4">
                Immediate initiation of the India-Specific Sepsis Protocol with localized antibiotic stewardship.
              </p>
            <button 
                onClick={handleAuthorizeProtocol}
                disabled={isProtocolAuthorized}
                className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 ${
                  isProtocolAuthorized 
                    ? 'bg-teal-100 text-teal-700 border border-teal-200 shadow-none cursor-default' 
                    : 'bg-gradient-to-r from-teal-700 to-teal-400 text-white shadow-teal-200 hover:opacity-90'
                }`}
              >
                {isProtocolAuthorized ? 'Protocol Authorized' : 'Authorize Protocol'}
              </button>
            </div>

            {/* EMR Progress Note */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText size={20} className="text-slate-600" />
                  <h3 className="font-bold text-lg">EMR Progress Note</h3>
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(polishedNoteText)}
                  className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline"
                >
                  <Copy size={14} /> Copy
                </button>
              </div>
              <textarea 
                className="w-full h-48 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                value={polishedNoteText}
                onChange={(e) => setPolishedNoteText(e.target.value)}
              />
              <button 
                onClick={handlePolishNote}
                disabled={isPolishing}
                className="w-full mt-3 bg-blue-50 text-blue-700 font-bold py-2.5 rounded-xl text-sm hover:bg-blue-100 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPolishing ? <Loader2 size={16} className="animate-spin" /> : '✨'} 
                {isPolishing ? 'Polishing...' : 'AI Polish Note'}
              </button>
            </div>

          </motion.div>
        )}

        {activeTab === 'timeline' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold text-lg mb-6">72-Hour Risk Timeline</h3>
              
              <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center border-4 border-white">
                    <Activity size={16} className="text-[#c81e1e]" />
                  </div>
                  <div className="pl-8">
                    <div className="text-xs font-bold text-slate-500 mb-1">Now</div>
                    <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                      <div className="font-bold text-[#c81e1e] mb-1">Critical Risk Detected</div>
                      <div className="text-xs text-slate-600">Mortality risk spiked to {aiResults.mortalityRisk}%. Lactate {patientData.lactate}.</div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center border-4 border-white">
                    <Clock size={16} className="text-amber-600" />
                  </div>
                  <div className="pl-8">
                    <div className="text-xs font-bold text-slate-500 mb-1">-2 Hours</div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                      <div className="font-bold text-slate-800 mb-1">Deterioration Warning</div>
                      <div className="text-xs text-slate-600">MAP dropped below 65. Fluid bolus initiated.</div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border-4 border-white">
                    <FileText size={16} className="text-slate-500" />
                  </div>
                  <div className="pl-8">
                    <div className="text-xs font-bold text-slate-500 mb-1">-12 Hours</div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                      <div className="font-bold text-slate-800 mb-1">Admission</div>
                      <div className="text-xs text-slate-600">Admitted to ICU from ER. Initial SOFA: {scores.sofa - 2 > 0 ? scores.sofa - 2 : 0}.</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <Link to="/trajectory" className="text-blue-600 text-sm font-bold flex items-center justify-center gap-1 hover:underline">
                  View Full Trajectory <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
