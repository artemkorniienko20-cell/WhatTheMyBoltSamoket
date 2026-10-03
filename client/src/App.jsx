import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from './components/Navbar';
import CitySelector from './components/CitySelector';
import DistrictFilter from './components/DistrictFilter';
import FilterBar from './components/FilterBar';
import Map from './components/Map';
import ScooterDrawer from './components/ScooterDrawer';
import StatsModal from './components/StatsModal';
import BoltAuthModal from './components/BoltAuthModal';
import PanoramaModal from './components/PanoramaModal';

export default function App() {
  const [cities, setCities] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState('kyiv');
  const [selectedDistrictId, setSelectedDistrictId] = useState('all');
  const [scooters, setScooters] = useState([]);
  const [selectedScooter, setSelectedScooter] = useState(null);

  // Карта
  const [mapCenter, setMapCenter] = useState([50.4501, 30.5234]);
  const [mapZoom, setMapZoom] = useState(12);

  // Фільтри
  const [minBattery, setMinBattery] = useState(0);
  const [selectedModel, setSelectedModel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showZones, setShowZones] = useState(false);

  // Модальні вікна та стан
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [cityStats, setCityStats] = useState(null);
  const [boltSession, setBoltSession] = useState(null);

  // Геолокація користувача
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Завантаження та звук
  const [isLoading, setIsLoading] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [ringMessage, setRingMessage] = useState(null);

  // Панорама 360 та сповіщення
  const [isPanoramaOpen, setIsPanoramaOpen] = useState(false);
  const [panoramaScooter, setPanoramaScooter] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // 1. Завантаження списку міст при старті
  useEffect(() => {
    fetch('/api/cities')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.cities.length > 0) {
          setCities(data.cities);
          const kyiv = data.cities.find(c => c.id === 'kyiv') || data.cities[0];
          setSelectedCityId(kyiv.id);
          setMapCenter(kyiv.center);
          setMapZoom(kyiv.zoom);
        }
      })
      .catch(err => console.error('Помилка завантаження міст:', err));

    // Перевірка статусу сесії Bolt
    fetch('/api/bolt/status')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBoltSession(data.session);
        }
      })
      .catch(err => console.error('Помилка статусу Bolt:', err));
  }, []);

  // 2. Отримання поточного активного об'єкта міста
  const activeCity = useMemo(() => {
    return cities.find(c => c.id === selectedCityId) || null;
  }, [cities, selectedCityId]);

  // 3. Завантаження самокатів для активного міста з урахуванням фільтрів
  const fetchScooters = useCallback(async () => {
    if (!selectedCityId) return;
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        city: selectedCityId,
        district: selectedDistrictId,
        minBattery: minBattery.toString(),
        model: selectedModel,
        query: searchQuery
      });

      const res = await fetch(`/api/scooters?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setScooters(data.scooters);
      }
    } catch (err) {
      console.error('Помилка завантаження самокатів:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCityId, selectedDistrictId, minBattery, selectedModel, searchQuery]);

  // 4. Завантаження статистики по всіх районах обраного міста
  const fetchCityStats = useCallback(async () => {
    if (!selectedCityId) return;
    try {
      const res = await fetch(`/api/cities/${selectedCityId}/stats`);
      const data = await res.json();
      if (data.success) {
        setCityStats(data.data);
      }
    } catch (err) {
      console.error('Помилка статистики районів:', err);
    }
  }, [selectedCityId]);

  useEffect(() => {
    fetchScooters();
    fetchCityStats();
  }, [fetchScooters, fetchCityStats]);

  // Періодичне автооновлення кожні 25 секунд
  useEffect(() => {
    const timer = setInterval(() => {
      fetchScooters();
    }, 25000);
    return () => clearInterval(timer);
  }, [fetchScooters]);

  // Підрахунок самокатів по кожному району для бейджів
  const districtCounts = useMemo(() => {
    const counts = {};
    scooters.forEach(s => {
      counts[s.districtId] = (counts[s.districtId] || 0) + 1;
    });
    return counts;
  }, [scooters]);

  // Обробник вибору міста
  const handleSelectCity = (cityId) => {
    const city = cities.find(c => c.id === cityId);
    if (!city) return;

    setSelectedCityId(cityId);
    setSelectedDistrictId('all');
    setSelectedScooter(null);
    setMapCenter(city.center);
    setMapZoom(city.zoom);
  };

  // Обробник вибору конкретного району
  const handleSelectDistrict = (districtId, center) => {
    setSelectedDistrictId(districtId);
    setSelectedScooter(null);

    if (center) {
      setMapCenter(center);
      setMapZoom(14);
    } else if (activeCity) {
      setMapCenter(activeCity.center);
      setMapZoom(activeCity.zoom);
    }
  };

  // Геолокація користувача та пошук найближчого самоката
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert('Ваш браузер не підтримує геолокацію');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const uLoc = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(uLoc);
        setMapCenter(uLoc);
        setMapZoom(16);
        setIsLocating(false);

        // Знаходимо найближчий самокат у парку
        if (scooters.length > 0) {
          let closest = null;
          let minDist = Infinity;

          scooters.forEach(s => {
            const d = Math.hypot(s.lat - uLoc[0], s.lng - uLoc[1]);
            if (d < minDist) {
              minDist = d;
              closest = s;
            }
          });

          if (closest) {
            setSelectedScooter(closest);
          }
        }
      },
      err => {
        setIsLocating(false);
        alert('Не вдалося визначити геолокацію: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Сигнал самоката (Ring)
  const handleRingScooter = async (scooterId) => {
    setIsRinging(true);
    setRingMessage(null);

    try {
      const res = await fetch(`/api/scooters/${scooterId}/ring`, { method: 'POST' });
      const data = await res.json();

      setRingMessage(data.message || 'Самокат сигналить!');
      setTimeout(() => setRingMessage(null), 4000);
    } catch {
      setRingMessage('Помилка надсилання сигналу');
    } finally {
      setIsRinging(false);
    }
  };

  // Миттєвий перехід у Google Maps 360° Street View у цей самий район
  const handleOpenPanorama = (scooter) => {
    if (!scooter) return;
    const streetViewUrl = `https://www.google.com/maps?layer=c&cbll=${scooter.lat},${scooter.lng}`;
    window.open(streetViewUrl, '_blank', 'noopener,noreferrer');
    setToastMessage(`🌐 Відкриваємо Google Maps 360° для ${scooter.districtName} р-ну (${scooter.spotName})...`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Бронювання самоката
  const handleBookScooter = (scooter) => {
    setSelectedScooter(scooter);
    setToastMessage(`⚡ Самокат Bolt #${scooter.boltCode} успішно заброньовано на 15 хв!`);
    setTimeout(() => setToastMessage(null), 4500);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-bolt-black relative">
      {/* Спливаюче сповіщення про успішне бронювання */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[3000] px-5 py-2.5 rounded-2xl bg-bolt-green text-slate-950 font-black text-xs shadow-2xl flex items-center gap-2 border border-bolt-greenLight animate-in slide-in-from-top duration-200">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Верхня панель навігації */}
      <Navbar
        selectedCity={activeCity}
        scootersCount={scooters.length}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLocateUser={handleLocateUser}
        isLocating={isLocating}
        onRefresh={fetchScooters}
        isLoading={isLoading}
        boltSession={boltSession}
      />

      {/* 2. Верхня панель управління: Вибір міст, районів та фільтри */}
      <div className="bg-bolt-dark/95 border-b border-bolt-darkBorder px-4 py-2 space-y-2 z-20 shadow-md">
        {/* Рядок 1: Вибір міста України */}
        <CitySelector
          cities={cities}
          selectedCityId={selectedCityId}
          onSelectCity={handleSelectCity}
        />

        {/* Рядок 2: Вибір районів (покриття всіх районів міста) */}
        {activeCity && (
          <DistrictFilter
            districts={activeCity.districts}
            selectedDistrictId={selectedDistrictId}
            onSelectDistrict={handleSelectDistrict}
            districtCounts={districtCounts}
          />
        )}

        {/* Рядок 3: Фільтр заряду, моделі та пошук */}
        <FilterBar
          minBattery={minBattery}
          onChangeMinBattery={setMinBattery}
          selectedModel={selectedModel}
          onChangeModel={setSelectedModel}
          searchQuery={searchQuery}
          onChangeSearch={setSearchQuery}
          showZones={showZones}
          onToggleZones={() => setShowZones(!showZones)}
        />
      </div>

      {/* 3. Головна область: Інтерактивна карта */}
      <div className="relative flex-1 w-full overflow-hidden">
        <Map
          center={mapCenter}
          zoom={mapZoom}
          scooters={scooters}
          selectedScooter={selectedScooter}
          onSelectScooter={setSelectedScooter}
          onBookScooter={handleBookScooter}
          onOpenPanorama={handleOpenPanorama}
          userLocation={userLocation}
          showZones={showZones}
          activeCity={activeCity}
        />

        {/* Спливаюче меню обраного самоката */}
        {selectedScooter && (
          <ScooterDrawer
            scooter={selectedScooter}
            onClose={() => setSelectedScooter(null)}
            userLocation={userLocation}
            onRingScooter={handleRingScooter}
            isRinging={isRinging}
            ringMessage={ringMessage}
            onOpenPanorama={handleOpenPanorama}
          />
        )}
      </div>

      {/* 4. Модальне вікно аналітики всіх районів */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        cityStats={cityStats}
        onSelectDistrict={handleSelectDistrict}
      />

      {/* 5. Модальне вікно авторизації в Bolt API */}
      <BoltAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        boltSession={boltSession}
        onSessionUpdated={setBoltSession}
      />

      {/* 6. Модальне вікно Панорама 360° */}
      <PanoramaModal
        isOpen={isPanoramaOpen}
        onClose={() => setIsPanoramaOpen(false)}
        scooter={panoramaScooter}
      />
    </div>
  );
}
