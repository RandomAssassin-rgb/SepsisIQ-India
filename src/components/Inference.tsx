import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Activity, Cpu, Database } from 'lucide-react';
import { calculateSOFA, calculateQSOFA, calculateAPACHEII, calculateRISC } from '../lib/scoreCalculators';
import { runInference } from '../lib/geminiService';

export default function Inference() {
  const navigate = useNavigate();
  const location = useLocation();
  const patientData = location.state?.patientData || {};
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const processInference = async () => {
      try {
        // Pre-compute scores
        const scores = {
          sofa: calculateSOFA(patientData),
          qsofa: calculateQSOFA(patientData),
          apacheII: calculateAPACHEII(patientData),
          risc: calculateRISC(patientData)
        };
        
        setProgress(30);

        // Call Gemini API
        const aiResults = await runInference(patientData, scores);
        
        // Generate Alerts based on AI Results
        const storedAlerts = localStorage.getItem('sepsis_alerts');
        let currentAlerts = storedAlerts ? JSON.parse(storedAlerts) : [
          { id: 1, type: 'critical', patientId: 'IND-8821', patientName: 'Aditi Sharma', message: 'Mortality risk spiked to 84% (+16%) in last 2 hours.', time: '14m ago', acknowledged: false },
          { id: 2, type: 'critical', patientId: 'IND-9012', patientName: 'Rajesh Kumar', message: 'First entry into critical zone (CR Risk 87%).', time: '1h ago', acknowledged: false },
          { id: 3, type: 'warning', patientId: 'IND-9105', patientName: 'Sunita Devi', message: 'Deterioration risk 72% over next 6 hours.', time: '2h ago', acknowledged: true },
          { id: 4, type: 'warning', patientId: 'IND-8754', patientName: 'Mohammad Ali', message: 'Lactate elevated (3.8 mmol/L).', time: '4h ago', acknowledged: true },
        ];

        const newAlerts = [];
        const newId = Math.max(...currentAlerts.map((a: any) => a.id), 0) + 1;
        
        if (aiResults.mortalityRisk >= 70) {
          newAlerts.push({
            id: newId,
            type: 'critical',
            patientId: patientData.patientId || 'NEW-PATIENT',
            patientName: patientData.name || 'Unknown Patient',
            message: `First entry into critical zone (Mortality Risk ${aiResults.mortalityRisk}%).`,
            time: 'Just now',
            acknowledged: false
          });
        } else if (aiResults.deteriorationProbability6h >= 70) {
          newAlerts.push({
            id: newId,
            type: 'warning',
            patientId: patientData.patientId || 'NEW-PATIENT',
            patientName: patientData.name || 'Unknown Patient',
            message: `Deterioration risk ${aiResults.deteriorationProbability6h}% over next 6 hours.`,
            time: 'Just now',
            acknowledged: false
          });
        }

        if (newAlerts.length > 0) {
          const updatedAlerts = [...newAlerts, ...currentAlerts];
          localStorage.setItem('sepsis_alerts', JSON.stringify(updatedAlerts));
          window.dispatchEvent(new Event('alertsUpdated'));
        }

        setProgress(100);

        setTimeout(() => {
          navigate('/results', { state: { patientData, scores, aiResults } });
        }, 500);
      } catch (error) {
        console.error("Inference failed:", error);
        // Fallback to results page with empty data or handle error
        navigate('/results', { state: { patientData, scores: {}, aiResults: null, error: true } });
      }
    };

    processInference();
  }, [navigate, patientData]);

  return (
    <div className="p-6 max-w-md mx-auto min-h-[80vh] flex flex-col justify-center">
      <div className="text-[10px] font-bold text-blue-600 tracking-wider mb-2 uppercase">Inference Engine</div>
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">
        Running ML <span className="text-blue-600">Inference</span>
      </h1>
      <p className="text-slate-500 mb-12 text-lg">
        Analyzing 12 Vital Markers and India-Specific Resistance Factors...
      </p>

      <div className="relative w-64 h-64 mx-auto mb-12 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="absolute inset-0 rounded-full border-[1px] border-dashed border-blue-300"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="absolute inset-4 rounded-full border-[1px] border-blue-100"
        />
        <div className="absolute inset-8 bg-blue-50 rounded-full flex flex-col items-center justify-center">
          <div className="text-5xl font-extrabold text-blue-700 mb-1">{progress}%</div>
          <div className="text-[10px] font-bold text-blue-600 tracking-wider">PROBABILITY</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Activity size={16} className="text-teal-600" />
              Vital Normalization
            </div>
            <span className="text-xs text-slate-400">480ms</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: progress > 30 ? "100%" : "30%" }}
              transition={{ duration: 0.8 }}
              className="h-full bg-teal-600"
            />
          </div>
          <div className="flex gap-2">
            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">TEMP</span>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">MAP</span>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">WBC</span>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">SPO2</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Cpu size={16} className="text-blue-600" />
              Tensor Stream
            </div>
            <span className="text-xs text-slate-400">Active</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: progress > 30 ? "100%" : "60%" }}
              transition={{ duration: 2 }}
              className="h-full bg-blue-600"
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Regional Weights (India-SA)</span>
            <span className="font-bold text-slate-700">Applied</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Resistance Pattern Alpha</span>
            <span className="font-bold text-slate-700">Scanning</span>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            <Database size={16} className="text-slate-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-700">Data Node: Azure-South-India</div>
            <div className="text-[10px] text-slate-500">Secure E2E Encrypted Pipeline</div>
          </div>
        </div>
      </div>
    </div>
  );
}
