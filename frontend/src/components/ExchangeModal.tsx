'use client';

import React from 'react';
import { CheckCircle2, X, ArrowRight } from 'lucide-react';
import { ConversionResult } from '@/types/currency';

interface ExchangeModalProps {
  result: ConversionResult | null;
  onClose: () => void;
}

export function ExchangeModal({ result, onClose }: ExchangeModalProps) {
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        
        {/* Subtle Accent Radial */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-emerald-500/10 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 p-2 rounded-full hover:bg-zinc-900 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success Banner */}
        <div className="flex flex-col items-center text-center my-3 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-zinc-100 tracking-tight">Transação Concluída</h3>
          <p className="text-xs text-zinc-400 mt-0.5 font-sans">Comprovante digital Revolut FX</p>
        </div>

        {/* Receipt Box */}
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 space-y-2.5 font-mono text-xs my-4 relative z-10">
          
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="text-left">
              <span className="text-[10px] text-zinc-400 block font-sans uppercase">Enviado</span>
              <span className="font-bold text-zinc-100 text-sm">
                {result.originalAmount.toLocaleString('pt-BR')} {result.from}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="text-right">
              <span className="text-[10px] text-zinc-400 block font-sans uppercase">Recebido</span>
              <span className="font-bold text-cyan-300 text-sm">
                {result.convertedAmount.toLocaleString('pt-BR')} {result.to}
              </span>
            </div>
          </div>

          <div className="flex justify-between">
            <span className="text-zinc-400 font-sans">ID Transação:</span>
            <span className="text-cyan-400 font-bold">#{result.transactionId}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-zinc-400 font-sans">Taxa Aplicada:</span>
            <span className="text-zinc-200">1 {result.from} = {result.rate} {result.to}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-zinc-400 font-sans">Tarifa Revolut (0.5%):</span>
            <span className="text-emerald-400">R$ {result.feeAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between pt-2 border-t border-zinc-800/60">
            <span className="text-zinc-400 font-sans">Data & Hora:</span>
            <span className="text-zinc-400">{new Date(result.timestamp).toLocaleString('pt-BR')}</span>
          </div>

        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl font-bold bg-cyan-500 text-zinc-950 hover:bg-cyan-400 transition-all text-xs cursor-pointer shadow-md shadow-cyan-500/20"
        >
          Concluir Recibo
        </button>

      </div>
    </div>
  );
}

