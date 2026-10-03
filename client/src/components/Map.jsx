import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Map as MapIcon, Image as ImageIcon, Mountain, Moon, Car, Compass } from 'lucide-react';

/**
 * Конфігурація шарів Google Maps
 */
const MAP_LAYERS = {
  google_roadmap: {
    id: 'google_roadmap',
    name: 'Google Схема',
    icon: MapIcon,
    baseLyrs: 'm',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    attribution: '&copy; Google Maps'
  },
  google_satellite: {
    id: 'google_satellite',
    name: 'Google Реалістичний (Супутник 3D/HD)',
    icon: ImageIcon,
    baseLyrs: 'y', // hybrid: реальні супутникові знімки + назви вулиць
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    attribution: '&copy; Google Maps / Maxar Technologies'
  },
  google_terrain: {
    id: 'google_terrain',
    name: 'Google Рельєф',
    icon: Mountain,
    baseLyrs: 'p',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    attribution: '&copy; Google Maps'
  },
  dark_matter: {
    id: 'dark_matter',
    name: 'Темна карта',
    icon: Moon,
    baseLyrs: null,
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    subdomains: ['a', 'b', 'c', 'd'],
    maxZoom: 19,
    attribution: '&copy; CARTO &copy; OpenStreetMap'
  }
};

/**
 * Генерує правильний URL для тайлів Google з підтримкою заторів (traffic)
 */
function getLayerUrl(layerId, showTraffic) {
  const layer = MAP_LAYERS[layerId];
  if (!layer.baseLyrs) {
    return layer.url;
  }
  const lyrs = showTraffic ? `${layer.baseLyrs},traffic` : layer.baseLyrs;
  return `https://mt{s}.google.com/vt/lyrs=${lyrs}&x={x}&y={y}&z={z}`;
}

/**
 * Створює кастомну SVG іконку для самоката Bolt (високий контраст для світлої та реалістичної супутникової карти)
 */
function createScooterIcon(scooter, isSelected) {
  const bat = scooter.battery;
  let batColor = '#34D186'; // Bolt Green
  let batBg = '#0B0F12';

  if (bat < 25) {
    batColor = '#F43F5E'; // Червоний
  } else if (bat < 60) {
    batColor = '#FBBF24'; // Жовтий
  }

  const selectedClass = isSelected
    ? 'scale-125 z-50 filter drop-shadow-[0_0_14px_#34D186]'
    : 'hover:scale-110';

  const html = `
    <div class="relative cursor-pointer transition-all duration-200 ${selectedClass} group flex flex-col items-center">
      <!-- Реалістична тінь на асфальті -->
      <div class="absolute -bottom-1 w-7 h-2 bg-black/50 rounded-full blur-[2px]"></div>

      <!-- Основна плашка самоката -->
      <div style="background-color: ${batBg}; border: 2px solid ${batColor}; box-shadow: 0 4px 12px rgba(0,0,0,0.6);"
           class="relative flex items-center gap-1 px-1.5 py-1 rounded-xl">
        <!-- Блискавка Bolt -->
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="${batColor}" stroke="${batColor}" stroke-width="1.5">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
        <!-- Відсоток заряду -->
        <span style="color: ${batColor};" class="text-[10px] font-black tracking-tight leading-none text-white">
          ${bat}%
        </span>
      </div>
      <!-- Вказівник стрілочки -->
      <div style="border-top-color: ${batColor};" class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px]"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-bolt-marker',
    iconSize: [44, 34],
    iconAnchor: [22, 34],
    popupAnchor: [0, -34]
  });
}

/**
 * Іконка геопозиції користувача в стилі Google Maps
 */
function createUserIcon() {
  const html = `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-8 h-8 rounded-full bg-blue-500/35 animate-ping"></div>
      <div class="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg"></div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'user-location-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
}

export default function Map({
  center,
  zoom,
  scooters,
  selectedScooter,
  onSelectScooter,
  onBookScooter,
  onOpenPanorama,
  userLocation,
  showZones,
  activeCity
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const zonesLayerRef = useRef(null);
  const userMarkerRef = useRef(null);

  // За замовчуванням: Реалістичний режим Google Maps (Супутник 3D/HD)
  const [activeLayerId, setActiveLayerId] = useState('google_satellite');
  const [showTraffic, setShowTraffic] = useState(false);
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);

  // 1. Ініціалізація карти
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: center || [50.4501, 30.5234],
      zoom: zoom || 13,
      zoomControl: false
    });

    // Контролер зуму у фірмовому стилі Google Maps (праворуч внизу)
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Початковий тайловий шар Google
    const url = getLayerUrl('google_satellite', false);
    const initialConfig = MAP_LAYERS.google_satellite;

    const tileLayer = L.tileLayer(url, {
      subdomains: initialConfig.subdomains,
      maxZoom: initialConfig.maxZoom,
      attribution: initialConfig.attribution
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    markersLayerRef.current = L.layerGroup().addTo(map);
    zonesLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Оновлення шару при зміні режиму або заторів
  const updateTileLayer = (layerId, traffic) => {
    if (!mapInstanceRef.current || !MAP_LAYERS[layerId]) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const config = MAP_LAYERS[layerId];
    const url = getLayerUrl(layerId, traffic);

    const newTileLayer = L.tileLayer(url, {
      subdomains: config.subdomains,
      maxZoom: config.maxZoom,
      attribution: config.attribution
    }).addTo(mapInstanceRef.current);

    newTileLayer.bringToBack();
    tileLayerRef.current = newTileLayer;
  };

  const handleSwitchLayer = (layerId) => {
    setActiveLayerId(layerId);
    setIsLayerMenuOpen(false);
    updateTileLayer(layerId, showTraffic);
  };

  const handleToggleTraffic = () => {
    const nextTraffic = !showTraffic;
    setShowTraffic(nextTraffic);
    updateTileLayer(activeLayerId, nextTraffic);
  };

  // Швидке перемикання Схема ⇄ Реалістичний Супутник
  const handleToggleRealistic = () => {
    const nextLayer = activeLayerId === 'google_satellite' ? 'google_roadmap' : 'google_satellite';
    handleSwitchLayer(nextLayer);
  };

  // 3. Плавний переліт камери при зміні міста чи виборі району
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.flyTo(center, zoom || 13, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [center, zoom]);

  // 4. Оновлення маркерів самокатів
  useEffect(() => {
    if (!markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    scooters.forEach(scooter => {
      const isSelected = selectedScooter && selectedScooter.id === scooter.id;
      const icon = createScooterIcon(scooter, isSelected);

      const marker = L.marker([scooter.lat, scooter.lng], { icon });

      // Інтерактивне меню-попап прямо над самокатом
      const popupDiv = document.createElement('div');
      popupDiv.style.minWidth = '200px';
      popupDiv.style.padding = '4px';
      popupDiv.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
          <strong style="color:#ffffff; font-size:13px; font-weight:800;">⚡ Bolt #${scooter.boltCode}</strong>
          <span style="color:#34D186; font-weight:800; font-size:12px;">${scooter.battery}%</span>
        </div>
        <div style="color:#94A3B8; font-size:10px; margin-bottom:8px;">${scooter.districtName} р-н • ${scooter.spotName}</div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          <button id="pop-book-${scooter.id}" style="width:100%; background:#34D186; color:#0f172a; font-weight:900; font-size:11px; padding:7px 10px; border-radius:10px; border:none; cursor:pointer; text-transform:uppercase; letter-spacing:0.5px; box-shadow: 0 2px 6px rgba(52,209,134,0.3);">
            ⚡ Забронювати
          </button>
          <button id="pop-pano-${scooter.id}" style="width:100%; background:linear-gradient(to right, #F59E0B, #D97706); color:#0f172a; font-weight:900; font-size:11px; padding:7px 10px; border-radius:10px; border:none; cursor:pointer; text-transform:uppercase; letter-spacing:0.5px; display:flex; align-items:center; justify-content:center; gap:5px; box-shadow: 0 2px 6px rgba(245,158,11,0.3);">
            🌐 Панорама 360°
          </button>
        </div>
      `;

      marker.bindPopup(popupDiv, {
        offset: [0, -30],
        className: 'bolt-map-popup'
      });

      marker.on('click', () => {
        onSelectScooter(scooter);
      });

      marker.on('popupopen', () => {
        onSelectScooter(scooter);

        const bookBtn = document.getElementById(`pop-book-${scooter.id}`);
        const panoBtn = document.getElementById(`pop-pano-${scooter.id}`);

        if (bookBtn) {
          bookBtn.onclick = (e) => {
            e.stopPropagation();
            if (onBookScooter) onBookScooter(scooter);
          };
        }

        if (panoBtn) {
          panoBtn.onclick = (e) => {
            e.stopPropagation();
            if (onOpenPanorama) {
              onOpenPanorama(scooter);
            } else {
              window.open(`https://www.google.com/maps?layer=c&cbll=${scooter.lat},${scooter.lng}`, '_blank', 'noopener,noreferrer');
            }
          };
        }
      });

      markersLayerRef.current.addLayer(marker);
    });
  }, [scooters, selectedScooter, onSelectScooter, onBookScooter, onOpenPanorama]);

  // 5. Оновлення геопозиції користувача
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (userMarkerRef.current) {
      mapInstanceRef.current.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    if (userLocation) {
      userMarkerRef.current = L.marker(userLocation, {
        icon: createUserIcon(),
        zIndexOffset: 1000
      }).addTo(mapInstanceRef.current);

      userMarkerRef.current.bindTooltip('Ви тут', {
        permanent: false,
        direction: 'top',
        offset: [0, -16]
      });
    }
  }, [userLocation]);

  // 6. Відображення зон міста
  useEffect(() => {
    if (!zonesLayerRef.current || !activeCity) return;

    zonesLayerRef.current.clearLayers();

    if (showZones && activeCity.districts) {
      activeCity.districts.forEach(d => {
        d.spots.forEach(spot => {
          const parkingCircle = L.circle(spot.coords, {
            radius: 280,
            color: '#34D186',
            fillColor: '#34D186',
            fillOpacity: 0.18,
            weight: 2,
            dashArray: '5, 5'
          });

          parkingCircle.bindTooltip(`Зона паркування Bolt: ${spot.name}`, {
            direction: 'center',
            className: 'bolt-tooltip'
          });

          zonesLayerRef.current.addLayer(parkingCircle);
        });
      });
    }
  }, [showZones, activeCity]);

  return (
    <div className="relative w-full h-full flex-1">
      {/* Контейнер мапи */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Кнопка "Реалістичний / Супутник" у стилі Google Maps (внизу ліворуч) */}
      <div className="absolute bottom-5 left-4 z-[1000] flex items-center gap-2">
        {/* Головна кнопка перемикання Реалістичного режиму */}
        <button
          onClick={handleToggleRealistic}
          className="group relative flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-white/95 text-slate-800 hover:bg-white shadow-xl border border-slate-300 text-xs font-bold transition-all active:scale-95"
          title="Перемкнути реалістичний режим Google Супутник / Схема"
        >
          <div className="w-6 h-6 rounded-lg overflow-hidden border border-slate-300 flex items-center justify-center bg-slate-800 text-white shrink-0">
            {activeLayerId === 'google_satellite' ? (
              <MapIcon className="w-3.5 h-3.5 text-blue-400" />
            ) : (
              <ImageIcon className="w-3.5 h-3.5 text-bolt-green" />
            )}
          </div>
          <div className="text-left">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider leading-none">Режим мапи</div>
            <div className="text-xs font-extrabold text-slate-900">
              {activeLayerId === 'google_satellite' ? 'Реалістичний (Супутник)' : 'Схема Google'}
            </div>
          </div>
        </button>

        {/* Кнопка заторів Google Maps (Live Traffic) */}
        <button
          onClick={handleToggleTraffic}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-xs font-bold transition-all shadow-xl active:scale-95 ${
            showTraffic
              ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-amber-500/30'
              : 'bg-white/95 text-slate-800 hover:bg-white border-slate-300'
          }`}
          title="Показати затори на дорогах від Google Maps"
        >
          <Car className={`w-4 h-4 ${showTraffic ? 'text-slate-950' : 'text-amber-500'}`} />
          <span>Затори Google</span>
        </button>
      </div>

      {/* Меню вибору стилів Google Maps (угорі праворуч) */}
      <div className="absolute top-3 right-3 z-[1000]">
        <div className="relative">
          <button
            onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/95 text-slate-800 hover:bg-white shadow-xl border border-slate-300 text-xs font-bold transition-all active:scale-95"
          >
            <Layers className="w-4 h-4 text-blue-600" />
            <span>{MAP_LAYERS[activeLayerId].name}</span>
          </button>

          {isLayerMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl border border-slate-200 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Стилі Google Maps
              </div>
              {Object.values(MAP_LAYERS).map(layer => {
                const IconComponent = layer.icon;
                const isCurrent = layer.id === activeLayerId;
                return (
                  <button
                    key={layer.id}
                    onClick={() => handleSwitchLayer(layer.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isCurrent
                        ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${isCurrent ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span className="truncate">{layer.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
