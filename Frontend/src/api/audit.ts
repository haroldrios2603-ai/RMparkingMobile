import { apiClient } from './client';

export interface AuditLogItem {
  id: string;
  operation: string;
  entity: string;
  recordId?: string;
  result: string;
  createdAt: string;
  userEmail?: string;
}

export const auditApi = {
  /**
   * Obtiene la lista de registros de auditoría del sistema.
   */
  getAuditLogs: async (limit: number = 30): Promise<AuditLogItem[]> => {
    const response = await apiClient.get<AuditLogItem[]>('/audit/logs', {
      params: { limit },
    });
    return response.data;
  },
};
