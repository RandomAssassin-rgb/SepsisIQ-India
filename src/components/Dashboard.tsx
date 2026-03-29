import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Thermometer, TrendingUp, ShieldAlert, PhoneCall } from 'lucide-react';
import { CaduceusIcon } from './Icons';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="inline-block bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1 rounded-full mb-6 tracking-wide">
        PRECISION MEDICINE INITIATIVE
      </div>
      
      <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight mb-6 text-slate-900">
        India's First ML-Powered Sepsis Mortality Prediction & Carbapenem Resistance Early Warning Platform
      </h1>
      
      <p className="text-slate-600 text-lg mb-8 leading-relaxed">
        A localized diagnostic intelligence layer built specifically for the Indian clinical landscape, identifying critical risks 72 hours before clinical onset.
      </p>
      
      <button 
        onClick={() => navigate('/input')}
        className="w-full bg-[#0066cc] text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-between mb-8 shadow-lg shadow-blue-200"
      >
        <span className="text-lg">Start Assessment</span>
        <ArrowRight size={20} />
      </button>

      <a href="#" className="text-[#0066cc] font-medium flex items-center gap-2 mb-10">
        Technical Documentation <span className="text-xs">↗</span>
      </a>
      
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-white p-5 rounded-2xl border-l-4 border-red-600 shadow-sm">
          <div className="text-3xl font-bold mb-1">36.3%</div>
          <div className="text-[10px] font-bold text-slate-500 tracking-wider">MORTALITY</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border-l-4 border-blue-600 shadow-sm">
          <div className="text-3xl font-bold mb-1">57%</div>
          <div className="text-[10px] font-bold text-slate-500 tracking-wider">CR BURDEN</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border-l-4 border-teal-600 shadow-sm">
          <div className="text-3xl font-bold mb-1">72hr</div>
          <div className="text-[10px] font-bold text-slate-500 tracking-wider">WINDOW</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border-l-4 border-slate-300 shadow-sm">
          <div className="text-3xl font-bold mb-1">0</div>
          <div className="text-[10px] font-bold text-slate-500 tracking-wider">INDIA-TRAINED</div>
        </div>
      </div>
      
      <div className="bg-white rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -z-10"></div>
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-[10px] font-bold text-blue-600 tracking-wider mb-1">LIVE DIAGNOSTIC NODE</div>
            <h2 className="text-2xl font-bold">Real-time Analysis</h2>
          </div>
          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
            <CaduceusIcon size={20} />
          </div>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <CaduceusIcon size={20} />
              </div>
              <div>
                <div className="text-xs text-slate-500">Lactate Levels</div>
                <div className="font-bold">2.4 mmol/L</div>
              </div>
            </div>
            <div className="text-xs font-bold text-teal-600">NORMAL</div>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                <Thermometer size={20} />
              </div>
              <div>
                <div className="text-xs text-slate-500">Temperature</div>
                <div className="font-bold">101.4 °F</div>
              </div>
            </div>
            <div className="text-xs font-bold text-red-600">FEBRILE</div>
          </div>
        </div>
        
        <div>
          <div className="text-[10px] font-bold text-slate-500 tracking-wider mb-2">MORTALITY RISK PREDICTION</div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-blue-600 w-[65%] rounded-full"></div>
          </div>
          <div className="flex justify-between text-xs font-bold text-slate-400">
            <span>LOW RISK</span>
            <span className="text-blue-600">65% Accuracy</span>
            <span>HIGH RISK</span>
          </div>
        </div>
      </div>
    </div>
  );
}
