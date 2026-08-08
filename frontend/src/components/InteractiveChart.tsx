'use client';

import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { fetchHistoricalData } from '@/services/api';
import { HistoricalPoint } from '@/types/currency';
import { Sparkles, TrendingUp } from 'lucide-react';

interface InteractiveChartProps {
  selectedPair: string;
}

export function InteractiveChart({ selectedPair }: InteractiveChartProps) {
  const [period, setPeriod] = useState<string>('1D');
  const [data, setData] = useState<HistoricalPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    fetchHistoricalData(selectedPair, period).then((points) => {
      setData(points);
      setIsLoading(false);
    });
  }, [selectedPair, period]);

  const currentRate = data.length > 0 ? data[data.length - 1].rate : 0;
  const firstRate = data.length > 0 ? data[0].rate : 0;
  const diff = currentRate - firstRate;
  const pctDiff = firstRate > 0 ? (diff / firstRate) * 100 : 0;
  const isPositive = diff >= 0;

  return (
    <div className="glass-panel p-5 sm:p-6 w-full flex flex-col justify-between relative overflow-hidden bg-zinc-950/70 border border-zinc-800/80">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-zinc-100 tracking-tight">
              Histórico & Tendência ({selectedPair})
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Live
            </span>
          </div>
          <div className="flex items-baseline gap-3 mt-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-zinc-100 tracking-tight">
              {currentRate > 0 ? currentRate.toFixed(4) : '---'}
            </span>
            <span
              className={`text-xs font-mono font-semibold flex items-center ${
                isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isPositive ? '+' : ''}
              {diff.toFixed(4)} ({pctDiff.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Period Pills */}
        <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
          {['1D', '1W', '1M', '1Y'].map((t) => (
            <button
              key={t}
              onClick={() => setPeriod(t)}
              className={`px-3 py-1 rounded-lg font-mono font-medium text-[11px] transition-all duration-200 cursor-pointer ${
                period === t
                  ? 'bg-cyan-500 text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts Area */}
      <div className="w-full h-[260px] sm:h-[300px] relative">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs font-mono animate-pulse">
            Sincronizando série histórica de cotação...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? '#10b981' : '#06b6d4'} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={isPositive ? '#10b981' : '#06b6d4'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#52525b"
                tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={['auto', 'auto']}
                stroke="#52525b"
                tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => val.toFixed(2)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#09090b',
                  borderColor: 'rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  color: '#f4f4f5',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
                formatter={(val: any) => [`R$ ${Number(val).toFixed(4)}`, 'Cotação']}
                labelStyle={{ color: '#a1a1aa', fontWeight: '600' }}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke={isPositive ? '#10b981' : '#06b6d4'}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRate)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer Meta */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-3 mt-2 border-t border-zinc-800/60">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Sincronização Pub/Sub Redis + Mercado FX Interbancário</span>
        </div>
        <span className="font-mono text-zinc-400">Par: {selectedPair}</span>
      </div>
    </div>
  );
}

