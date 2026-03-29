import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle2, Building2, User, Mail, Phone, MapPin, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function InquiryForm() {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    facilityName: '',
    contactPerson: '',
    email: '',
    phone: '',
    location: '',
    institutionType: 'Tertiary Care',
    interestArea: [] as string[],
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const interestOptions = [
    'SEPSIS INDIA 2024 Registry Participation',
    'AI-Decision Support Integration',
    'Antimicrobial Stewardship Program',
    'Clinical Research Collaboration',
    'Training & Capacity Building'
  ];

  const handleInterestToggle = (option: string) => {
    setFormData(prev => ({
      ...prev,
      interestArea: prev.interestArea.includes(option)
        ? prev.interestArea.filter(i => i !== option)
        : [...prev.interestArea, option]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit inquiry. Please try again later.');
      }

      const result = await response.json();
      if (result.success) {
        setIsSubmitted(true);
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white p-6 flex flex-col items-center justify-center text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 size={40} />
        </motion.div>
        <h1 className="text-3xl font-bold mb-4">Inquiry Received</h1>
        <p className="text-slate-600 mb-8 max-w-xs mx-auto">
          Thank you for your interest in the SepsisIQ India Research Network. Our coordination team will review your facility profile and reach out within 48 hours.
        </p>
        <button 
          onClick={() => navigate('/research')}
          className="bg-blue-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-blue-200"
        >
          Return to Research
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-4 sticky top-0 z-30 flex items-center gap-4">
        <button onClick={() => navigate('/research')} className="p-2 -ml-2 text-slate-600">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg">Research Inquiry Form</h1>
      </div>

      <div className="p-6 max-w-md mx-auto">
        <div className="bg-blue-600 rounded-3xl p-8 text-white mb-8 shadow-xl shadow-blue-100">
          <h2 className="text-2xl font-bold mb-2">Join the Network</h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            Please provide your facility details to initiate the onboarding process for the SepsisIQ India Research Network.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}
          {/* Facility Details Section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase flex items-center gap-2">
              <Building2 size={12} /> Facility Details
            </h3>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 ml-1">Hospital / Institution Name *</label>
              <input 
                required
                type="text"
                value={formData.facilityName}
                onChange={e => setFormData({...formData, facilityName: e.target.value})}
                placeholder="e.g. Apollo Hospitals, Chennai"
                className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 ml-1">Institution Type</label>
              <select 
                value={formData.institutionType}
                onChange={e => setFormData({...formData, institutionType: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
              >
                <option>Tertiary Care / Medical College</option>
                <option>Secondary Care / District Hospital</option>
                <option>Private Multi-specialty</option>
                <option>Research Institute</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 ml-1">City / Location *</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  required
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  placeholder="City, State"
                  className="w-full bg-white border border-slate-200 rounded-2xl p-4 pl-12 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Contact Details Section */}
          <div className="space-y-4 pt-4">
            <h3 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase flex items-center gap-2">
              <User size={12} /> Contact Information
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 ml-1">Contact Person Name *</label>
              <input 
                required
                type="text"
                value={formData.contactPerson}
                onChange={e => setFormData({...formData, contactPerson: e.target.value})}
                placeholder="Dr. Name Surname"
                className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 ml-1">Email Address *</label>
                <input 
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="email@hospital.com"
                  className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 ml-1">Phone Number *</label>
                <input 
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  placeholder="+91 00000 00000"
                  className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Interest Areas Section */}
          <div className="space-y-4 pt-4">
            <h3 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase flex items-center gap-2">
              <Info size={12} /> Areas of Interest
            </h3>
            <div className="space-y-2">
              {interestOptions.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleInterestToggle(option)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all text-sm flex items-center justify-between ${
                    formData.interestArea.includes(option)
                      ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  {option}
                  {formData.interestArea.includes(option) && <CheckCircle2 size={16} />}
                </button>
              ))}
            </div>
          </div>

          {/* Message Section */}
          <div className="space-y-1 pt-4">
            <label className="text-xs font-bold text-slate-700 ml-1">Additional Comments / Specific Requirements</label>
            <textarea 
              rows={4}
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
              placeholder="Tell us more about your ICU capacity or research goals..."
              className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-blue-600 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center gap-3 transition-all mt-8 ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Inquiry'} <Send size={18} className={isSubmitting ? 'animate-pulse' : ''} />
          </button>
        </form>

        <p className="text-center text-[10px] text-slate-400 mt-8 leading-relaxed">
          By submitting this form, you agree to the SepsisIQ India Research Network data privacy policy. Your information will be used solely for coordination purposes.
        </p>
      </div>
    </div>
  );
}
