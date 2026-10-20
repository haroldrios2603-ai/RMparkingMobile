import { apiClient } from './client';

export interface DateRangeQuery {
  from?: string;
  to?: string;
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
   * Obtiene las horas pico y días de mayor afluencia.
   */
  getPeakHours: async (params?: DateRangeQuery) => {
    const response = await apiClient.get('/reports/peak', { params });
    return response.data;
  },

  /**
   * Obtiene lista de trabajadores en turno.
   */
  getWorkersOnShift: async () => {
    const response = await apiClient.get('/reports/workers/present');
    return response.data;
  },

  /**
   * Genera el enlace directo de exportación de reporte.
   */
  getExportUrl: (reportType: string, format: 'pdf' | 'excel' | 'word') => {
    return `${apiClient.defaults.baseURL}/reports/export?reportType=${reportType}&format=${format}`;
  },
};
