'use client';

import React from 'react';
import { ConversionResult } from '@/types/currency';
import { History, ShieldCheck } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: ConversionResult[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return (
      <div className="glass-panel p-6 w-full text-center text-zinc-400 text-xs bg-zinc-950/70 border border-zinc-800/80 flex flex-col items-center justify-center min-h-[160px]">
        <History className="w-6 h-6 text-zinc-600 mb-2 opacity-60" />
        <p className="font-medium text-zinc-300">Nenhuma transação efetuada nesta sessão.</p>
        <p className="text-[11px] text-zinc-500 mt-1">
          Utilize o conversor ao lado para simular trocas de moedas em tempo real.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-5 sm:p-6 w-full space-y-4 bg-zinc-950/70 border border-zinc-800/80">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h3 className="text-base font-bold text-zinc-100 tracking-tight">Histórico de Transações</h3>
        </div>
        <span className="text-[11px] text-zinc-400 font-mono bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800">
          {transactions.length} operações
        </span>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-zinc-800/80 text-zinc-400 font-sans text-[11px] uppercase tracking-wider">
              <th className="py-2 px-3">ID</th>
              <th className="py-2 px-3">Enviado</th>
              <th className="py-2 px-3">Recebido</th>
              <th className="py-2 px-3">Cotação</th>
              <th className="py-2 px-3">Hora</th>
              <th className="py-2 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {transactions.map((tx) => (
              <tr key={tx.transactionId} className="hover:bg-zinc-900/60 transition-colors">
                <td className="py-2.5 px-3 text-cyan-400 font-bold">#{tx.transactionId}</td>
                <td className="py-2.5 px-3 text-zinc-200">
                  {tx.originalAmount.toLocaleString('pt-BR')} {tx.from}
                </td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">
                  {tx.convertedAmount.toLocaleString('pt-BR')} {tx.to}
                </td>
                <td className="py-2.5 px-3 text-zinc-400">{tx.rate}</td>
                <td className="py-2.5 px-3 text-zinc-400 font-sans">
                  {new Date(tx.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </td>
                <td className="py-2.5 px-3 text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-sans font-semibold border border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3" /> Concluído
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

