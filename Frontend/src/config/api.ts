/**
 * Configuración de la URL base de la API del Backend NestJS.
 * Utiliza la variable de entorno de Expo con respaldo a desarrollo local o Railway.
 */
const getBaseUrl = (): string => {
  const localUrl = 'http://localhost:3000';
  const railwayUrl = 'https://sena-production-757e.up.railway.app';
  return process.env.EXPO_PUBLIC_API_URL || localUrl;
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  TIMEOUT: 15000,
  STORAGE_KEYS: {
    AUTH_TOKEN: '@rmparking_auth_token',
    USER_DATA: '@rmparking_user_data',
  },
};
