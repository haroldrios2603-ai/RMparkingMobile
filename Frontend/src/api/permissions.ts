import { apiClient } from './client';

export interface AppScreenItem {
  key: string;
  name: string;
  description?: string;
  route?: string;
  isActive: boolean;
}

export interface ScreenPermissionMap {
  screenKey: string;
  canView: boolean;
}

export const permissionsApi = {
  /**
   * Obtiene los permisos de pantalla efectivos del usuario autenticado.
   */
  getMyPermissions: async () => {
    const response = await apiClient.get('/permissions/me');
    return response.data;
  },

  /**
   * Obtiene el catálogo de pantallas configurables del sistema.
   */
  listScreens: async (): Promise<AppScreenItem[]> => {
    const response = await apiClient.get<AppScreenItem[]>('/permissions/screens');
    return response.data;
  },

  /**
   * Obtiene los permisos asignados a un rol específico.
   */
  getRolePermissions: async (role: string) => {
    const response = await apiClient.get(`/permissions/roles/${role}`);
    return response.data;
  },

  /**
   * Actualiza los permisos de visualización de pantallas para un rol.
   */
  updateRolePermissions: async (role: string, permissions: { screenKey: string; canView: boolean }[]) => {
    const response = await apiClient.put(`/permissions/roles/${role}`, { permissions });
    return response.data;
  },
};
