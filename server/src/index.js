import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { CITIES_DATA } from './data/ukraineCitiesData.js';
import { getScootersForCity, ringScooter, getCityDistrictStats } from './services/simulator.js';
import { getBoltSessionStatus, requestSmsCode, verifySmsCode, fetchLiveBoltScooters } from './services/boltClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(clientDistPath));

// Логування запитів
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/**
 * 1. Отримати список усіх міст України з районами
 */
app.get('/api/cities', (req, res) => {
  const citiesList = Object.values(CITIES_DATA).map(c => ({
    id: c.id,
    name: c.name,
    nameEn: c.nameEn,
    center: c.center,
    zoom: c.zoom,
    boltActive: c.boltActive,
    scooterRate: c.scooterRate,
    districtsCount: c.districts.length,
    districts: c.districts.map(d => ({
      id: d.id,
      name: d.name,
      center: d.center,
      spotsCount: d.spots.length
    }))
  }));

  res.json({
    success: true,
    totalCities: citiesList.length,
    cities: citiesList
  });
});

/**
 * 2. Отримати статистику по всіх районах конкретного міста
 */
app.get('/api/cities/:cityId/stats', (req, res) => {
  const { cityId } = req.params;
  const stats = getCityDistrictStats(cityId);

  if (!stats) {
    return res.status(404).json({
      success: false,
      message: `Місто з id "${cityId}" не знайдено`
    });
  }

  res.json({
    success: true,
    data: stats
  });
});

/**
 * 3. Отримати список самокатів для міста (з фільтрацією за районами, зарядом тощо)
 */
app.get('/api/scooters', async (req, res) => {
  const {
    city = 'kyiv',
    district = 'all',
    minBattery,
    model,
    query,
    mode = 'simulation',
    lat,
    lng
  } = req.query;

  // Якщо активовано режим Live Bolt API і користувач авторизований
  if (mode === 'live' && lat && lng) {
    const liveResult = await fetchLiveBoltScooters(parseFloat(lat), parseFloat(lng));
    if (liveResult.success) {
      return res.json({
        success: true,
        mode: 'live',
        source: 'Bolt Production API',
        data: liveResult.data
      });
    }
  }

  // За замовчуванням повертаємо детальний набір даних симулятора по всіх районах
  const scooters = getScootersForCity(city, {
    district,
    minBattery,
    model,
    query
  });

  const cityMeta = CITIES_DATA[city.toLowerCase()];

  res.json({
    success: true,
    mode: 'simulation',
    city: cityMeta ? cityMeta.name : city,
    cityId: city,
    total: scooters.length,
    scooters
  });
});

/**
 * 4. Звуковий сигнал на самокат (Ring)
 */
app.post('/api/scooters/:id/ring', (req, res) => {
  const { id } = req.params;
  const result = ringScooter(id);
  res.json(result);
});

/**
 * 5. Статус сесії Bolt
 */
app.get('/api/bolt/status', (req, res) => {
  res.json({
    success: true,
    session: getBoltSessionStatus()
  });
});

/**
 * 6. Запит SMS-коду від Bolt
 */
app.post('/api/bolt/request-code', async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({
      success: false,
      message: 'Номер телефону обов’язковий (наприклад +380931234567)'
    });
  }

  const result = await requestSmsCode(phone);
  res.json(result);
});

/**
 * 7. Підтвердження SMS-коду від Bolt
 */
app.post('/api/bolt/verify-code', async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({
      success: false,
      message: 'Код перевірки обов’язковий'
    });
  }

  const result = await verifySmsCode(code);
  res.json(result);
});

// SPA fallback для будь-яких не-API маршрутів
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[WhatTheMyBoltSamoket API] Сервер успішно запущено на http://localhost:${PORT}`);
});

