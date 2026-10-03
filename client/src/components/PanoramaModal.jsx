import React from 'react';
import { X, Eye, ExternalLink, MapPin, Compass, Navigation } from 'lucide-react';

export default function PanoramaModal({
  isOpen,
  onClose,
  scooter
}) {
  if (!isOpen || !scooter) return null;

  const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${scooter.lat},${scooter.lng}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${scooter.lat},${scooter.lng}`;

  const openStreetView = () => {
    window.open(streetViewUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bolt-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-bolt-dark border border-bolt-darkBorder rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Шапка */}
        <div className="flex items-center justify-between p-5 border-b border-bolt-darkBorder bg-bolt-darkCard/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  Панорама 360° Google Street View
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-bolt-green/10 text-bolt-green border border-bolt-green/30">
                  Bolt #{scooter.boltCode}
                </span>
              </div>
              <p className="text-xs text-bolt-textMuted flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-bolt-green" />
                <span>{scooter.districtName} район</span> • <span>{scooter.spotName}</span>
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

        {/* Тіло модалки з візуальним прев'ю та кнопкою */}
        <div className="p-6 space-y-4">
          {/* Картка з панорамним дизайном */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 h-48 flex items-center justify-center text-center p-6 shadow-inner group">
            {/* Реальний тайл з висоти пташиного польоту як прев'ю */}
            <img
              src={`https://mt1.google.com/vt/lyrs=y&x=${Math.floor(((scooter.lng + 180) / 360) * Math.pow(2, 17))}&y=${Math.floor((1 - Math.log(Math.tan(scooter.lat * Math.PI / 180) + 1 / Math.cos(scooter.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, 17))}&z=17`}
              alt="Street View Preview"
              className="absolute inset-0 w-full h-full object-cover opacity-50 blur-[1px] group-hover:scale-105 transition-all duration-500"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bolt-dark via-bolt-dark/60 to-transparent"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-2 animate-bounce">
                <Compass className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-extrabold text-white">
                Огляд вулиці у 360 градусів
              </h4>
              <p className="text-xs text-slate-300 max-w-xs mt-1">
                Перегляньте точне місце паркування, тротуар, будівлі та орієнтири навколо
              </p>
            </div>
          </div>

          {/* Координати */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-bolt-darkCard border border-bolt-darkBorder text-xs">
            <span className="text-bolt-textMuted">Точні координати самоката:</span>
            <span className="font-mono font-bold text-white">
              {scooter.lat.toFixed(5)}, {scooter.lng.toFixed(5)}
            </span>
          </div>

          {/* Головна кнопка запуску панорами 360 */}
          <button
            onClick={openStreetView}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wide transition-all shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <Eye className="w-5 h-5" />
            <span>Відкрити панораму 360° в Google Street View</span>
            <ExternalLink className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={() => window.open(googleMapsUrl, '_blank')}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-bolt-darkCard hover:bg-bolt-darkBorder text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-400" />
            <span>Відкрити цю точку на Google Maps</span>
          </button>
        </div>
      </div>
    </div>
  );
}
