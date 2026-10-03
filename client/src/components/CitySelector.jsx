import React from 'react';
import { MapPin } from 'lucide-react';

export default function CitySelector({ cities, selectedCityId, onSelectCity }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 px-1 scrollbar-none">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-bolt-textMuted uppercase tracking-wider pl-1 pr-2 shrink-0">
        <MapPin className="w-3.5 h-3.5 text-bolt-green" />
        <span>Місто:</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {cities.map(city => {
          const isSelected = city.id === selectedCityId;
          return (
            <button
              key={city.id}
              onClick={() => onSelectCity(city.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                isSelected
                  ? 'bg-bolt-green text-bolt-black font-bold shadow-md shadow-bolt-green/20'
                  : 'bg-bolt-darkCard hover:bg-bolt-darkBorder text-slate-300 border border-bolt-darkBorder hover:text-white'
              }`}
            >
              <span>{city.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  isSelected
                    ? 'bg-bolt-black/20 text-bolt-black font-bold'
                    : 'bg-bolt-dark text-bolt-textMuted border border-bolt-darkBorder'
                }`}
              >
                {city.districtsCount} р-нів
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
