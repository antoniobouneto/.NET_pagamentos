'use client';

import React from 'react';
import { CurrencyRate } from '@/types/currency';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface TickerBarProps {
  rates: CurrencyRate[];
}

export function TickerBar({ rates }: TickerBarProps) {
  if (!rates || rates.length === 0) return null;

  return (
    <div className="w-full bg-zinc-950/80 border-y border-zinc-800/60 py-2.5 overflow-hidden backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center gap-4 overflow-x-auto no-scrollbar">
        
        <div className="flex items-center gap-2 text-[11px] font-semibold text-cyan-400 shrink-0 tracking-wider uppercase bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
          AO VIVO
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {rates.map((rate) => {
            const isPositive = rate.pctChange >= 0;
            return (
              <div
                key={rate.pair}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs border transition-all duration-300 ${
                  rate.flash === 'up'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : rate.flash === 'down'
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                    : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <span className="font-semibold text-zinc-200">{rate.pair}</span>
                <span className="font-mono text-zinc-100 font-medium">
                  {rate.code === 'BTC'
                    ? `R$ ${rate.bid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : rate.bid.toFixed(4)}
                </span>
                <span
                  className={`flex items-center text-[10px] font-semibold font-mono ${
                    isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {isPositive ? '+' : ''}
                  {rate.pctChange.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

