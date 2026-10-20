import { apiClient } from './client';
import { RegisterRequest, User } from '../types';

export const usersApi = {
  /**
   * Obtiene la lista de usuarios del sistema.
   */
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users');
    return response.data;
  },

  /**
   * Crea un nuevo usuario operativo o administrativo.
   */
  createUser: async (data: RegisterRequest): Promise<User> => {
    const response = await apiClient.post<User>('/users', data);
    return response.data;
  },

  /**
   * Actualiza el rol de un usuario.
   */
  updateUserRole: async (userId: string, role: string) => {
    const response = await apiClient.patch(`/users/${userId}/role`, { role });
    return response.data;
  },

  /**
   * Cambia el estado (activo/inactivo) de un usuario.
   */
  updateUserStatus: async (userId: string, isActive: boolean) => {
    const response = await apiClient.patch(`/users/${userId}/status`, { isActive });
    return response.data;
  },
};
