import { apiClient } from './client';
import { ClientContract } from '../types';

export const clientsApi = {
  /**
   * Obtiene la lista de contratos mensuales activos o con filtros.
   */
  listContracts: async (params?: any): Promise<ClientContract[]> => {
    const response = await apiClient.get<ClientContract[]>('/clients/contracts', { params });
    return response.data;
  },

  /**
   * Obtiene alertas pendientes por vencimiento o pago.
   */
  listAlerts: async (): Promise<any[]> => {
    const response = await apiClient.get<any[]>('/clients/contracts/alerts');
    return response.data;
  },

  /**
   * Registra un nuevo cliente con contrato mensual.
   */
  createClientContract: async (data: any): Promise<ClientContract> => {
    const response = await apiClient.post<ClientContract>('/clients', data);
    return response.data;
  },

  /**
   * Actualiza los datos de un contrato existente.
   */
  updateContract: async (contractId: string, data: any): Promise<ClientContract> => {
    const response = await apiClient.patch<ClientContract>(`/clients/contracts/${contractId}`, data);
    return response.data;
  },

  /**
   * Renueva un contrato existente utilizando RenewContractDto (newEndDate, paymentDate, monthlyFee).
   */
  renewContract: async (
    contractId: string,
    data: { newEndDate: string; paymentDate: string; monthlyFee?: number }
  ): Promise<ClientContract> => {
    const response = await apiClient.patch<ClientContract>(`/clients/contracts/${contractId}/renew`, data);
    return response.data;
  },

  /**
   * Archiva un contrato mensual.
   */
  deleteContract: async (contractId: string): Promise<any> => {
    const response = await apiClient.delete(`/clients/contracts/${contractId}`);
    return response.data;
  },

  /**
   * Restaura un contrato archivado.
   */
  restoreContract: async (contractId: string): Promise<any> => {
    const response = await apiClient.post(`/clients/contracts/${contractId}/restore`);
    return response.data;
  },
};
