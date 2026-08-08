'use client';

import React from 'react';
import { Database, Server, Cpu, Radio, ShieldCheck } from 'lucide-react';
import { SystemStatus } from '@/types/currency';

interface RedisStatusWidgetProps {
  status: SystemStatus | null;
}

export function RedisStatusWidget({ status }: RedisStatusWidgetProps) {
  return (
    <div className="glass-panel p-5 w-full bg-zinc-950/70 border border-zinc-800/80 space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-zinc-100 tracking-tight">Infraestrutura Backend & Redis</h3>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-medium ${
            status?.isRedisConnected
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
          }`}
        >
          {status?.isRedisConnected ? 'Redis Active' : 'Fallback IMemoryCache'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
        
        <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-0.5">
          <div className="flex items-center gap-1.5 text-zinc-400 font-sans text-[10px]">
            <Server className="w-3 h-3 text-cyan-400" />
            <span>Cache Layer</span>
          </div>
          <p className="font-bold text-zinc-100 text-[11px] truncate">{status?.cacheType || 'In-Memory'}</p>
        </div>

        <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-0.5">
          <div className="flex items-center gap-1.5 text-zinc-400 font-sans text-[10px]">
            <Cpu className="w-3 h-3 text-indigo-400" />
            <span>Servidor API</span>
          </div>
          <p className="font-bold text-zinc-100 text-[11px]">.NET 8 WebAPI</p>
        </div>

        <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-0.5">
          <div className="flex items-center gap-1.5 text-zinc-400 font-sans text-[10px]">
            <Radio className="w-3 h-3 text-emerald-400" />
            <span>Pub/Sub Topic</span>
          </div>
          <p className="font-bold text-emerald-400 text-[11px]">rates:update</p>
        </div>

        <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-0.5">
          <div className="flex items-center gap-1.5 text-zinc-400 font-sans text-[10px]">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            <span>Pares FX</span>
          </div>
          <p className="font-bold text-cyan-400 text-[11px]">{status?.trackedPairsCount || 5} Pares Ativos</p>
        </div>

      </div>

      <p className="text-[11px] text-zinc-400 pt-1">
        💡 <strong>Nota de Resiliência:</strong> O backend em .NET 8 conecta ao Redis via StackExchange.Redis em <code className="text-cyan-400 font-mono text-[10px]">localhost:6379</code>. Se o Redis estiver indisponível, o sistema ativa automaticamente o Fallback em memória.
      </p>
    </div>
  );
}

