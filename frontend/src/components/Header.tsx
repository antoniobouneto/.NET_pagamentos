'use client';

import React, { useState } from 'react';
import { Database, RefreshCw, Activity, Layers } from 'lucide-react';
import { SystemStatus } from '@/types/currency';

interface HeaderProps {
  isConnected: boolean;
  systemStatus: SystemStatus | null;
  lastUpdated: Date | null;
  onRefresh: () => void;
}

export function Header({ isConnected, systemStatus, lastUpdated, onRefresh }: HeaderProps) {
  const [isRotating, setIsRotating] = useState(false);

  const handleRefreshClick = () => {
    setIsRotating(true);
    onRefresh();
    setTimeout(() => setIsRotating(false), 750);
  };

  return (
    <header className="w-full border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl sticky top-0 z-50 py-3 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-500 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/10 group-hover:shadow-cyan-500/20 transition-all duration-300">
              <div className="w-full h-full bg-zinc-950 rounded-[11px] flex items-center justify-center">
                <span className="font-extrabold text-lg tracking-tighter bg-gradient-to-r from-cyan-400 to-indigo-300 bg-clip-text text-transparent">
                  R
                </span>
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-zinc-950" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-zinc-100 tracking-tight flex items-center gap-1.5">
                Revolut <span className="font-medium text-zinc-400 text-xs">FX Live</span>
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
                v2.4
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Cotações FX em Tempo Real & SignalR</p>
          </div>
        </div>

        {/* Status Indicators & Actions */}
        <div className="flex items-center flex-wrap justify-center sm:justify-end gap-2.5">
          
          {/* SignalR Connection Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs">
            <span className="relative flex h-2 w-2">
              {isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </span>
            <span className="text-zinc-300 text-[11px] font-medium">
              {isConnected ? 'SignalR Ativo' : 'Modo Polling'}
            </span>
          </div>

          {/* Redis / Cache Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs">
            <Database className={`w-3.5 h-3.5 ${systemStatus?.isRedisConnected ? 'text-cyan-400' : 'text-amber-400'}`} />
            <span className="text-zinc-300 text-[11px] font-medium">
              {systemStatus?.isRedisConnected ? 'Redis Cache' : 'In-Memory Cache'}
            </span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefreshClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 text-xs transition duration-200 active:scale-95 cursor-pointer"
            title="Atualizar cotações manualmente"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 transition-transform duration-700 ${isRotating ? 'rotate-180' : ''}`} />
            <span className="text-[11px] text-zinc-300 font-mono">
              {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Sincronizando...'}
            </span>
          </button>

          {/* Account Balance Chip */}
          <div className="hidden lg:flex items-center gap-2.5 pl-3 ml-1 border-l border-zinc-800/80">
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 block">Saldo FX</span>
              <span className="text-xs font-mono font-bold text-zinc-100">R$ 24.580,00</span>
            </div>
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-[11px] text-white shadow-sm">
              US
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}

