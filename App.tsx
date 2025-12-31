
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Uploader } from './components/Uploader';
import { ReconciliationTable } from './components/ReconciliationTable';
import { History } from './components/History';
import { Reports } from './components/Reports';
import { AppView, Transaction, ReconcileSession, ReconciledTransaction, INITIAL_CATEGORIES } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [sessions, setSessions] = useState<ReconcileSession[]>([]);
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);

  useEffect(() => {
    const savedSessions = localStorage.getItem('marie_sessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
    
    const savedCategories = localStorage.getItem('marie_categories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('marie_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('marie_categories', JSON.stringify(categories));
  }, [categories]);

  // Clear notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleTransactionsDetected = (transactions: Transaction[]) => {
    setPendingTransactions(transactions);
    setNotification({
      message: `${transactions.length} novos créditos identificados! Prontos para conciliar.`,
      type: 'success'
    });
    setCurrentView('reconcile');
  };

  const handleSaveReconciliation = (reconciled: ReconciledTransaction[]) => {
    const newSession: ReconcileSession = {
      id: `session-${Date.now()}`,
      date: new Date().toISOString(),
      transactions: reconciled,
      totalAmount: reconciled.reduce((acc, t) => acc + t.amount, 0)
    };
    setSessions([newSession, ...sessions]);
    setPendingTransactions([]);
    setNotification({
      message: `Conciliação de ${reconciled.length} itens salva com sucesso!`,
      type: 'success'
    });
    setCurrentView('history');
  };

  const handleAddCategory = (newCategory: string) => {
    if (!categories.includes(newCategory)) {
      setCategories(prev => [...prev, newCategory]);
    }
  };

  const handleUpdateCategory = (oldName: string, newName: string) => {
    setCategories(prev => prev.map(cat => cat === oldName ? newName : cat));
    // Optionally update existing sessions to reflect category renaming for consistency
    setSessions(prev => prev.map(session => ({
      ...session,
      transactions: session.transactions.map(t => 
        t.category === oldName ? { ...t, category: newName } : t
      )
    })));
  };

  const handleDeleteCategory = (name: string) => {
    setCategories(prev => prev.filter(cat => cat !== name));
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard sessions={sessions} onStartUpload={() => setCurrentView('upload')} />;
      case 'upload':
        return <Uploader onTransactionsDetected={handleTransactionsDetected} onCancel={() => setCurrentView('dashboard')} />;
      case 'reconcile':
        return (
          <ReconciliationTable 
            transactions={pendingTransactions} 
            categories={categories}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            onSave={handleSaveReconciliation} 
            onCancel={() => {
                setPendingTransactions([]);
                setCurrentView('dashboard');
            }}
          />
        );
      case 'history':
        return <History sessions={sessions} />;
      case 'reports':
        return <Reports sessions={sessions} />;
      default:
        return <Dashboard sessions={sessions} onStartUpload={() => setCurrentView('upload')} />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-300">
          <div className={`px-6 py-3 rounded-full shadow-2xl text-white font-medium flex items-center gap-3 ${notification.type === 'success' ? 'bg-teal-600' : 'bg-blue-600'}`}>
            <span>{notification.type === 'success' ? '✨' : 'ℹ️'}</span>
            {notification.message}
            <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-70">✕</button>
          </div>
        </div>
      )}
      {renderView()}
    </Layout>
  );
};

export default App;
