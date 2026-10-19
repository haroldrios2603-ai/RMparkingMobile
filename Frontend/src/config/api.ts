import { API_URL_DEV, API_URL_PROD } from '@env';

/**
 * Configuración de la URL base de la API del Backend NestJS.
 * Garantiza que la APK compilada se conecte siempre al servidor en la nube Railway.
 */
const getBaseUrl = (): string => {
  const railwayUrl = 'https://sena-production-757e.up.railway.app';
  return process.env.EXPO_PUBLIC_API_URL || API_URL_PROD || API_URL_DEV || railwayUrl;
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  TIMEOUT: 15000,
  STORAGE_KEYS: {
    AUTH_TOKEN: '@rmparking_auth_token',
    USER_DATA: '@rmparking_user_data',
  },
};
