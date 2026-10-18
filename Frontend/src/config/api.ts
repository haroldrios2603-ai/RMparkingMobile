/**
 * Configuración de la URL base de la API del Backend NestJS.
 * Usa la variable nativa de Expo `process.env.EXPO_PUBLIC_API_URL` con respaldo automático a Railway.
 */
const getBaseUrl = (): string => {
  const railwayUrl = 'https://sena-production-757e.up.railway.app';
  return process.env.EXPO_PUBLIC_API_URL || railwayUrl;
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  TIMEOUT: 15000,
  STORAGE_KEYS: {
    AUTH_TOKEN: '@rmparking_auth_token',
    USER_DATA: '@rmparking_user_data',
  },
};
