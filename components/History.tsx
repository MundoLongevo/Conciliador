
import React, { useState, useMemo } from 'react';
import { ReconcileSession, ReconciledTransaction } from '../types';

interface HistoryProps {
  sessions: ReconcileSession[];
}

export const History: React.FC<HistoryProps> = ({ sessions }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const exportToCSV = (session: ReconcileSession) => {
    // CSV Header - Incluindo campos de paciente
    const headers = [
      'Data Banco', 
      'Documento', 
      'Descricao Original', 
      'Pagador Identificado', 
      'Paciente',
      'Telefone',
      'Email',
      'Categoria', 
      'Valor (BRL)'
    ];
    
    // CSV Rows
    const rows = session.transactions.map(t => [
      t.date,
      t.document || '',
      t.description.replace(/,/g, ';'), // Evita quebra de CSV
      t.payerName.replace(/,/g, ';'),
      (t.patientName || '').replace(/,/g, ';'),
      t.phone || '',
      t.email || '',
      t.category,
      t.amount.toString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Cria o link de download com BOM para suporte a caracteres especiais no Excel
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = `conciliacao_marie_${session.date.split('T')[0]}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Lógica de Filtragem Avançada
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;

    const query = searchQuery.toLowerCase();
    return sessions.map(session => {
      // Filtra transações que batem com a busca (incluindo dados de paciente)
      const matchingTransactions = session.transactions.filter(t => 
        t.payerName.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        (t.patientName && t.patientName.toLowerCase().includes(query)) ||
        (t.email && t.email.toLowerCase().includes(query))
      );

      if (matchingTransactions.length > 0) {
        return {
          ...session,
          matchingCount: matchingTransactions.length,
          transactions: matchingTransactions 
        };
      }
      return null;
    }).filter((s): s is (ReconcileSession & { matchingCount?: number }) => s !== null);
  }, [sessions, searchQuery]);

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
        <div className="text-6xl">📭</div>
        <h3 className="text-xl font-bold text-slate-800">Histórico Vazio</h3>
        <p className="text-slate-400">Você ainda não realizou nenhuma conciliação.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Histórico de Conciliações</h2>
          <p className="text-sm text-slate-400">Gerencie e pesquise transações passadas</p>
        </div>
        <div className="relative w-full md:w-80 group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors">🔍</span>
          <input 
            type="text" 
            placeholder="Buscar pagador, paciente, categoria..."
            className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
            >
              ✕
            </button>
          )}
        </div>
      </header>
      
      {filteredSessions.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-3">
          <p className="text-4xl">🔎</p>
          <p className="text-slate-600 font-medium">Nenhum resultado para "{searchQuery}"</p>
          <button 
            onClick={() => setSearchQuery("")}
            className="text-teal-600 text-sm font-bold hover:underline"
          >
            Limpar busca
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <div key={session.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:border-teal-100 group/card">
              <div className="w-full p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <button 
                  onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
                  className="flex-1 flex gap-6 items-center text-left"
                >
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Data do Lote</p>
                    <p className="text-lg font-bold text-slate-800">
                      {new Date(session.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="h-10 w-px bg-slate-100 hidden sm:block"></div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Total</p>
                    <p className="text-lg font-bold text-teal-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(session.totalAmount)}
                    </p>
                  </div>
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  {searchQuery && session.matchingCount !== undefined && (
                    <div className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-[10px] font-bold border border-teal-100">
                      {session.matchingCount} correspondências
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      exportToCSV(session);
                    }}
                    className="px-3 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-teal-50 hover:text-teal-700 transition-colors flex items-center gap-2 border border-slate-100 shadow-sm active:scale-95"
                    title="Exportar CSV"
                  >
                    📥 <span className="hidden sm:inline">Exportar CSV</span>
                  </button>
                  <div className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 uppercase">
                    {session.transactions.length} Itens
                  </div>
                  <button 
                    onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
                    className={`text-slate-400 p-1 transition-transform ${expandedId === session.id ? 'rotate-180' : ''}`}
                  >
                    ▼
                  </button>
                </div>
              </div>

              {expandedId === session.id && (
                <div className="p-6 pt-0 border-t border-slate-50 bg-slate-50/30 animate-in slide-in-from-top-2 duration-200">
                  <div className="overflow-x-auto">
                    <table className="w-full mt-4 min-w-[750px]">
                      <thead className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <tr>
                          <th className="pb-3 px-2">Data Banco</th>
                          <th className="pb-3 px-2">Histórico</th>
                          <th className="pb-3 px-2">Pagador / Paciente</th>
                          <th className="pb-3 px-2">Categoria</th>
                          <th className="pb-3 px-2 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {session.transactions.map((t, idx) => {
                          const isMatch = searchQuery && (
                            t.payerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (t.patientName && t.patientName.toLowerCase().includes(searchQuery.toLowerCase()))
                          );

                          return (
                            <tr key={idx} className={`border-t border-slate-100/50 hover:bg-white transition-colors ${isMatch ? 'bg-teal-50/20' : ''}`}>
                              <td className="py-3 px-2 text-slate-500 whitespace-nowrap">{t.date}</td>
                              <td className="py-3 px-2 italic text-slate-400 max-w-[120px] truncate" title={t.description}>
                                {t.description}
                              </td>
                              <td className="py-3 px-2">
                                <div className="flex flex-col">
                                  <span className={`font-semibold ${isMatch && t.payerName.toLowerCase().includes(searchQuery.toLowerCase()) ? 'text-teal-700 underline decoration-teal-300' : 'text-slate-700'}`}>
                                    {t.payerName}
                                  </span>
                                  {t.patientName && (
                                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                      👤 Paciente: {t.patientName}
                                    </span>
                                  )}
                                  {(t.phone || t.email) && (
                                    <span className="text-[9px] text-slate-400">
                                      {t.phone} {t.email && `• ${t.email}`}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-2 whitespace-nowrap">
                                 <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${isMatch && t.category.toLowerCase().includes(searchQuery.toLowerCase()) ? 'bg-teal-600 text-white' : 'bg-white border border-slate-100 text-slate-500'}`}>
                                   {t.category}
                                 </span>
                              </td>
                              <td className="py-3 px-2 text-right font-bold text-teal-600 whitespace-nowrap">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
