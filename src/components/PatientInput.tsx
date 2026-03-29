import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PatientInput() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', bed: '',
    hr: '', map: '', temp: '', rr: '', spo2: '', gcs: '',
    lactate: '', wbc: '', creatinine: '', platelets: '', age: '', icu_stay: '',
    origin: 'Community', organism: 'Unknown', source: 'Lung', shock: 'No',
    comorbidities: [] as string[], prior_carbapenem: 'No', weight: ''
  });

  const loadCriticalPreset = () => {
    setFormData({
      name: 'Rajesh Sharma', bed: 'ICU-4',
      hr: '124', map: '58', temp: '38.4', rr: '28', spo2: '88', gcs: '13',
      lactate: '4.2', wbc: '18.5', creatinine: '2.1', platelets: '95', age: '42', icu_stay: '8',
      origin: 'Nosocomial', organism: 'GN', source: 'Lung', shock: 'Yes',
      comorbidities: ['Diabetes'], prior_carbapenem: 'Yes', weight: '70'
    });
  };

  const loadModeratePreset = () => {
    setFormData({
      name: 'Sunita Devi', bed: 'HDU-2',
      hr: '105', map: '75', temp: '39.1', rr: '22', spo2: '94', gcs: '15',
      lactate: '2.1', wbc: '14.2', creatinine: '1.1', platelets: '180', age: '65', icu_stay: '0',
      origin: 'Community', organism: 'GP', source: 'Urinary', shock: 'No',
      comorbidities: ['Hypertension'], prior_carbapenem: 'No', weight: '60'
    });
  };

  const loadHighRiskPreset = () => {
    setFormData({
      name: 'Amit Patel', bed: 'ICU-12',
      hr: '118', map: '62', temp: '36.5', rr: '26', spo2: '91', gcs: '14',
      lactate: '3.8', wbc: '22.1', creatinine: '2.8', platelets: '110', age: '58', icu_stay: '12',
      origin: 'Nosocomial', organism: 'Fungal', source: 'Abdominal', shock: 'Yes',
      comorbidities: ['Diabetes', 'CKD'], prior_carbapenem: 'Yes', weight: '82'
    });
  };

  return (
    <div className="p-6 max-w-md mx-auto pb-24 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-2">Patient Assessment</h1>
      <p className="text-slate-500 mb-6">Enter clinical parameters for ML inference.</p>

      <div className="space-y-2 mb-6">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Demo Presets</div>
        <div className="grid grid-cols-1 gap-2">
          <button 
            onClick={loadCriticalPreset}
            className="w-full bg-red-50 text-red-700 font-semibold py-2 px-4 rounded-xl border border-red-200 hover:bg-red-100 transition text-sm text-left flex justify-between items-center"
          >
            <span>Rajesh, 42M (Critical)</span>
            <span className="text-xs bg-red-200 px-2 py-0.5 rounded-full">Shock</span>
          </button>
          <button 
            onClick={loadHighRiskPreset}
            className="w-full bg-amber-50 text-amber-700 font-semibold py-2 px-4 rounded-xl border border-amber-200 hover:bg-amber-100 transition text-sm text-left flex justify-between items-center"
          >
            <span>Amit, 58M (High Risk)</span>
            <span className="text-xs bg-amber-200 px-2 py-0.5 rounded-full">Fungal</span>
          </button>
          <button 
            onClick={loadModeratePreset}
            className="w-full bg-blue-50 text-blue-700 font-semibold py-2 px-4 rounded-xl border border-blue-200 hover:bg-blue-100 transition text-sm text-left flex justify-between items-center"
          >
            <span>Sunita, 65F (Moderate)</span>
            <span className="text-xs bg-blue-200 px-2 py-0.5 rounded-full">UTI</span>
          </button>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1">Patient Name</label>
            <input type="text" placeholder="e.g. John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1">Bed / Location</label>
            <input type="text" placeholder="e.g. ICU-1" value={formData.bed} onChange={e => setFormData({...formData, bed: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Age</label>
            <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Weight (kg)</label>
            <input type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Heart Rate (bpm)</label>
            <input type="number" value={formData.hr} onChange={e => setFormData({...formData, hr: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">MAP (mmHg)</label>
            <input type="number" value={formData.map} onChange={e => setFormData({...formData, map: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Lactate (mmol/L)</label>
            <input type="number" value={formData.lactate} onChange={e => setFormData({...formData, lactate: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">SpO2 (%)</label>
            <input type="number" value={formData.spo2} onChange={e => setFormData({...formData, spo2: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Temp (°C)</label>
            <input type="number" value={formData.temp} onChange={e => setFormData({...formData, temp: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Resp Rate</label>
            <input type="number" value={formData.rr} onChange={e => setFormData({...formData, rr: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">GCS</label>
            <input type="number" value={formData.gcs} onChange={e => setFormData({...formData, gcs: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">WBC</label>
            <input type="number" value={formData.wbc} onChange={e => setFormData({...formData, wbc: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Creatinine</label>
            <input type="number" value={formData.creatinine} onChange={e => setFormData({...formData, creatinine: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Platelets</label>
            <input type="number" value={formData.platelets} onChange={e => setFormData({...formData, platelets: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2" />
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Prior Carbapenem Use</label>
          <select value={formData.prior_carbapenem} onChange={e => setFormData({...formData, prior_carbapenem: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2">
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>
      </div>

      <button 
        onClick={() => navigate('/inference', { state: { patientData: formData } })}
        className="w-full bg-[#0066cc] text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-blue-200"
      >
        Run ML Inference
      </button>
    </div>
  );
}
