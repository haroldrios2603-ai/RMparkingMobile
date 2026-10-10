import { API_URL_DEV, API_URL_PROD } from '@env';

/**
 * Configuración de la URL base de la API del Backend NestJS.
 * - Garantiza conexión con el servidor desplegado en la nube Railway para que el APK funcione en cualquier celular.
 */
const getBaseUrl = (): string => {
  const railwayUrl = 'https://sena-production-757e.up.railway.app';
  if (__DEV__) {
    return API_URL_DEV || railwayUrl;
  }
  return API_URL_PROD || railwayUrl;
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  TIMEOUT: 15000,
  STORAGE_KEYS: {
    AUTH_TOKEN: '@rmparking_auth_token',
    USER_DATA: '@rmparking_user_data',
  },
};
