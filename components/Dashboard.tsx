
import React from 'react';
import { ReconcileSession } from '../types';

interface DashboardProps {
  sessions: ReconcileSession[];
  onStartUpload: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ sessions, onStartUpload }) => {
  const totalReconciled = sessions.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalCount = sessions.reduce((acc, s) => acc + s.transactions.length, 0);
  
  const lastSessionDate = sessions.length > 0 
    ? new Date(sessions[0].date).toLocaleDateString('pt-BR') 
    : 'Nenhum';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Olá, Marie</h2>
          <p className="text-slate-500">Bem-vinda ao seu centro de conciliação financeira.</p>
        </div>
        <button 
          onClick={onStartUpload}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-teal-600/20 transition-all active:scale-95"
        >
          + Conciliar Novo Extrato
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-2xl mb-4">💰</div>
          <p className="text-slate-500 text-sm font-medium">Total Conciliado</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalReconciled)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-2xl mb-4">✅</div>
          <p className="text-slate-500 text-sm font-medium">Transações Efetivadas</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{totalCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-2xl mb-4">📅</div>
          <p className="text-slate-500 text-sm font-medium">Última Atividade</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{lastSessionDate}</p>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg">Últimas Conciliações</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {sessions.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              Nenhuma conciliação registrada ainda. Comece subindo um extrato.
            </div>
          ) : (
            sessions.slice(0, 5).map((session) => (
              <div key={session.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-500">
                    {session.transactions.length}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      Lote {new Date(session.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </p>
                    <p className="text-xs text-slate-400">{session.transactions.length} pagamentos identificados</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-teal-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(session.totalAmount)}
                  </p>
                  <p className="text-[10px] text-slate-300 uppercase tracking-tighter">Confirmado</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
