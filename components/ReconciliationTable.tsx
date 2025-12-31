
import React, { useState, useMemo } from 'react';
import { Transaction, ReconciledTransaction } from '../types';

interface ReconciliationTableProps {
  transactions: Transaction[];
  categories: string[];
  onAddCategory: (category: string) => void;
  onUpdateCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (name: string) => void;
  onSave: (reconciled: ReconciledTransaction[]) => void;
  onCancel: () => void;
}

export const ReconciliationTable: React.FC<ReconciliationTableProps> = ({ 
  transactions, 
  categories, 
  onAddCategory, 
  onUpdateCategory,
  onDeleteCategory,
  onSave, 
  onCancel 
}) => {
  const [payerNames, setPayerNames] = useState<Record<string, string>>({});
  const [patientNames, setPatientNames] = useState<Record<string, string>>({});
  const [phones, setPhones] = useState<Record<string, string>>({});
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [selectedCategories, setSelectedCategories] = useState<Record<string, string>>({});
  
  const [showAddCategoryFor, setShowAddCategoryFor] = useState<string | null>(null);
  const [newCategoryValue, setNewCategoryValue] = useState("");
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{old: string, new: string} | null>(null);

  // Filter states
  const [filterDate, setFilterDate] = useState("");
  const [filterPayer, setFilterPayer] = useState("");
  const [filterMinAmount, setFilterMinAmount] = useState<string>("");

  const handleFieldChange = (setter: React.Dispatch<React.SetStateAction<Record<string, string>>>, id: string, value: string) => {
    setter(prev => ({ ...prev, [id]: value }));
  };

  const handleCategoryChange = (id: string, cat: string) => {
    if (cat === "ADD_NEW") {
      setShowAddCategoryFor(id);
      setNewCategoryValue("");
    } else {
      setSelectedCategories(prev => ({ ...prev, [id]: cat }));
    }
  };

  const handleAddNewCategory = (id: string) => {
    const trimmed = newCategoryValue.trim();
    if (trimmed) {
      onAddCategory(trimmed);
      setSelectedCategories(prev => ({ ...prev, [id]: trimmed }));
    }
    setShowAddCategoryFor(null);
    setNewCategoryValue("");
  };

  const handleConfirmUpdate = () => {
    if (editingCategory && editingCategory.new.trim()) {
      onUpdateCategory(editingCategory.old, editingCategory.new.trim());
      const updatedSelections = { ...selectedCategories };
      Object.keys(updatedSelections).forEach(key => {
        if (updatedSelections[key] === editingCategory.old) {
          updatedSelections[key] = editingCategory.new.trim();
        }
      });
      setSelectedCategories(updatedSelections);
      setEditingCategory(null);
    }
  };

  const handleConfirm = () => {
    const finalData: ReconciledTransaction[] = transactions.map(t => ({
      ...t,
      payerName: payerNames[t.id] || "Não Identificado",
      category: selectedCategories[t.id] || "Outros",
      patientName: patientNames[t.id] || "",
      phone: phones[t.id] || "",
      email: emails[t.id] || "",
      reconciledAt: new Date().toISOString()
    }));
    onSave(finalData);
  };

  // Filtered transactions logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchDate = t.date.toLowerCase().includes(filterDate.toLowerCase());
      const currentPayer = (payerNames[t.id] || "").toLowerCase();
      const matchPayer = currentPayer.includes(filterPayer.toLowerCase());
      const matchAmount = filterMinAmount === "" || t.amount >= parseFloat(filterMinAmount);
      
      return matchDate && matchPayer && matchAmount;
    });
  }, [transactions, filterDate, filterPayer, filterMinAmount, payerNames]);

  const totalFilteredAmount = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);

  // Categorization Progress
  const categorizedCount = transactions.filter(t => !!selectedCategories[t.id]).length;
  const pendingCount = transactions.length - categorizedCount;
  const progressPercent = (categorizedCount / transactions.length) * 100;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20 relative">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Conciliar Lançamentos</h2>
          <p className="text-slate-500">Categorize e identifique os {transactions.length} créditos detectados.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex flex-col items-end mr-2">
             <div className="flex items-center gap-2 mb-1">
                {pendingCount > 0 ? (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 uppercase tracking-tighter">
                    {pendingCount} pendentes
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100 uppercase tracking-tighter">
                    Tudo categorizado ✨
                  </span>
                )}
                <span className="text-xs font-bold text-slate-400">{Math.round(progressPercent)}%</span>
             </div>
             <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-teal-500 transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
             </div>
          </div>

          <button 
            onClick={() => setIsManageModalOpen(true)}
            className="px-4 py-3 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-all active:scale-95"
          >
            <span>⚙️</span>
            <span className="hidden sm:inline">Categorias</span>
          </button>
          
          <button 
            onClick={handleConfirm}
            className={`px-6 py-3 rounded-xl font-semibold transition-all active:scale-95 shadow-lg ${
              pendingCount === 0 
              ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20' 
              : 'bg-slate-800 text-white hover:bg-slate-900 shadow-slate-900/20'
            }`}
          >
            Salvar Conciliação
          </button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Filtrar por Data</label>
          <input 
            type="text" 
            placeholder="Ex: 10/05" 
            className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/10 outline-none transition-all"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
        <div className="flex-1 w-full space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Valor Mínimo</label>
          <input 
            type="number" 
            placeholder="Ex: 500" 
            className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/10 outline-none transition-all"
            value={filterMinAmount}
            onChange={(e) => setFilterMinAmount(e.target.value)}
          />
        </div>
        <div className="flex-[2] w-full space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Buscar Pagador</label>
          <input 
            type="text" 
            placeholder="Buscar nos nomes preenchidos..." 
            className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/10 outline-none transition-all"
            value={filterPayer}
            onChange={(e) => setFilterPayer(e.target.value)}
          />
        </div>
        {(filterDate || filterPayer || filterMinAmount) && (
          <button 
            onClick={() => { setFilterDate(""); setFilterPayer(""); setFilterMinAmount(""); }}
            className="p-2 text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
            title="Limpar Filtros"
          >
            🧹
          </button>
        )}
      </div>

      {/* Management Modal */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Gerenciar Categorias</h3>
              <button onClick={() => setIsManageModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="flex-1 overflow-auto p-6 space-y-3">
              {categories.map((cat) => (
                <div key={cat} className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl group transition-all hover:bg-teal-50/50">
                  {editingCategory?.old === cat ? (
                    <div className="flex-1 flex gap-2">
                      <input 
                        autoFocus
                        type="text"
                        className="flex-1 px-3 py-1 bg-white border border-teal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        value={editingCategory.new}
                        onChange={(e) => setEditingCategory({ ...editingCategory, new: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleConfirmUpdate()}
                      />
                      <button onClick={handleConfirmUpdate} className="text-teal-600 font-bold p-1">✓</button>
                      <button onClick={() => setEditingCategory(null)} className="text-slate-400 p-1">✕</button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 font-medium text-slate-700">{cat}</span>
                      <button 
                        onClick={() => setEditingCategory({ old: cat, new: cat })}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-teal-600 transition-all"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => onDeleteCategory(cat)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all"
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100">
               <button 
                 onClick={() => setIsManageModalOpen(false)}
                 className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
               >
                 Fechar
               </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 text-slate-400 text-xs uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 font-semibold">Data / Doc</th>
                <th className="px-6 py-5 font-semibold">Banco</th>
                <th className="px-6 py-5 font-semibold">Valor</th>
                <th className="px-6 py-5 font-semibold">Identificação</th>
                <th className="px-6 py-5 font-semibold">Dados do Paciente (Opcional)</th>
                <th className="px-6 py-5 font-semibold">Categoria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Nenhum lançamento encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => {
                  const isCategorized = !!selectedCategories[t.id];
                  return (
                    <tr key={t.id} className={`hover:bg-slate-50/30 transition-colors animate-in fade-in duration-300 ${isCategorized ? '' : 'bg-amber-50/10'}`}>
                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-slate-700">{t.date}</p>
                        <p className="text-[10px] text-slate-400">{t.document || 'S/ DOC'}</p>
                      </td>
                      <td className="px-6 py-5 max-w-[150px]">
                        <p className="text-sm font-medium text-slate-600 truncate" title={t.description}>
                          {t.description}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 font-bold rounded-lg text-sm">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-5 min-w-[180px]">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Quem Pagou</label>
                          <input 
                            type="text" 
                            placeholder="Nome do pagador"
                            className="w-full px-3 py-1.5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            value={payerNames[t.id] || ''}
                            onChange={(e) => handleFieldChange(setPayerNames, t.id, e.target.value)}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-5 min-w-[280px]">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="col-span-2 space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Nome do Paciente</label>
                            <input 
                              type="text" 
                              placeholder="Nome completo"
                              className="w-full px-2 py-1 bg-white border border-slate-100 rounded-lg text-[12px] focus:outline-none focus:ring-2 focus:ring-teal-500/10"
                              value={patientNames[t.id] || ''}
                              onChange={(e) => handleFieldChange(setPatientNames, t.id, e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Telefone</label>
                            <input 
                              type="text" 
                              placeholder="(00) 00000-0000"
                              className="w-full px-2 py-1 bg-white border border-slate-100 rounded-lg text-[11px] focus:outline-none focus:ring-2 focus:ring-teal-500/10"
                              value={phones[t.id] || ''}
                              onChange={(e) => handleFieldChange(setPhones, t.id, e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">E-mail</label>
                            <input 
                              type="email" 
                              placeholder="paciente@email.com"
                              className="w-full px-2 py-1 bg-white border border-slate-100 rounded-lg text-[11px] focus:outline-none focus:ring-2 focus:ring-teal-500/10"
                              value={emails[t.id] || ''}
                              onChange={(e) => handleFieldChange(setEmails, t.id, e.target.value)}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 min-w-[180px]">
                        {showAddCategoryFor === t.id ? (
                          <div className="flex gap-1 animate-in zoom-in-95 duration-200">
                            <input
                              autoFocus
                              type="text"
                              placeholder="Nova..."
                              className="flex-1 px-3 py-1.5 bg-white border border-teal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                              value={newCategoryValue}
                              onChange={(e) => setNewCategoryValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddNewCategory(t.id);
                                if (e.key === 'Escape') setShowAddCategoryFor(null);
                              }}
                            />
                            <button 
                              onClick={() => handleAddNewCategory(t.id)}
                              className="px-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-xs"
                            >
                              ✓
                            </button>
                            <button 
                              onClick={() => setShowAddCategoryFor(null)}
                              className="px-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-200 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="relative group">
                            <select
                              value={selectedCategories[t.id] || ''}
                              onChange={(e) => handleCategoryChange(t.id, e.target.value)}
                              className={`w-full px-3 py-2 border rounded-xl text-sm font-medium transition-all appearance-none cursor-pointer group-hover:bg-slate-100/50 ${
                                isCategorized 
                                ? 'bg-slate-50/50 border-slate-100 text-slate-600' 
                                : 'bg-amber-50 border-amber-200 text-amber-700 ring-2 ring-amber-500/5'
                              }`}
                            >
                              <option value="">Categorizar...</option>
                              {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                              <hr />
                              <option value="ADD_NEW" className="text-teal-600 font-bold tracking-tight">+ Nova</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                              ▼
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-teal-900 rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-center shadow-lg gap-4">
        <div>
          <p className="text-teal-300 text-xs font-bold uppercase tracking-wider">Total {filteredTransactions.length < transactions.length ? 'Filtrado' : 'do Lote'}</p>
          <p className="text-3xl font-bold">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalFilteredAmount)}
          </p>
        </div>
        <div className="text-center md:text-right">
          <p className="text-teal-300 text-xs font-bold uppercase tracking-wider">Lançamentos Exibidos</p>
          <p className="text-3xl font-bold">{filteredTransactions.length} <span className="text-teal-500 text-sm">/ {transactions.length}</span></p>
        </div>
      </div>
    </div>
  );
};
