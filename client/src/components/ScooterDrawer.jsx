import React, { useState } from 'react';
import {
  X,
  Battery,
  Zap,
  MapPin,
  Volume2,
  Navigation,
  Clock,
  CheckCircle2,
  Eye,
  ExternalLink
} from 'lucide-react';

export default function ScooterDrawer({
  scooter,
  onClose,
  userLocation,
  onRingScooter,
  isRinging,
  ringMessage,
  onOpenPanorama
}) {
  const [tripMinutes, setTripMinutes] = useState(15);
  const [isReserved, setIsReserved] = useState(false);

  if (!scooter) return null;

  // Розрахунок орієнтовної відстані від користувача
  let distanceText = null;
  if (userLocation) {
    const R = 6371e3; // метри
    const φ1 = (userLocation[0] * Math.PI) / 180;
    const φ2 = (scooter.lat * Math.PI) / 180;
    const Δφ = ((scooter.lat - userLocation[0]) * Math.PI) / 180;
    const Δλ = ((scooter.lng - userLocation[1]) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distM = Math.round(R * c);

    if (distM < 1000) {
      const walkMin = Math.max(1, Math.round(distM / 75));
      distanceText = `${distM} м (${walkMin} хв пішки)`;
    } else {
      distanceText = `${(distM / 1000).toFixed(1)} км`;
    }
  }

  // Розрахунок вартості
  const estimatedCost = (scooter.priceUnlock + scooter.pricePerMin * tripMinutes).toFixed(2);

  // Колір батареї
  const getBatteryColor = (bat) => {
    if (bat >= 60) return 'text-bolt-green bg-bolt-green';
    if (bat >= 25) return 'text-amber-400 bg-amber-400';
    return 'text-rose-500 bg-rose-500';
  };

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${scooter.lat},${scooter.lng}&travelmode=walking`;
    window.open(url, '_blank');
  };

  const handleOpenPanorama = () => {
    if (onOpenPanorama) {
      onOpenPanorama(scooter);
    } else {
      const url = `https://www.google.com/maps?layer=c&cbll=${scooter.lat},${scooter.lng}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Звуковий сигнал через Web Audio API
  const handleRing = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.15);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Ігноруємо якщо аудіо заблоковано
    }

    onRingScooter(scooter.id);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 md:inset-x-auto md:right-4 md:bottom-4 md:w-96 z-40 bg-bolt-dark/95 backdrop-blur-xl border border-bolt-darkBorder rounded-t-3xl md:rounded-3xl shadow-2xl p-5 transition-all animate-in slide-in-from-bottom duration-300">
      {/* Шапка картки */}
      <div className="flex items-start justify-between pb-3 border-b border-bolt-darkBorder">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-bolt-green/15 border border-bolt-green/30 flex items-center justify-center text-bolt-green shrink-0">
            <Zap className="w-6 h-6 fill-bolt-green" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-white tracking-wide">
                Bolt #{scooter.boltCode}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-bolt-green/10 text-bolt-green border border-bolt-green/20">
                {scooter.model}
              </span>
            </div>
            <p className="text-xs text-bolt-textMuted flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-bolt-green shrink-0" />
              <span>{scooter.districtName} р-н</span> • <span>{scooter.spotName}</span>
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

      {/* Сповіщення Ring */}
      {ringMessage && (
        <div className="mt-3 p-2.5 rounded-xl bg-bolt-green/15 border border-bolt-green/30 text-xs text-bolt-greenLight flex items-center gap-2 animate-bounce">
          <Volume2 className="w-4 h-4 shrink-0" />
          <span>{ringMessage}</span>
        </div>
      )}

      {/* ГОЛОВНІ ДІЇ З САМОКАТОМ: Забронювати та Панорама 360 */}
      <div className="my-4 space-y-2.5 bg-bolt-darkCard/80 p-3 rounded-2xl border border-bolt-darkBorder">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          Меню керування самокатом:
        </div>

        {/* 1. Кнопка ЗАБРОНЮВАТИ */}
        <button
          onClick={() => setIsReserved(!isReserved)}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 ${
            isReserved
              ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
              : 'bg-bolt-green text-slate-950 hover:bg-bolt-greenLight shadow-bolt-green/25'
          }`}
        >
          {isReserved ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Заброньовано на 15 хв (Скасувати)</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Забронювати самокат</span>
            </>
          )}
        </button>

        {/* 2. Кнопка ПАНОРАМА 360 */}
        <button
          onClick={handleOpenPanorama}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 active:scale-95"
        >
          <Eye className="w-4 h-4" />
          <span>Панорама 360° (Google Street View)</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </button>

        {/* Додаткові швидкі кнопки (Сигнал та Маршрут) */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleRing}
            disabled={isRinging}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-bolt-dark hover:bg-bolt-darkBorder border border-bolt-darkBorder text-xs font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
          >
            <Volume2 className={`w-3.5 h-3.5 text-bolt-green ${isRinging ? 'animate-ping' : ''}`} />
            <span>Сигнал (Ring)</span>
          </button>

          <button
            onClick={openInGoogleMaps}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-semibold text-blue-300 transition-all active:scale-95"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-400" />
            <span>Маршрут</span>
          </button>
        </div>
      </div>

      {/* Заряд та характеристики */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Батарея */}
        <div className="p-3 rounded-2xl bg-bolt-darkCard border border-bolt-darkBorder">
          <div className="flex items-center justify-between text-xs text-bolt-textMuted mb-1">
            <span className="flex items-center gap-1">
              <Battery className="w-3.5 h-3.5" />
              Заряд
            </span>
            <span className={`font-bold ${getBatteryColor(scooter.battery).split(' ')[0]}`}>
              {scooter.battery}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-bolt-dark overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getBatteryColor(scooter.battery).split(' ')[1]}`}
              style={{ width: `${scooter.battery}%` }}
            />
          </div>
          <p className="text-[11px] text-bolt-textMuted mt-1.5">
            Запас ходу: <strong className="text-white">~{scooter.rangeKm} км</strong>
          </p>
        </div>

        {/* Тариф */}
        <div className="p-3 rounded-2xl bg-bolt-darkCard border border-bolt-darkBorder">
          <div className="text-xs text-bolt-textMuted mb-0.5">Тариф поїздки</div>
          <div className="text-base font-extrabold text-white">
            {scooter.priceUnlock.toFixed(2)} ₴ <span className="text-[11px] font-normal text-bolt-textMuted">старт</span>
          </div>
          <div className="text-xs text-bolt-green font-semibold">
            + {scooter.pricePerMin.toFixed(2)} ₴/хв
          </div>
        </div>
      </div>

      {/* Відстань від користувача */}
      {distanceText && (
        <div className="mb-3 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-blue-400" />
            Відстань:
          </span>
          <strong className="text-white">{distanceText}</strong>
        </div>
      )}

      {/* Калькулятор вартості поїздки */}
      <div className="p-3 rounded-2xl bg-bolt-darkCard border border-bolt-darkBorder">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-bolt-textMuted flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-bolt-green" />
            Оцінка: <strong>{tripMinutes} хв</strong>
          </span>
          <span className="font-bold text-white text-sm">
            ≈ {estimatedCost} ₴
          </span>
        </div>
        <input
          type="range"
          min="5"
          max="60"
          step="5"
          value={tripMinutes}
          onChange={e => setTripMinutes(parseInt(e.target.value, 10))}
          className="w-full accent-bolt-green cursor-pointer h-1.5 bg-bolt-dark rounded-lg"
        />
        <div className="flex justify-between text-[10px] text-bolt-textMuted mt-1">
          <span>5 хв</span>
          <span>15 хв</span>
          <span>30 хв</span>
          <span>45 хв</span>
          <span>60 хв</span>
        </div>
      </div>
    </div>
  );
}
