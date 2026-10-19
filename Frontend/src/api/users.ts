import { apiClient } from './client';
import { RegisterRequest, User } from '../types';

export const usersApi = {
  /**
   * Obtiene la lista de usuarios del sistema con filtros opcionales.
   */
  getUsers: async (filters?: any): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users', { params: filters });
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
   * Actualiza datos generales del usuario.
   */
  updateUser: async (userId: string, data: any): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${userId}`, data);
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

  /**
   * Elimina/archiva un usuario.
   */
  deleteUser: async (userId: string) => {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  },

  /**
   * Restaura un usuario previamente archivado.
   */
  restoreUser: async (userId: string) => {
    const response = await apiClient.post(`/users/${userId}/restore`);
    return response.data;
  },
};
