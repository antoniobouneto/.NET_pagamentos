'use client';

import React from 'react';
import { CurrencyRate } from '@/types/currency';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface RateCardProps {
  rate: CurrencyRate;
  isSelected: boolean;
  onSelect: (pair: string) => void;
}

const FLAG_EMOJIS: Record<string, string> = {
  USD: '🇺🇸',
  BRL: '🇧🇷',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  BTC: '₿',
};

export function RateCard({ rate, isSelected, onSelect }: RateCardProps) {
  const isPositive = rate.pctChange >= 0;
  const flagFrom = FLAG_EMOJIS[rate.code] || '🌐';
  const flagTo = FLAG_EMOJIS[rate.codeIn] || '🌐';

  // Range calculation
  const range = rate.high - rate.low;
  const progress = range > 0 ? Math.min(100, Math.max(0, ((rate.bid - rate.low) / range) * 100)) : 50;

  return (
    <div
      onClick={() => onSelect(rate.pair)}
      className={`cursor-pointer transition-all duration-300 p-4.5 rounded-2xl relative overflow-hidden group border ${
        isSelected
          ? 'bg-zinc-900/90 border-cyan-500/60 ring-1 ring-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.12)]'
          : 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/80'
      } ${
        rate.flash === 'up'
          ? 'flash-up-anim border-emerald-500/50'
          : rate.flash === 'down'
          ? 'flash-down-anim border-rose-500/50'
          : ''
      }`}
    >
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-cyan-500/5 blur-xl group-hover:bg-cyan-500/10 transition-all duration-300" />

      {/* Flags & Pair Info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center -space-x-1.5">
            <span className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-xs shadow-sm">
              {flagFrom}
            </span>
            <span className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-xs shadow-sm">
              {flagTo}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-zinc-100 group-hover:text-cyan-300 transition-colors">
              {rate.pair}
            </h3>
            <p className="text-[11px] text-zinc-400 truncate max-w-[90px]">{rate.name}</p>
          </div>
        </div>

        {/* Change Pill */}
        <div
          className={`flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium ${
            isPositive
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}
        >
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {isPositive ? '+' : ''}
          {rate.pctChange.toFixed(2)}%
        </div>
      </div>

      {/* Main Rate Value */}
      <div className="my-3">
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono tracking-tight text-zinc-100">
            {rate.code === 'BTC'
              ? `R$ ${rate.bid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
              : `R$ ${rate.bid.toFixed(4)}`}
          </span>
        </div>
        <div className="flex justify-between items-center text-[10px] text-zinc-400 mt-0.5 font-mono">
          <span>Venda: <strong className="text-zinc-300 font-semibold">{rate.ask.toFixed(4)}</strong></span>
        </div>
      </div>

      {/* High / Low Range Progress */}
      <div className="space-y-1 pt-2 border-t border-zinc-800/60">
        <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
          <span>Min: {rate.low.toFixed(4)}</span>
          <span>Max: {rate.high.toFixed(4)}</span>
        </div>
        <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

