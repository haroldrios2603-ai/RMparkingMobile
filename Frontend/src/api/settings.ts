import { apiClient } from './client';

export const settingsApi = {
  /**
   * Obtiene la configuración general del sistema.
   */
  getGeneralConfig: async () => {
    const response = await apiClient.get('/settings/general');
    return response.data;
  },

  /**
   * Guarda o actualiza tarifas de parqueadero.
   */
  updateTariffs: async (parkingId: string, tariffs: any[]) => {
    const response = await apiClient.post(`/settings/tarifas/${parkingId}`, { tariffs });
    return response.data;
  },

  /**
   * Actualiza los métodos de pago habilitados.
   */
  updatePaymentMethods: async (config: {
    aceptaEfectivo: boolean;
    aceptaTarjeta: boolean;
    aceptaEnLinea: boolean;
    aceptaQr: boolean;
  }) => {
    const response = await apiClient.patch('/settings/metodos-pago', config);
    return response.data;
  },
};
