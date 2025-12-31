
export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'C' | 'D';
  document?: string;
}

export interface ReconciledTransaction extends Transaction {
  payerName: string;
  category: string;
  reconciledAt: string;
  patientName?: string;
  phone?: string;
  email?: string;
}

export interface ReconcileSession {
  id: string;
  date: string;
  transactions: ReconciledTransaction[];
  totalAmount: number;
  matchingCount?: number;
}

export type AppView = 'dashboard' | 'upload' | 'reconcile' | 'history' | 'reports';

export const INITIAL_CATEGORIES = [
  'Consulta',
  'Procedimento',
  'Venda de Produtos',
  'Estética',
  'Outros'
];
