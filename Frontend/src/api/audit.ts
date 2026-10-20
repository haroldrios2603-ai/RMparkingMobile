import { apiClient } from './client';

export interface AuditLogItem {
  id: string;
  operation: string;
  entity: string;
  recordId?: string;
  result: string;
  createdAt: string;
  userEmail?: string;
  previousValues?: any;
  newValues?: any;
  metadata?: any;
}

export interface AuditQueryFilter {
  operation?: string;
  from?: string;
  to?: string;
  limit?: number;
}

export const auditApi = {
  /**
   * Obtiene la lista de registros de auditoría filtrados por operación o rango de fechas.
   */
  getAuditLogs: async (filters?: AuditQueryFilter): Promise<AuditLogItem[]> => {
    const response = await apiClient.get<AuditLogItem[]>('/audit/logs', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Obtiene el detalle completo de un registro de auditoría.
   */
  getAuditLogById: async (id: string): Promise<AuditLogItem> => {
    const response = await apiClient.get<AuditLogItem>(`/audit/logs/${id}`);
    return response.data;
  },
};
