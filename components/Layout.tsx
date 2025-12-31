
import React, { useState } from 'react';
import { AppView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'upload', label: 'Novo Extrato', icon: '📤' },
    { id: 'history', label: 'Histórico', icon: '📜' },
    { id: 'reports', label: 'Relatórios', icon: '📈' },
  ];

  const handleNavigate = (view: AppView) => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-teal-600 flex items-center gap-2">
            <span className="text-3xl">🌿</span> Marie
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Conciliador</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id as AppView)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentView === item.id 
                ? 'bg-teal-50 text-teal-700 font-medium shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-900 rounded-xl p-4 text-white">
            <p className="text-xs text-slate-400">Logado como</p>
            <p className="font-medium text-sm">Administrador Marie</p>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Drawer (Overlay + Panel) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          {/* Drawer Panel */}
          <div className="relative w-72 bg-white h-full shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold text-teal-600 flex items-center gap-2">
                  <span className="text-2xl">🌿</span> Marie
                </h1>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400"
              >
                ✕
              </button>
            </div>
            
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id as AppView)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${
                    currentView === item.id 
                    ? 'bg-teal-50 text-teal-700 font-bold shadow-sm ring-1 ring-teal-100' 
                    : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-lg">{item.label}</span>
                </button>
              ))}
            </nav>
            
            <div className="p-6 border-t border-slate-100">
              <div className="bg-slate-900 rounded-2xl p-4 text-white">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Acesso Restrito</p>
                <p className="font-semibold text-sm">Admin Marie</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden bg-white/80 backdrop-blur-md p-4 border-b border-slate-200 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 bg-slate-50 rounded-xl border border-slate-100 hover:bg-teal-50 hover:border-teal-100 transition-all active:scale-90"
            >
              <span className="w-5 h-0.5 bg-slate-600 rounded-full"></span>
              <span className="w-5 h-0.5 bg-slate-600 rounded-full"></span>
              <span className="w-5 h-0.5 bg-slate-600 rounded-full"></span>
            </button>
            <h1 className="text-xl font-bold text-teal-600 flex items-center gap-1.5">
              <span>🌿</span>
              <span>Marie</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 uppercase">
              {menuItems.find(m => m.id === currentView)?.label}
            </span>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};
