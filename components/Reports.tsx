
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, 
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend 
} from 'recharts';
import { ReconcileSession } from '../types';

interface ReportsProps {
  sessions: ReconcileSession[];
}

export const Reports: React.FC<ReportsProps> = ({ sessions }) => {
  // Monthly Data
  const monthlyData = useMemo(() => {
    const data = sessions.reduce((acc: any[], session) => {
      const date = new Date(session.date);
      const month = date.toLocaleDateString('pt-BR', { month: 'short' });
      const existing = acc.find(d => d.name === month);
      if (existing) {
        existing.value += session.totalAmount;
      } else {
        acc.push({ name: month, value: session.totalAmount });
      }
      return acc;
    }, []);
    return [...data].reverse();
  }, [sessions]);

  // Daily Performance Data
  const dailyData = useMemo(() => {
    const dayMap: Record<string, number> = {};
    
    sessions.forEach(session => {
      session.transactions.forEach(t => {
        // We use the bank transaction date or the reconciliation date? 
        // Typically for "performance over time" in a clinic, the transaction date is more relevant.
        // However, the transaction date in types.ts is a string. Let's try to normalize it.
        const dateKey = t.date; // Original bank date string
        dayMap[dateKey] = (dayMap[dateKey] || 0) + t.amount;
      });
    });

    return Object.entries(dayMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
        // Simple string sort for DD/MM format if that's what's in the bank statement, 
        // or a more robust date parsing if possible.
        return a.name.localeCompare(b.name);
      });
  }, [sessions]);

  // Category Distribution
  const categoryMap: Record<string, number> = {};
  sessions.forEach(s => {
    s.transactions.forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });
  });

  const categoryData = Object.entries(categoryMap)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value }));

  // Best Category
  const topCategory = categoryData.length > 0 ? categoryData[0] : null;

  const COLORS = ['#0d9488', '#14b8a6', '#5eead4', '#99f6e4', '#ccfbf1'];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Relatórios Estratégicos</h2>
          <p className="text-slate-500">Visualize a performance da Clínica Marie por categoria e período.</p>
        </div>
        <button className="hidden md:block text-teal-600 font-bold border-b-2 border-teal-600 pb-1 text-sm hover:text-teal-700 transition-colors">
          Exportar PDF Completo
        </button>
      </header>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Destaque do Mês</p>
                <h4 className="text-2xl font-bold text-slate-800">{topCategory?.name || '---'}</h4>
                <p className="text-teal-600 font-medium text-sm mt-1">Categoria mais rentável</p>
            </div>
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-3xl">🏆</div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Média Transacional</p>
                <h4 className="text-2xl font-bold text-slate-800">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        sessions.length ? (sessions.reduce((a,b)=>a+b.totalAmount,0) / sessions.reduce((a,b)=>a+b.transactions.length,0)) : 0
                    )}
                </h4>
                <p className="text-slate-400 text-sm mt-1">Ticket médio por paciente</p>
            </div>
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl">📊</div>
        </div>
      </div>

      {/* Daily Performance Line Chart */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
        <h3 className="font-bold text-slate-800 mb-8 flex items-center gap-3">
          <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">📅</span>
          Evolução Diária de Receita
        </h3>
        <div className="h-72 mt-auto">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
              <Tooltip 
                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#0d9488" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 mb-8 flex items-center gap-3">
            <span className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600">📈</span>
            Faturamento Mensal
          </h3>
          <div className="h-72 mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc', radius: 8}} 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                />
                <Bar dataKey="value" fill="#0d9488" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Category Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 mb-8 flex items-center gap-3">
            <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">🏷️</span>
            Receita por Categoria
          </h3>
          <div className="h-72 mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                   formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Categorized List Summary */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50">
            <h3 className="font-bold text-slate-800">Detalhamento por Centro de Receita</h3>
        </div>
        <div className="divide-y divide-slate-50">
            {categoryData.length === 0 ? (
                <div className="p-12 text-center text-slate-400">Dados insuficientes para análise.</div>
            ) : (
                categoryData.map((item, idx) => (
                    <div key={idx} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}}></div>
                            <span className="font-semibold text-slate-700">{item.name}</span>
                        </div>
                        <div className="text-right">
                            <span className="font-bold text-slate-900">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                            </span>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Confirmado</p>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};
