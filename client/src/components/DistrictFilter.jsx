import React from 'react';
import { Layers } from 'lucide-react';

export default function DistrictFilter({
  districts = [],
  selectedDistrictId,
  onSelectDistrict,
  districtCounts = {}
}) {
  const totalCount = Object.values(districtCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 scrollbar-none">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-bolt-textMuted uppercase tracking-wider pl-1 pr-1 shrink-0">
        <Layers className="w-3.5 h-3.5 text-blue-400" />
        <span>Район:</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {/* Кнопка "Всі райони" */}
        <button
          onClick={() => onSelectDistrict('all')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
            selectedDistrictId === 'all'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'bg-bolt-darkCard/80 hover:bg-bolt-darkBorder text-slate-300 border border-bolt-darkBorder hover:text-white'
          }`}
        >
          <span>Всі райони</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-md ${
              selectedDistrictId === 'all'
                ? 'bg-blue-800 text-white'
                : 'bg-bolt-dark text-bolt-textMuted'
            }`}
          >
            {totalCount}
          </span>
        </button>

        {/* Кожен окремий район */}
        {districts.map(district => {
          const isSelected = district.id === selectedDistrictId;
          const count = districtCounts[district.id] || 0;

          return (
            <button
              key={district.id}
              onClick={() => onSelectDistrict(district.id, district.center)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                isSelected
                  ? 'bg-bolt-green/20 text-bolt-green border border-bolt-green font-bold shadow-sm'
                  : 'bg-bolt-darkCard/80 hover:bg-bolt-darkBorder text-slate-300 border border-bolt-darkBorder hover:text-white'
              }`}
            >
              <span>{district.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  isSelected
                    ? 'bg-bolt-green text-bolt-black font-bold'
                    : 'bg-bolt-dark text-bolt-textMuted'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
