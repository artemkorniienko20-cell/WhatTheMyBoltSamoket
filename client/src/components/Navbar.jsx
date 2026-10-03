import React from 'react';
import { Zap, Navigation, BarChart3, ShieldCheck, ShieldAlert, RefreshCw } from 'lucide-react';

export default function Navbar({
  selectedCity,
  scootersCount,
  onOpenStats,
  onOpenAuth,
  onLocateUser,
  isLocating,
  onRefresh,
  isLoading,
  boltSession
}) {
  return (
    <header className="bg-bolt-dark/95 backdrop-blur-md border-b border-bolt-darkBorder px-4 py-3 z-30 sticky top-0 flex flex-wrap items-center justify-between gap-3 shadow-lg">
      {/* Логотип і назва */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bolt-green to-bolt-greenDark flex items-center justify-center shadow-md shadow-bolt-green/20">
          <Zap className="w-6 h-6 text-bolt-black fill-bolt-black" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
              WhatTheMyBolt<span className="text-bolt-green">Samoket</span>
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-bolt-green/10 text-bolt-green border border-bolt-green/30">
              UA 🇺🇦
            </span>
          </div>
          <p className="text-xs text-bolt-textMuted hidden sm:block">
            Моніторинг електросамокатів Bolt по всіх районах України
          </p>
        </div>
      </div>

      {/* Центральний статус мікропарку */}
      <div className="hidden lg:flex items-center gap-4 bg-bolt-darkCard/80 px-4 py-1.5 rounded-full border border-bolt-darkBorder text-xs">
        <div className="flex items-center gap-2">
          <span className="text-bolt-textMuted">Місто:</span>
          <span className="font-semibold text-white">{selectedCity?.name || 'Київ'}</span>
        </div>
        <span className="text-bolt-darkBorder">•</span>
        <div className="flex items-center gap-2">
          <span className="text-bolt-textMuted">Всі райони:</span>
          <span className="font-semibold text-bolt-greenLight">{selectedCity?.districtsCount || 10}</span>
        </div>
        <span className="text-bolt-darkBorder">•</span>
        <div className="flex items-center gap-2">
          <span className="text-bolt-textMuted">На карті:</span>
          <span className="font-bold text-white bg-bolt-dark px-2 py-0.5 rounded-md border border-bolt-darkBorder">
            {scootersCount} самокатів
          </span>
        </div>
      </div>

      {/* Кнопки дій */}
      <div className="flex items-center gap-2">
        {/* Кнопка оновлення */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          title="Оновити дані"
          className="p-2 rounded-xl bg-bolt-darkCard hover:bg-bolt-darkBorder border border-bolt-darkBorder text-slate-300 hover:text-bolt-green transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-bolt-green' : ''}`} />
        </button>

        {/* Геолокація користувача */}
        <button
          onClick={onLocateUser}
          disabled={isLocating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bolt-darkCard hover:bg-bolt-darkBorder border border-bolt-darkBorder text-xs font-medium text-slate-200 hover:text-white transition-all shadow-sm"
        >
          <Navigation className={`w-4 h-4 text-bolt-green ${isLocating ? 'animate-pulse' : ''}`} />
          <span className="hidden md:inline">Де я?</span>
        </button>

        {/* Аналітика районів */}
        <button
          onClick={onOpenStats}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bolt-darkCard hover:bg-bolt-darkBorder border border-bolt-darkBorder text-xs font-medium text-slate-200 hover:text-white transition-all shadow-sm"
        >
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <span className="hidden sm:inline">Аналітика районів</span>
        </button>

        {/* Режим Bolt API */}
        <button
          onClick={onOpenAuth}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-sm ${
            boltSession?.isAuthenticated
              ? 'bg-bolt-green/15 text-bolt-green border-bolt-green/40 hover:bg-bolt-green/25'
              : 'bg-bolt-darkCard hover:bg-bolt-darkBorder text-slate-300 border-bolt-darkBorder'
          }`}
        >
          {boltSession?.isAuthenticated ? (
            <>
              <ShieldCheck className="w-4 h-4 text-bolt-green" />
              <span>Live Bolt</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Bolt API</span>
              <span className="text-[10px] text-amber-400 uppercase font-mono">Demo</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
