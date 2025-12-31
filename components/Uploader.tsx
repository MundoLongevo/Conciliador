
import React, { useState, useRef } from 'react';
import { extractCreditsFromStatement } from '../geminiService';
import { Transaction } from '../types';

interface UploaderProps {
  onTransactionsDetected: (transactions: Transaction[]) => void;
  onCancel: () => void;
}

export const Uploader: React.FC<UploaderProps> = ({ onTransactionsDetected, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Process image to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = reader.result as string;
        try {
          const credits = await extractCreditsFromStatement(base64Image);
          if (credits.length === 0) {
            setError("Nenhum crédito foi identificado no extrato. Verifique se o arquivo está legível.");
          } else {
            onTransactionsDetected(credits);
          }
        } catch (err) {
          setError("Ocorreu um erro ao processar o arquivo com a IA. Tente novamente.");
          console.error(err);
        } finally {
          setIsProcessing(false);
        }
      };
    } catch (err) {
      setError("Falha ao ler o arquivo.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-12">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">Subir Extrato</h2>
        <p className="text-slate-500">Envie uma foto ou PDF do seu extrato bancário para análise automática.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center space-y-6 min-h-[400px]">
        {isProcessing ? (
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-medium text-slate-600">Marie está lendo seu extrato...</p>
            <p className="text-sm text-slate-400">Identificando recebimentos de crédito</p>
          </div>
        ) : (
          <>
            <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center text-5xl">📄</div>
            <div className="text-center">
              <p className="text-xl font-bold text-slate-800">Arraste seu extrato aqui</p>
              <p className="text-slate-400">ou clique para selecionar um arquivo</p>
            </div>
            
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
            >
              Selecionar Arquivo
            </button>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                {error}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-center">
        <button 
          onClick={onCancel}
          className="text-slate-400 font-medium hover:text-slate-600 transition-colors"
        >
          Cancelar e Voltar
        </button>
      </div>
    </div>
  );
};
