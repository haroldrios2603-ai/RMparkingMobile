import { apiClient } from './client';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '../types';

export const authApi = {
  /**
   * Realiza una prueba de salud con el backend.
   */
  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await apiClient.get('/auth/health');
    return response.data;
  },

  /**
   * Inicia sesión y obtiene el token JWT y datos del usuario.
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * Registra un nuevo usuario en el sistema.
   */
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await apiClient.post<User>('/auth/register', data);
    return response.data;
  },

  /**
   * Obtiene el perfil completo del usuario autenticado actual.
   * Acepta un token opcional para llamadas directas post-login.
   */
  getProfile: async (overrideToken?: string): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me', {
      headers: overrideToken ? { Authorization: `Bearer ${overrideToken}` } : undefined,
    });
    return response.data;
  },

  /**
   * Cierra sesión y finaliza la jornada/asistencia si aplica.
   */
  logout: async (): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  /**
   * Solicita código de recuperación de contraseña.
   */
  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/password/request', { email });
    return response.data;
  },
};
