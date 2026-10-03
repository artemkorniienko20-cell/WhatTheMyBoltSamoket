import React from 'react';
import { X, BarChart3, BatteryCharging, MapPin, ArrowRight } from 'lucide-react';

export default function StatsModal({
  isOpen,
  onClose,
  cityStats,
  onSelectDistrict
}) {
  if (!isOpen || !cityStats) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bolt-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-bolt-dark border border-bolt-darkBorder rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Шапка модалки */}
        <div className="flex items-center justify-between p-5 border-b border-bolt-darkBorder">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Аналітика районів — {cityStats.cityName}</span>
              </h2>
              <p className="text-xs text-bolt-textMuted">
                Повний розподіл парку самокатів Bolt по районах міста
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-bolt-darkCard hover:bg-bolt-darkBorder text-bolt-textMuted hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Загальні метрики */}
        <div className="grid grid-cols-3 gap-3 p-5 bg-bolt-darkCard/50 border-b border-bolt-darkBorder">
          <div className="p-3 rounded-2xl bg-bolt-dark border border-bolt-darkBorder">
            <div className="text-[11px] text-bolt-textMuted">Всього самокатів</div>
            <div className="text-xl font-extrabold text-white mt-1">
              {cityStats.totalScooters}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-bolt-dark border border-bolt-darkBorder">
            <div className="text-[11px] text-bolt-textMuted">Середній заряд</div>
            <div className="text-xl font-extrabold text-bolt-green mt-1 flex items-center gap-1">
              <BatteryCharging className="w-4 h-4" />
              {cityStats.overallAvgBattery}%
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-bolt-dark border border-bolt-darkBorder">
            <div className="text-[11px] text-bolt-textMuted">Охоплено районів</div>
            <div className="text-xl font-extrabold text-blue-400 mt-1">
              {cityStats.districtStats?.length || 0}
            </div>
          </div>
        </div>

        {/* Список районів */}
        <div className="p-5 overflow-y-auto space-y-2.5 flex-1">
          <h3 className="text-xs font-semibold text-bolt-textMuted uppercase tracking-wider mb-2">
            Деталізація по районах:
          </h3>

          {cityStats.districtStats?.map(district => (
            <div
              key={district.districtId}
              className="flex items-center justify-between p-3 rounded-2xl bg-bolt-darkCard border border-bolt-darkBorder hover:border-bolt-green/40 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-bolt-dark border border-bolt-darkBorder flex items-center justify-center text-bolt-green">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {district.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-bolt-textMuted">
                      Заряд: <strong className="text-slate-200">{district.avgBattery}%</strong>
                    </span>
                    <span className="text-bolt-darkBorder">•</span>
                    <span className="text-[11px] text-bolt-green font-semibold">
                      {district.availableCount} вільних
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-white bg-bolt-dark px-2.5 py-1 rounded-lg border border-bolt-darkBorder">
                  {district.count} шт
                </span>
                <button
                  onClick={() => {
                    onSelectDistrict(district.districtId, district.center);
                    onClose();
                  }}
                  className="p-1.5 rounded-lg bg-bolt-green/10 hover:bg-bolt-green text-bolt-green hover:text-bolt-black transition-all"
                  title="Показати на карті"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
