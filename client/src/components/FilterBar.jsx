import React from 'react';
import { BatteryCharging, Search, Bike, ShieldAlert } from 'lucide-react';

export default function FilterBar({
  minBattery,
  onChangeMinBattery,
  selectedModel,
  onChangeModel,
  searchQuery,
  onChangeSearch,
  showZones,
  onToggleZones
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 bg-bolt-dark/90 px-3 py-2 rounded-2xl border border-bolt-darkBorder backdrop-blur-md shadow-md">
      {/* Пошук за номером або вулицею */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="w-4 h-4 text-bolt-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => onChangeSearch(e.target.value)}
          placeholder="Пошук самоката за номером, вулицею..."
          className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-bolt-darkCard border border-bolt-darkBorder text-xs text-white placeholder-bolt-textMuted focus:outline-none focus:border-bolt-green transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onChangeSearch('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-bolt-textMuted hover:text-white text-xs px-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* Фільтр заряду */}
      <div className="flex items-center gap-1.5 shrink-0 bg-bolt-darkCard px-2 py-1 rounded-xl border border-bolt-darkBorder">
        <BatteryCharging className="w-3.5 h-3.5 text-bolt-green" />
        <span className="text-[11px] text-bolt-textMuted hidden sm:inline">Заряд:</span>
        <div className="flex items-center gap-1">
          {[
            { label: 'Всі', value: 0 },
            { label: '>20%', value: 20 },
            { label: '>50%', value: 50 },
            { label: '>80%', value: 80 }
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => onChangeMinBattery(opt.value)}
              className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all ${
                minBattery === opt.value
                  ? 'bg-bolt-green text-bolt-black shadow-sm'
                  : 'text-bolt-textMuted hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Фільтр моделі */}
      <div className="flex items-center gap-1.5 shrink-0 bg-bolt-darkCard px-2 py-1 rounded-xl border border-bolt-darkBorder">
        <Bike className="w-3.5 h-3.5 text-blue-400" />
        <select
          value={selectedModel}
          onChange={e => onChangeModel(e.target.value)}
          className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-1"
        >
          <option value="all" className="bg-bolt-dark text-white">Всі моделі Bolt</option>
          <option value="Bolt 5" className="bg-bolt-dark text-white">Bolt 5 (Next-Gen)</option>
          <option value="Bolt 4" className="bg-bolt-dark text-white">Bolt 4</option>
        </select>
      </div>

      {/* Перемикач зон паркування */}
      <button
        onClick={onToggleZones}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
          showZones
            ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
            : 'bg-bolt-darkCard hover:bg-bolt-darkBorder text-bolt-textMuted border-bolt-darkBorder'
        }`}
      >
        <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
        <span>Зони міста</span>
      </button>
    </div>
  );
}
