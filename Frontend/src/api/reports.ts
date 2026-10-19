import { apiClient } from './client';

export interface DateRangeQuery {
  startDate?: string;
  endDate?: string;
  period?: 'day' | 'week' | 'month';
  date?: string;
  clientId?: string;
  userId?: string;
  documentNumber?: string;
  status?: string;
}

export const reportsApi = {
  /**
   * Obtiene trabajadores presentes en turno.
   */
  getWorkersOnShift: async () => {
    const response = await apiClient.get('/reports/workers/present');
    return response.data;
  },

  /**
   * Obtiene lista de clientes para filtros.
   */
  listClients: async () => {
    const response = await apiClient.get('/reports/clients');
    return response.data;
  },

  /**
   * Obtiene totales de facturación e ingresos.
   */
  getBillingTotal: async (params?: DateRangeQuery) => {
    const response = await apiClient.get('/reports/billing/total', { params });
    return response.data;
  },

  /**
   * Obtiene facturación por cliente.
   */
  getBillingByClient: async (params?: DateRangeQuery) => {
    const response = await apiClient.get('/reports/billing/client', { params });
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
  getMonthlyStatus: async (params?: DateRangeQuery) => {
    const response = await apiClient.get('/reports/monthly-payments/status', { params });
    return response.data;
  },

  /**
   * Obtiene reporte de asistencia de empleados.
   */
  getAttendance: async (params?: DateRangeQuery) => {
    const response = await apiClient.get('/reports/attendance', { params });
    return response.data;
  },

  /**
   * Obtiene indicadores de horas pico y días de mayor demanda.
   */
  getPeakIndicators: async (params?: DateRangeQuery) => {
    const response = await apiClient.get('/reports/peak', { params });
    return response.data;
  },

  /**
   * Exporta reporte en formato PDF, Excel o CSV.
   */
  exportReport: async (params: { reportType: string; format: 'pdf' | 'excel' | 'csv'; [key: string]: any }) => {
    const response = await apiClient.get('/reports/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
