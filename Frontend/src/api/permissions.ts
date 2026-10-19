import { apiClient } from './client';

export interface ScreenPermissionItem {
  screenKey: string;
  canView: boolean;
}

export const permissionsApi = {
  /**
   * Obtiene los permisos efectivos del usuario actual.
   */
  getMyPermissions: async (): Promise<any> => {
    const response = await apiClient.get('/permissions/me');
    return response.data;
  },

  /**
   * Lista todas las pantallas y recursos protegidos del sistema.
   */
  listScreens: async (): Promise<any[]> => {
    const response = await apiClient.get('/permissions/screens');
    return response.data;
  },

  /**
   * Obtiene los permisos asignados a un rol específico.
   */
  getRolePermissions: async (role: string): Promise<any> => {
    const response = await apiClient.get(`/permissions/roles/${role}`);
    return response.data;
  },

  /**
   * Actualiza los permisos asignados a un rol específico utilizando UpdateScreenPermissionsDto.
   */
  updateRolePermissions: async (role: string, permissions: ScreenPermissionItem[]): Promise<any> => {
    const response = await apiClient.put(`/permissions/roles/${role}`, { permissions });
    return response.data;
  },

  /**
   * Obtiene los permisos específicos de un usuario.
   */
  getUserPermissions: async (userId: string): Promise<any> => {
    const response = await apiClient.get(`/permissions/users/${userId}`);
    return response.data;
  },

  /**
   * Actualiza los permisos específicos de un usuario utilizando UpdateScreenPermissionsDto.
   */
  updateUserPermissions: async (userId: string, permissions: ScreenPermissionItem[]): Promise<any> => {
    const response = await apiClient.put(`/permissions/users/${userId}`, { permissions });
    return response.data;
  },
};
