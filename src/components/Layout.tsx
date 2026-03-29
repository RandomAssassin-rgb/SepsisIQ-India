import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Stethoscope, History, LineChart, Settings, Bell,
  Menu, X, LayoutDashboard, UserPlus, Bed, Moon, TrendingUp, Shield, BarChart2
} from 'lucide-react';
import { CaduceusIcon } from './Icons';

export default function Layout() {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const updateUnreadCount = () => {
      const storedAlerts = localStorage.getItem('sepsis_alerts');
      if (storedAlerts) {
        const alerts = JSON.parse(storedAlerts);
        setUnreadCount(alerts.filter((a: any) => !a.acknowledged).length);
      } else {
        // Fallback to initial count if not yet stored
        setUnreadCount(3);
      }
    };

    const openMenu = () => setIsMobileMenuOpen(true);

    updateUnreadCount();
    
    // Listen for changes from other components
    window.addEventListener('storage', updateUnreadCount);
    // Custom event for same-window updates
    window.addEventListener('alertsUpdated', updateUnreadCount);
    // Custom event for opening mobile menu from other components
    window.addEventListener('openMobileMenu', openMenu);
    
    return () => {
      window.removeEventListener('storage', updateUnreadCount);
      window.removeEventListener('alertsUpdated', updateUnreadCount);
      window.removeEventListener('openMobileMenu', openMenu);
    };
  }, []);

  const navItems = [
    { path: '/', icon: Stethoscope, label: 'ASSESS' },
    { path: '/history', icon: History, label: 'HISTORY' },
    { path: '/research', icon: LineChart, label: 'RESEARCH' },
    { path: '/settings', icon: Settings, label: 'SETTINGS' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white px-4 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-700 via-blue-600 to-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200/50 border border-white/20 relative group">
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CaduceusIcon size={22} className="stroke-[2px] animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="font-black text-lg leading-none tracking-tighter text-slate-900">Sepsis</span>
                <span className="font-black text-lg leading-none tracking-tighter text-blue-600">IQ</span>
                <span className="mx-1 text-slate-300 font-light">|</span>
                <span className="font-medium text-xs text-slate-400 tracking-wide uppercase">India</span>
              </div>
              <span className="text-[7px] font-black text-blue-600/50 tracking-[0.2em] uppercase mt-0.5">Precision Intelligence Node</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/alerts" className="relative">
            <Bell size={24} className="text-slate-600" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 border-white animate-pulse">
                {unreadCount}
              </div>
            )}
          </Link>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div className="relative w-[85%] max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-700 via-blue-600 to-teal-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200/50 border border-white/20 relative">
                  <CaduceusIcon size={32} className="stroke-[2px] animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="font-black text-2xl leading-none tracking-tighter text-slate-900">Sepsis</span>
                    <span className="font-black text-2xl leading-none tracking-tighter text-blue-600">IQ</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-blue-600/60 tracking-[0.15em] uppercase">India Network</span>
                    <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">v2.1.0</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/alerts" className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white border-2 border-white">
                      {unreadCount}
                    </div>
                  )}
                </Link>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Drawer Links */}
            <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
              <DrawerLink to="/" icon={LayoutDashboard} label="Dashboard" onClick={() => setIsMobileMenuOpen(false)} />
              <DrawerLink to="/input" icon={UserPlus} label="New Assessment" onClick={() => setIsMobileMenuOpen(false)} />
              <DrawerLink to="/ward" icon={Bed} label="Ward View" onClick={() => setIsMobileMenuOpen(false)} />
              <DrawerLink to="/oncall" icon={Moon} label="On-Call" onClick={() => setIsMobileMenuOpen(false)} />
              <DrawerLink to="/history" icon={History} label="History" onClick={() => setIsMobileMenuOpen(false)} />
              <DrawerLink to="/trajectory" icon={TrendingUp} label="Trajectory" onClick={() => setIsMobileMenuOpen(false)} />
              <DrawerLink to="/stewardship" icon={Shield} label="Stewardship" onClick={() => setIsMobileMenuOpen(false)} />
              <DrawerLink to="/research" icon={BarChart2} label="Analytics" onClick={() => setIsMobileMenuOpen(false)} />
              <DrawerLink to="/settings" icon={Settings} label="Settings" onClick={() => setIsMobileMenuOpen(false)} />
            </div>

            {/* Drawer Footer Summary */}
            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                      <Shield size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold leading-none">1</span>
                      <span className="text-[11px] text-slate-600 leading-tight mt-1">High CR<br/>Risk</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-500 mt-auto">CR Probability ≥60%</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                      <TrendingUp size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold leading-none">3</span>
                      <span className="text-[11px] text-slate-600 leading-tight mt-1">Total<br/>Assessed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-8">
        <Outlet />
      </main>
    </div>
  );
}

function DrawerLink({ to, icon: Icon, label, onClick }: { to: string, icon: any, label: string, onClick: () => void }) {
  const location = useLocation();
  const isMatch = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
  
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-colors ${
        isMatch 
          ? 'bg-blue-600 text-white shadow-md shadow-blue-200/50' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon size={20} className={isMatch ? 'text-white' : 'text-slate-400'} />
      <span>{label}</span>
    </Link>
  );
}
