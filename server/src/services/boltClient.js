import axios from 'axios';
import crypto from 'crypto';

// Збережена активна конфігурація сесії Bolt (у пам'яті для поточної сесії)
let boltSession = {
  phoneNumber: '',
  deviceId: crypto.randomUUID(),
  phoneUuid: crypto.randomUUID(),
  authToken: '',
  isAuthenticated: false
};

const DEFAULT_HEADERS = {
  'User-Agent': 'Bolt/CA.100.0 (Android 14; Pixel 8; uk_UA)',
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

/**
 * Отримати поточний статус сесії Bolt
 */
export function getBoltSessionStatus() {
  return {
    isAuthenticated: boltSession.isAuthenticated,
    phoneNumber: boltSession.phoneNumber ? boltSession.phoneNumber.replace(/(\+\d{3})\d+(\d{4})/, '$1****$2') : null,
    deviceId: boltSession.deviceId
  };
}

/**
 * Запит SMS OTP для входу в Bolt
 */
export async function requestSmsCode(phone) {
  try {
    boltSession.phoneNumber = phone;
    if (!boltSession.deviceId) boltSession.deviceId = crypto.randomUUID();
    if (!boltSession.phoneUuid) boltSession.phoneUuid = crypto.randomUUID();

    const response = await axios.post(
      'https://user.bolt.eu/user/register/phone',
      {
        phone: phone,
        phone_uuid: boltSession.phoneUuid
      },
      {
        params: {
          preferred_verification_method: 'sms',
          version: 'CI.23.0',
          deviceId: boltSession.deviceId,
          deviceType: 'android',
          device_name: 'Pixel8',
          device_os_version: 'Android14',
          language: 'uk'
        },
        headers: DEFAULT_HEADERS,
        timeout: 10000
      }
    );

    return {
      success: true,
      message: 'SMS код надіслано сервером Bolt на вказаний номер',
      data: response.data
    };
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    return {
      success: false,
      message: `Помилка запиту коду від Bolt: ${errorMsg}`,
      details: error.response?.data || null
    };
  }
}

/**
 * Підтвердження отриманого SMS коду від Bolt
 */
export async function verifySmsCode(code) {
  try {
    const response = await axios.post(
      'https://node.bolt.eu/user/user/v1/confirmVerification',
      {
        phone: boltSession.phoneNumber,
        phone_uuid: boltSession.phoneUuid,
        verification: {
          confirmation_data: {
            code: code.trim()
          }
        }
      },
      {
        params: {
          preferred_verification_method: 'sms',
          version: 'CI.23.0',
          deviceId: boltSession.deviceId,
          deviceType: 'android',
          device_name: 'Pixel8',
          device_os_version: 'Android14',
          language: 'uk'
        },
        headers: DEFAULT_HEADERS,
        timeout: 10000
      }
    );

    if (response.data && response.data.code === 0) {
      boltSession.isAuthenticated = true;
      boltSession.authToken = Buffer.from(`${boltSession.phoneNumber}:${boltSession.deviceId}`).toString('base64');

      return {
        success: true,
        message: 'Успішна авторизація в Bolt! Режим Live активовано.',
        session: getBoltSessionStatus()
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Невірний SMS-код',
        data: response.data
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Помилка верифікації коду: ${error.response?.data?.message || error.message}`,
      details: error.response?.data || null
    };
  }
}

/**
 * Прямий запит живих категорій та самокатів від Bolt
 */
export async function fetchLiveBoltScooters(lat, lng) {
  if (!boltSession.isAuthenticated) {
    return {
      success: false,
      message: 'Сесія Bolt не авторизована. Потрібно спочатку виконати вхід через SMS код.',
      scooters: []
    };
  }

  try {
    const basicAuth = boltSession.authToken || Buffer.from(`${boltSession.phoneNumber}:${boltSession.deviceId}`).toString('base64');

    const response = await axios.get('https://rental-search.bolt.eu/categoriesOverview', {
      params: {
        lat,
        lng,
        deviceId: boltSession.deviceId,
        deviceType: 'android',
        device_name: 'Pixel8',
        device_os_version: 'Android14',
        language: 'uk',
        version: 'CA.100.0'
      },
      headers: {
        ...DEFAULT_HEADERS,
        'Authorization': `Basic ${basicAuth}`
      },
      timeout: 10000
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      scooters: []
    };
  }
}
