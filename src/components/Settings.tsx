import React, { useState, useEffect } from 'react';
import { Shield, Activity, BarChart2, Network, Sliders, RefreshCw, Server, Link as LinkIcon, Save, CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const [webhookUrl, setWebhookUrl] = useState('https://his.hospital.in/api/v1/sepsis-alert');
  const [authKey, setAuthKey] = useState('sk_live_9876543210');
  const [format, setFormat] = useState('HL7 FHIR R4');
  const [isEnabled, setIsEnabled] = useState(true);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [isRecalibrating, setIsRecalibrating] = useState(false);

  const handleRecalibrate = () => {
    setIsRecalibrating(true);
    setTimeout(() => {
      setIsRecalibrating(false);
      alert("System Re-Calibration Completed Successfully.");
    }, 3000);
  };

  useEffect(() => {
    const storedConfig = localStorage.getItem('his_config');
    if (storedConfig) {
      const config = JSON.parse(storedConfig);
      setWebhookUrl(config.webhookUrl || 'https://his.hospital.in/api/v1/sepsis-alert');
      setAuthKey(config.authKey || 'sk_live_9876543210');
      setFormat(config.format || 'HL7 FHIR R4');
      setIsEnabled(config.isEnabled !== undefined ? config.isEnabled : true);
    }
  }, []);

  const handleTestConnection = () => {
    setTestStatus('testing');
    setTimeout(() => {
      setTestStatus('success');
      setTimeout(() => setTestStatus('idle'), 3000);
    }, 1500);
  };

  const handleSaveConfig = () => {
    setSaveStatus('saving');
    const config = { webhookUrl, authKey, format, isEnabled };
    localStorage.setItem('his_config', JSON.stringify(config));
    setTimeout(() => {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 1000);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-slate-50 min-h-screen">
      
      <div className="bg-white rounded-3xl p-6 shadow-sm text-center mb-8 relative mt-12">
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
          <div className="relative">
            <img src="https://picsum.photos/seed/doctor/100/100" alt="Doctor" className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-sm" referrerPolicy="no-referrer" />
            <div className="absolute -bottom-2 -right-2 bg-teal-600 text-white p-1 rounded-full border-2 border-white">
              <Shield size={12} />
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-extrabold mt-12 mb-1">Dr. Ananya Sharma</h2>
        <p className="text-sm text-slate-500 font-medium mb-4">Chief Medical Officer · ICU</p>
        <p className="text-sm text-slate-600 mb-6 px-2">
          Managing Sepsis protocol oversight for AI-assisted diagnostics across Tier 1 clinical nodes in Bengaluru.
        </p>
        
        <div className="flex justify-center gap-3">
          <div className="bg-blue-50 text-blue-700 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
            <Shield size={10} /> ID: IND-9928-S
          </div>
          <div className="bg-teal-50 text-teal-700 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> South Node 04
          </div>
        </div>
      </div>

      {/* HIS/EMR Integration */}
      <div className="bg-white rounded-3xl p-6 shadow-sm mb-8 border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Server size={20} className="text-[#0066cc]" />
            <h3 className="text-lg font-bold">HIS/EMR Integration</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={isEnabled} onChange={() => setIsEnabled(!isEnabled)} />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0066cc]"></div>
          </label>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-1">WEBHOOK URL</label>
            <input 
              type="text" 
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              disabled={!isEnabled}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-1">AUTH KEY / BEARER TOKEN</label>
            <input 
              type="password" 
              value={authKey}
              onChange={(e) => setAuthKey(e.target.value)}
              disabled={!isEnabled}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 tracking-wider mb-1">PAYLOAD FORMAT</label>
            <select 
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              disabled={!isEnabled}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
            >
              <option>HL7 FHIR R4</option>
              <option>JSON (Custom)</option>
              <option>XML (Legacy)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleTestConnection}
            disabled={!isEnabled || testStatus === 'testing'}
            className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition disabled:opacity-50"
          >
            {testStatus === 'testing' ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : testStatus === 'success' ? (
              <CheckCircle2 size={16} className="text-green-600" />
            ) : (
              <LinkIcon size={16} />
            )}
            {testStatus === 'testing' ? 'Testing...' : testStatus === 'success' ? 'Connected' : 'Test Connection'}
          </button>
          <button 
            onClick={handleSaveConfig}
            disabled={!isEnabled || saveStatus === 'saving'}
            className="flex-1 bg-[#0066cc] text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saveStatus === 'saving' ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : saveStatus === 'success' ? (
              <CheckCircle2 size={16} />
            ) : (
              <Save size={16} />
            )}
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Saved' : 'Save Config'}
          </button>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
          <span className="text-slate-500">Last Push Status:</span>
          <span className="font-bold text-green-600 flex items-center gap-1"><CheckCircle2 size={12}/> Success (2m ago)</span>
        </div>
      </div>

      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="text-2xl font-bold">Model Health</h3>
          <p className="text-xs text-slate-500">Real-time performance metrics for SepsisIQ V4.2.0</p>
        </div>
        <div className="text-[10px] font-bold text-slate-400 text-right uppercase">
          Last Synced:<br/>2m ago
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <Activity size={20} />
            </div>
            <div className="bg-teal-100 text-teal-800 text-[9px] font-bold px-2 py-1 rounded-full">OPTIMAL</div>
          </div>
          <div className="text-3xl font-extrabold mb-1">42ms</div>
          <div className="text-xs text-slate-500 mb-4">Inference Latency</div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 w-[80%] rounded-full"></div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600">
              <BarChart2 size={20} />
            </div>
            <div className="bg-teal-100 text-teal-800 text-[9px] font-bold px-2 py-1 rounded-full">HIGH PRECISION</div>
          </div>
          <div className="text-3xl font-extrabold mb-1">0.941</div>
          <div className="text-xs text-slate-500 mb-4">Accuracy (AUC-ROC)</div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-600 w-[94%] rounded-full"></div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
              <Network size={20} />
            </div>
            <div className="bg-red-100 text-red-800 text-[9px] font-bold px-2 py-1 rounded-full">BALANCED</div>
          </div>
          <div className="text-3xl font-extrabold mb-1">28.4%</div>
          <div className="text-xs text-slate-500 mb-4">Node Compute Load</div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-red-600 w-[28%] rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Sliders size={20} className="text-blue-600" />
          <h3 className="text-lg font-bold">Calibration Parameters</h3>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="text-[10px] font-bold text-slate-700 tracking-wider">SENSITIVITY THRESHOLD</div>
            <div className="text-xs font-bold text-blue-600">0.85</div>
          </div>
          <input type="range" min="0" max="100" defaultValue="85" className="w-full accent-blue-600" />
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="text-[10px] font-bold text-slate-700 tracking-wider">SPECIFICITY WEIGHT</div>
            <div className="text-xs font-bold text-blue-600">0.60</div>
          </div>
          <input type="range" min="0" max="100" defaultValue="60" className="w-full accent-blue-600" />
        </div>

        <button 
          onClick={handleRecalibrate}
          disabled={isRecalibrating}
          className="w-full bg-slate-100 text-slate-700 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition disabled:opacity-50"
        >
          <RefreshCw size={18} className={isRecalibrating ? "animate-spin" : ""} /> 
          {isRecalibrating ? "Recalibrating..." : "System Re-Calibration"}
        </button>
      </div>
    </div>
  );
}
