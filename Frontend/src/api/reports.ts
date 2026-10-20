import { apiClient } from './client';

export interface DateRangeQuery {
  startDate?: string;
  endDate?: string;
}

export const reportsApi = {
  /**
   * Obtiene totales de facturación e ingresos.
   */
  getBillingTotal: async (params?: DateRangeQuery) => {
    const response = await apiClient.get('/reports/billing/total', { params });
    return response.data;
  },

  /**
   * Obtiene el conteo de vehículos procesados.
   */
  getVehicleCount: async (params?: DateRangeQuery) => {
    const response = await apiClient.get('/reports/vehicles/count', { params });
    return response.data;
  },

  /**
   * Obtiene desglose de ingresos por tipo de vehículo.
   */
  getIncomeByVehicle: async (params?: DateRangeQuery) => {
    const response = await apiClient.get('/reports/income/by-vehicle', { params });
    return response.data;
  },

  /**
   * Obtiene estado de mensualidades del período.
   */
  getMonthlyStatus: async () => {
    const response = await apiClient.get('/reports/monthly-payments/status');
    return response.data;
  },
};
