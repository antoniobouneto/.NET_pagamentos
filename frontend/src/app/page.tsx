'use client';

import React, { useState, useEffect } from 'react';
import { useLiveRates } from '@/hooks/useLiveRates';
import { fetchSystemStatus, fetchLatestRates } from '@/services/api';
import { SystemStatus, ConversionResult } from '@/types/currency';
import { Header } from '@/components/Header';
import { TickerBar } from '@/components/TickerBar';
import { RateCard } from '@/components/RateCard';
import { InteractiveChart } from '@/components/InteractiveChart';
import { ConverterWidget } from '@/components/ConverterWidget';
import { ExchangeModal } from '@/components/ExchangeModal';
import { TransactionHistory } from '@/components/TransactionHistory';
import { RedisStatusWidget } from '@/components/RedisStatusWidget';
import { Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';

export default function Home() {
  const { rates, isConnected, lastUpdated } = useLiveRates();
  const [selectedPair, setSelectedPair] = useState<string>('USD/BRL');
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [transactions, setTransactions] = useState<ConversionResult[]>([]);
  const [activeReceipt, setActiveReceipt] = useState<ConversionResult | null>(null);

  useEffect(() => {
    fetchSystemStatus().then(setSystemStatus);
  }, []);

  const handleManualRefresh = () => {
    fetchLatestRates();
    fetchSystemStatus().then(setSystemStatus);
  };

  const handleExecuteExchange = (result: ConversionResult) => {
    setTransactions((prev) => [result, ...prev]);
    setActiveReceipt(result);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-cyan-500 selection:text-zinc-950 pb-20">
      
      {/* Vercel-Style Top Navigation */}
      <Header
        isConnected={isConnected}
        systemStatus={systemStatus}
        lastUpdated={lastUpdated}
        onRefresh={handleManualRefresh}
      />

      {/* Real-time Ticker Bar */}
      <TickerBar rates={rates} />

      {/* Main App Container */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 mt-6 space-y-6">
        
        {/* Hero Section Banner */}
        <div className="p-6 sm:p-7 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 relative overflow-hidden shadow-2xl backdrop-blur-xl">
          {/* Subtle Radial Accents */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> Revolut FX Live Engine
                </span>
                <span className="text-[11px] font-mono text-zinc-400">SignalR WebSockets + Redis</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight text-balance">
                Cotações em Tempo Real: Real, Dólar, Euro e Bitcoin
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 text-balance leading-relaxed">
                Plataforma de alta performance para monitoramento de câmbio interbancário e conversões instantâneas sincronizadas via <strong>Redis Pub/Sub</strong> e backend em <strong>.NET 8 WebAPI</strong>.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-zinc-300">Rate-Freeze 30s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Currency Cards Section */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono">
              Cotações em Destaque
            </h2>
            <span className="text-[11px] text-zinc-400">Selecione um par para expandir o gráfico</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {rates.map((rate) => (
              <RateCard
                key={rate.pair}
                rate={rate}
                isSelected={selectedPair === rate.pair}
                onSelect={setSelectedPair}
              />
            ))}
          </div>
        </section>

        {/* Middle Section: Chart & FX Converter */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <InteractiveChart selectedPair={selectedPair} />
          </div>
          <div>
            <ConverterWidget rates={rates} onExecuteExchange={handleExecuteExchange} />
          </div>
        </section>

        {/* Bottom Section: Transaction History & Infrastructure Status */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <TransactionHistory transactions={transactions} />
          </div>
          <div>
            <RedisStatusWidget status={systemStatus} />
          </div>
        </section>

      </div>

      {/* Receipt Modal */}
      <ExchangeModal result={activeReceipt} onClose={() => setActiveReceipt(null)} />

    </main>
  );
}

