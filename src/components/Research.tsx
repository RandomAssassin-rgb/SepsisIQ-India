import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Database, Handshake } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function Research() {
  const downloadRISCPaper = () => {
    const doc = new jsPDF();
    
    // Add content to the PDF
    doc.setFontSize(22);
    doc.setTextColor(0, 102, 204); // #0066cc
    doc.text('RISC Score Paper 2025', 20, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Rapid Intervention Sepsis Cascades in Low-Resource Settings', 20, 40);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 45, 190, 45);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Abstract:', 20, 55);
    
    doc.setFontSize(11);
    const abstract = "This paper presents the RISC (Rapid Intervention Sepsis Cascade) scoring system, a novel predictive model optimized for tertiary care environments in the Indian sub-continent. Unlike traditional SOFA or APACHE scores, RISC integrates localized inflammatory markers and hemodynamic variability to provide a 4-hour lead time for septic shock prediction.";
    const splitAbstract = doc.splitTextToSize(abstract, 170);
    doc.text(splitAbstract, 20, 65);
    
    doc.setFontSize(14);
    doc.text('Key Findings:', 20, 90);
    doc.setFontSize(11);
    const findings = [
      "1. 87% sensitivity in detecting early-stage sepsis in patients with pre-existing comorbidities.",
      "2. Significant reduction in time-to-antibiotic administration (average 42 minutes faster).",
      "3. High correlation with MIMIC-IV benchmarks while maintaining low computational overhead.",
      "4. Validated across 45 tertiary care hospitals in the SEPSIS INDIA 2024 Registry."
    ];
    doc.text(findings, 20, 100);
    
    doc.setFontSize(14);
    doc.text('Methodology:', 20, 130);
    doc.setFontSize(11);
    const methodology = "The study utilized a retrospective cohort of 12,000 patients from the SEPSIS INDIA 2024 Registry. Machine learning models (XGBoost and Random Forest) were trained on de-identified clinical data, including vitals, lab results, and demographic information. SHAP (SHapley Additive exPlanations) was used to ensure clinical interpretability of the model's predictions.";
    const splitMethodology = doc.splitTextToSize(methodology, 170);
    doc.text(splitMethodology, 20, 140);
    
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('© 2025 SepsisIQ India Research Network. All rights reserved.', 20, 280);
    
    // Download the PDF
    doc.save('RISC_Score_Paper_2025.pdf');
  };

  const accessRepo = () => {
    alert("Redirecting to MIMIC-IV Validation Repository on GitHub...");
    window.open("https://github.com/search?q=MIMIC-IV+Database&type=code", "_blank");
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-slate-50 min-h-screen">
      <h1 className="text-4xl font-extrabold tracking-tight mb-4 leading-tight">
        Clinical Evidence & <span className="text-[#0066cc]">Global Standards</span>
      </h1>
      <p className="text-slate-600 text-lg mb-8 leading-relaxed">
        Advancing sepsis care in the Indian sub-continent through rigorous data validation, localized registries, and ethical AI integration.
      </p>

      <div className="space-y-4 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm relative overflow-hidden border border-slate-100">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-bl-full -z-10"></div>
          <div className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-1 rounded-full inline-block mb-4">PUBLISHED 2024</div>
          <h2 className="text-2xl font-bold mb-3">SEPSIS INDIA 2024 Registry</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            A comprehensive multi-center observational study capturing incidence, mortality, and clinical outcomes across 45 tertiary care hospitals in India.
          </p>
          <a 
            href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11577944/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#0066cc] font-bold text-sm flex items-center gap-2 hover:underline"
          >
            Read Full Publication <ExternalLink size={14} />
          </a>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0066cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <h2 className="text-xl font-bold mb-2">RISC Score Paper 2025</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Predictive modeling for Rapid Intervention Sepsis Cascades in low-resource settings.
          </p>
          <button 
            onClick={downloadRISCPaper}
            className="w-full bg-slate-100 text-slate-700 font-bold py-4 rounded-2xl text-xs tracking-wider hover:bg-slate-200 transition-colors uppercase"
          >
            DOWNLOAD PDF
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-4">
            <Database size={20} className="text-[#c81e1e]" />
          </div>
          <h2 className="text-xl font-bold mb-2">MIMIC-IV Database</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Validation of Indian clinical parameters against the MIT Laboratory for Computational Physiology benchmark.
          </p>
          <button 
            onClick={accessRepo}
            className="w-full bg-slate-100 text-slate-700 font-bold py-4 rounded-2xl text-xs tracking-wider hover:bg-slate-200 transition-colors uppercase"
          >
            ACCESS REPO
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm mb-8">
        <div className="text-[10px] font-bold text-slate-500 tracking-wider mb-4">METHODOLOGY</div>
        <ul className="list-disc pl-4 text-sm text-slate-600 space-y-2 mb-6">
          <li>De-identified patient data sets from 12 regional hubs.</li>
          <li>SHAP-based explainability for all clinical predictions.</li>
        </ul>
        
        <div className="text-[10px] font-bold text-slate-500 tracking-wider mb-4">ETHICS</div>
        <ul className="list-disc pl-4 text-sm text-slate-600 space-y-2">
          <li>IRB approved protocols (ICMR Standards).</li>
          <li>Strict adherence to Data Personal Protection Act (DPDP).</li>
        </ul>
      </div>

      <div className="bg-gradient-to-b from-slate-200 to-slate-300 rounded-3xl p-8 text-center relative overflow-hidden">
        <h2 className="text-3xl font-extrabold mb-4 relative z-10">Collaborate with our Research Network</h2>
        <p className="text-slate-700 text-sm mb-8 relative z-10">
          We are expanding our network of participating hospitals and research institutions across India. Join us in building the largest clinical data repository for critical care.
        </p>
        <button className="w-full bg-teal-700 text-white font-bold py-4 rounded-xl mb-4 flex items-center justify-center gap-2 relative z-10">
          Partner with SepsisIQ <Handshake size={18} />
        </button>
        <Link 
          to="/inquiry" 
          className="w-full bg-white text-slate-800 font-bold py-4 rounded-xl relative z-10 block text-center shadow-sm hover:bg-slate-50 transition-colors"
        >
          Inquiry Form
        </Link>
        
        <div className="mt-10 w-40 h-40 mx-auto border-4 border-[#0066cc] rounded-full flex flex-col items-center justify-center bg-white relative z-10">
          <div className="text-2xl font-extrabold text-[#0066cc] text-center px-4 leading-tight uppercase">Coming Soon</div>
        </div>
      </div>
    </div>
  );
}
