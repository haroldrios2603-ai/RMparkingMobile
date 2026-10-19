import { apiClient } from './client';

export interface AuditLogItem {
  id: string;
  operation: string;
  entity: string;
  recordId?: string;
  result: string;
  createdAt: string;
  userEmail?: string;
  metadata?: any;
}

export const auditApi = {
  /**
   * Obtiene la lista de registros de auditoría del sistema con filtros y paginación.
   */
  getAuditLogs: async (params?: { limit?: number; page?: number; operation?: string; entity?: string }): Promise<any> => {
    const response = await apiClient.get('/audit/logs', {
      params,
    });
    return response.data;
  },

  /**
   * Obtiene un registro de auditoría por su ID.
   */
  getLogById: async (id: string): Promise<AuditLogItem> => {
    const response = await apiClient.get<AuditLogItem>(`/audit/logs/${id}`);
    return response.data;
  },

  /**
   * Exporta los registros de auditoría.
   */
  exportLogs: async (params?: { format?: 'csv' | 'excel'; limit?: number }) => {
    const response = await apiClient.get('/audit/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
