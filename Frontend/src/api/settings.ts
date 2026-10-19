import { apiClient } from './client';

export const settingsApi = {
  /**
   * Obtiene la configuración general del sistema.
   */
  getGeneralConfig: async () => {
    const response = await apiClient.get('/settings');
    return response.data;
  },

  /**
   * Guarda o actualiza tarifas de parqueadero.
   */
  updateTariffs: async (parkingId: string, tariffs: any[]) => {
    const response = await apiClient.put('/settings/tarifas', {
      aplicarATodos: false,
      parkingId,
      tarifas,
    });
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
    const response = await apiClient.put('/settings/metodos-pago', {
      metodosPago: config,
    });
    return response.data;
  },
};
