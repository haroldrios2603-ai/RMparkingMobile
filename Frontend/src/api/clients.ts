import { apiClient } from './client';
import { ClientContract } from '../types';

export const clientsApi = {
  /**
   * Obtiene la lista de contratos mensuales activos.
   */
  listContracts: async (): Promise<ClientContract[]> => {
    const response = await apiClient.get<ClientContract[]>('/clients/contracts');
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
   * Renueva un contrato existente.
   */
  renewContract: async (contractId: string, meses: number): Promise<ClientContract> => {
    const response = await apiClient.patch<ClientContract>(`/clients/contracts/${contractId}/renew`, {
      meses,
    });
    return response.data;
  },
};
