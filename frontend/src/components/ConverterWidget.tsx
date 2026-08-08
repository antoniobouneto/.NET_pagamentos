'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Clock, ShieldCheck, Zap } from 'lucide-react';
import { convertCurrency } from '@/services/api';
import { ConversionResult, CurrencyRate } from '@/types/currency';

interface ConverterWidgetProps {
  rates: CurrencyRate[];
  onExecuteExchange: (result: ConversionResult) => void;
}

const SUPPORTED_CURRENCIES = [
  { code: 'BRL', name: 'Real Brasileiro', flag: '🇧🇷' },
  { code: 'USD', name: 'Dólar Americano', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'Libra Esterlina', flag: '🇬🇧' },
  { code: 'BTC', name: 'Bitcoin', flag: '₿' }
];

export function ConverterWidget({ rates, onExecuteExchange }: ConverterWidgetProps) {
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('BRL');
  const [fromAmount, setFromAmount] = useState<string>('100');
  const [conversion, setConversion] = useState<ConversionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(30);

  // Auto-calculate conversion
  useEffect(() => {
    const amountNum = parseFloat(fromAmount) || 0;
    if (amountNum <= 0) {
      setConversion(null);
      return;
    }

    setIsLoading(true);
    convertCurrency({
      from: fromCurrency,
      to: toCurrency,
      amount: amountNum
    }).then(res => {
      setConversion(res);
      setIsLoading(false);
      setTimeLeft(30);
    });
  }, [fromCurrency, toCurrency, fromAmount, rates]);

  // Rate Freeze countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 30));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleConfirmExchange = () => {
    if (conversion && conversion.originalAmount > 0) {
      onExecuteExchange(conversion);
    }
  };

  return (
    <div className="glass-panel p-5 sm:p-6 w-full flex flex-col justify-between border border-zinc-800/80 bg-zinc-950/70 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-cyan-500/10 to-transparent blur-2xl" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-bold text-zinc-100 tracking-tight">Conversão Revolut</h2>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300">
          <Clock className="w-3 h-3 text-amber-400 animate-spin" />
          <span>Garantido: <strong className="text-cyan-400 font-bold">{timeLeft}s</strong></span>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-3 relative z-10">
        
        {/* From Input */}
        <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all duration-200">
          <div className="flex justify-between text-[11px] text-zinc-400 mb-1 font-mono">
            <span>Você envia</span>
            <span>Saldo: R$ 24.580,00</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <input
              type="number"
              value={fromAmount}
              onChange={e => setFromAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent text-xl font-bold font-mono text-zinc-100 outline-none placeholder:text-zinc-600"
            />
            <select
              value={fromCurrency}
              onChange={e => setFromCurrency(e.target.value)}
              className="bg-zinc-800 text-zinc-100 font-semibold text-xs px-2.5 py-1.5 rounded-lg border border-zinc-700 outline-none cursor-pointer hover:bg-zinc-700 transition"
            >
              {SUPPORTED_CURRENCIES.map(c => (
                <option key={c.code} value={c.code} className="bg-zinc-900 text-white">
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button Divider */}
        <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-[50%] z-20">
          <button
            onClick={handleSwap}
            className="w-9 h-9 rounded-full bg-cyan-500 text-zinc-950 flex items-center justify-center shadow-lg hover:rotate-180 hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-zinc-950 cursor-pointer"
            title="Inverter moedas"
          >
            <ArrowLeftRight className="w-4 h-4 font-bold" />
          </button>
        </div>

        {/* To Input */}
        <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all duration-200">
          <div className="flex justify-between text-[11px] text-zinc-400 mb-1 font-mono">
            <span>Você recebe</span>
            <span>Sem taxas ocultas</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="w-full text-xl font-bold font-mono text-cyan-300 truncate">
              {isLoading ? (
                <span className="text-zinc-500 text-sm animate-pulse">Calculando...</span>
              ) : conversion ? (
                conversion.convertedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
              ) : (
                '0.00'
              )}
            </span>
            <select
              value={toCurrency}
              onChange={e => setToCurrency(e.target.value)}
              className="bg-zinc-800 text-zinc-100 font-semibold text-xs px-2.5 py-1.5 rounded-lg border border-zinc-700 outline-none cursor-pointer hover:bg-zinc-700 transition"
            >
              {SUPPORTED_CURRENCIES.map(c => (
                <option key={c.code} value={c.code} className="bg-zinc-900 text-white">
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Breakdown */}
      {conversion && (
        <div className="mt-3.5 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/60 space-y-1 text-[11px] font-mono text-zinc-300 relative z-10">
          <div className="flex justify-between">
            <span className="text-zinc-400">Taxa FX:</span>
            <span className="font-semibold text-zinc-200">
              1 {conversion.from} = {conversion.rate} {conversion.to}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Tarifa Revolut (0.5%):</span>
            <span className="text-emerald-400 font-semibold">
              R$ {conversion.feeAmount.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleConfirmExchange}
        disabled={!conversion || conversion.originalAmount <= 0}
        className="w-full mt-4 py-3 px-4 rounded-xl font-bold text-xs text-zinc-950 bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-400 hover:from-cyan-300 hover:to-indigo-300 active:scale-[0.99] transition-all duration-200 shadow-md shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer relative z-10"
      >
        <ShieldCheck className="w-4 h-4" />
        <span>Confirmar Troca de Moeda</span>
      </button>

    </div>
  );
}

