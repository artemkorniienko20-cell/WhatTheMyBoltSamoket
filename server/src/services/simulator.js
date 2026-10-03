import { CITIES_DATA } from '../data/ukraineCitiesData.js';

// Кеш самокатів у пам'яті для кожного міста
const cityScootersCache = new Map();

/**
 * Генерує реалістичний випадковий зсув координат
 */
function randomOffset(scale = 0.006) {
  return (Math.random() - 0.5) * scale;
}

/**
 * Ініціалізує парк самокатів для конкретного міста по всіх його районах
 */
function generateCityFleet(cityId) {
  const city = CITIES_DATA[cityId];
  if (!city) return [];

  const scooters = [];
  let scooterCounter = 1000;

  city.districts.forEach(district => {
    // Для кожного району генеруємо самокати біля кожної характерної точки
    district.spots.forEach(spot => {
      // Від 3 до 8 самокатів біля кожної локації
      const countAtSpot = Math.floor(Math.random() * 6) + 3;

      for (let i = 0; i < countAtSpot; i++) {
        scooterCounter++;
        const battery = Math.floor(Math.random() * 85) + 15; // 15% - 100%
        const isBolt5 = Math.random() > 0.45;
        const model = isBolt5 ? 'Bolt 5 (Next-Gen)' : 'Bolt 4';
        const maxRange = isBolt5 ? 45 : 35;
        const rangeKm = Math.round((battery / 100) * maxRange);

        scooters.push({
          id: `bolt-${cityId}-${district.id.substring(0, 4)}-${scooterCounter}`,
          boltCode: `${Math.floor(10000 + Math.random() * 90000)}`,
          cityId: city.id,
          cityName: city.name,
          districtId: district.id,
          districtName: district.name,
          spotName: spot.name,
          lat: spot.coords[0] + randomOffset(0.005),
          lng: spot.coords[1] + randomOffset(0.007),
          battery,
          rangeKm,
          model,
          priceUnlock: city.scooterRate.unlock,
          pricePerMin: city.scooterRate.perMin,
          status: 'available',
          isReserved: false,
          maxSpeed: 20, // км/год за правилами безпеки в містах
          lastUpdated: new Date().toISOString()
        });
      }
    });

    // Додатково додаємо кілька самокатів, розсіяних по району
    const scatteredCount = Math.floor(Math.random() * 5) + 3;
    for (let j = 0; j < scatteredCount; j++) {
      scooterCounter++;
      const battery = Math.floor(Math.random() * 90) + 10;
      const isBolt5 = Math.random() > 0.4;
      const model = isBolt5 ? 'Bolt 5 (Next-Gen)' : 'Bolt 4';
      const rangeKm = Math.round((battery / 100) * 40);

      scooters.push({
        id: `bolt-${cityId}-${district.id.substring(0, 4)}-${scooterCounter}`,
        boltCode: `${Math.floor(10000 + Math.random() * 90000)}`,
        cityId: city.id,
        cityName: city.name,
        districtId: district.id,
        districtName: district.name,
        spotName: `${district.name} (вулиця)`,
        lat: district.center[0] + randomOffset(0.015),
        lng: district.center[1] + randomOffset(0.02),
        battery,
        rangeKm,
        model,
        priceUnlock: city.scooterRate.unlock,
        pricePerMin: city.scooterRate.perMin,
        status: 'available',
        isReserved: false,
        maxSpeed: 20,
        lastUpdated: new Date().toISOString()
      });
    }
  });

  return scooters;
}

/**
 * Отримує або створює самокати для міста
 */
export function getScootersForCity(cityId = 'kyiv', filters = {}) {
  const normCityId = cityId.toLowerCase();
  if (!cityScootersCache.has(normCityId)) {
    const fleet = generateCityFleet(normCityId);
    cityScootersCache.set(normCityId, fleet);
  }

  let fleet = cityScootersCache.get(normCityId) || [];

  // Періодично злегка симулюємо рух 2-3 самокатів та невелику зміну заряду
  if (Math.random() > 0.5 && fleet.length > 0) {
    const randomIndex = Math.floor(Math.random() * fleet.length);
    const scooter = fleet[randomIndex];
    if (scooter && !scooter.isReserved) {
      scooter.lat += (Math.random() - 0.5) * 0.0003;
      scooter.lng += (Math.random() - 0.5) * 0.0003;
      scooter.lastUpdated = new Date().toISOString();
    }
  }

  // Застосування фільтрів
  if (filters.district && filters.district !== 'all') {
    fleet = fleet.filter(s => s.districtId === filters.district);
  }

  if (filters.minBattery) {
    const minBat = parseInt(filters.minBattery, 10);
    if (!isNaN(minBat)) {
      fleet = fleet.filter(s => s.battery >= minBat);
    }
  }

  if (filters.model && filters.model !== 'all') {
    fleet = fleet.filter(s => s.model.toLowerCase().includes(filters.model.toLowerCase()));
  }

  if (filters.query) {
    const q = filters.query.toLowerCase().trim();
    fleet = fleet.filter(s =>
      s.boltCode.includes(q) ||
      s.districtName.toLowerCase().includes(q) ||
      s.spotName.toLowerCase().includes(q)
    );
  }

  return fleet;
}

/**
 * Симуляція звукового сигналу самоката (Ring)
 */
export function ringScooter(scooterId) {
  for (const [cityId, fleet] of cityScootersCache.entries()) {
    const target = fleet.find(s => s.id === scooterId || s.boltCode === scooterId);
    if (target) {
      return {
        success: true,
        message: `Самокат Bolt #${target.boltCode} (${target.spotName}) подає звуковий сигнал і блимає фарами!`,
        scooter: target
      };
    }
  }

  return {
    success: false,
    message: `Самокат ${scooterId} не знайдено`
  };
}

/**
 * Отримання статистики по місту та всіх його районах
 */
export function getCityDistrictStats(cityId = 'kyiv') {
  const normCityId = cityId.toLowerCase();
  const fleet = getScootersForCity(normCityId);
  const city = CITIES_DATA[normCityId];

  if (!city) return null;

  const districtStats = city.districts.map(d => {
    const inDistrict = fleet.filter(s => s.districtId === d.id);
    const avgBattery = inDistrict.length > 0
      ? Math.round(inDistrict.reduce((acc, cur) => acc + cur.battery, 0) / inDistrict.length)
      : 0;

    return {
      districtId: d.id,
      name: d.name,
      center: d.center,
      count: inDistrict.length,
      avgBattery,
      availableCount: inDistrict.filter(s => s.status === 'available').length
    };
  });

  const totalScooters = fleet.length;
  const overallAvgBattery = totalScooters > 0
    ? Math.round(fleet.reduce((acc, cur) => acc + cur.battery, 0) / totalScooters)
    : 0;

  return {
    cityId: city.id,
    cityName: city.name,
    totalScooters,
    overallAvgBattery,
    districtStats
  };
}
