import { apiClient } from './client';
import { CashPaymentResponse, ExitPaymentIntentResponse } from '../types';

export const paymentsApi = {
  /**
   * Registra cobro en efectivo de una salida.
   */
  registerCashPayment: async (exitId: string): Promise<CashPaymentResponse> => {
    const response = await apiClient.post<CashPaymentResponse>(`/payments/exit/${exitId}/cash`);
    return response.data;
  },

  /**
   * Crea intención de pago electrónico Wompi (QR) para salida.
   */
  createWompiExitIntent: async (exitId: string): Promise<ExitPaymentIntentResponse> => {
    const response = await apiClient.post<ExitPaymentIntentResponse>(`/payments/wompi/exit/${exitId}/intent`, {
      method: 'WOMPI_QR',
    });
    return response.data;
  },
};
