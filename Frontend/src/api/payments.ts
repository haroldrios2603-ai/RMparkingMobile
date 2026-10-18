import { apiClient } from './client';

export const paymentsApi = {
  /**
   * Registra cobro en efectivo de una salida.
   */
  registerCashPayment: async (exitId: string): Promise<any> => {
    const response = await apiClient.post(`/payments/exit/${exitId}/cash`);
    return response.data;
  },

  /**
   * Crea intención de pago electrónico Wompi (QR) para salida.
   */
  createWompiExitIntent: async (exitId: string): Promise<any> => {
    const response = await apiClient.post(`/payments/wompi/exit/${exitId}/intent`, {
      method: 'WOMPI_QR',
    });
    return response.data;
  },
};
