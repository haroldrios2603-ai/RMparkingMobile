import { apiClient } from './client';
import { EntryRequest, ExitRequest, Parking, TicketSummary } from '../types';

export const parkingApi = {
  /**
   * Obtiene el listado de parqueaderos configurados.
   */
  getAllParkings: async (): Promise<Parking[]> => {
    const response = await apiClient.get<Parking[]>('/parking');
    return response.data;
  },

  /**
   * Registra el ingreso de un vehículo.
   */
  registerEntry: async (data: EntryRequest) => {
    const response = await apiClient.post('/parking/entry', data);
    return response.data;
  },

  /**
   * Registra la salida de un vehículo y calcula la tarifa.
   */
  registerExit: async (data: ExitRequest) => {
    const response = await apiClient.post('/parking/exit', data);
    return response.data;
  },

  /**
   * Obtiene el resumen de tickets activos y egresos del día.
   */
  getResumenTickets: async (): Promise<TicketSummary> => {
    const response = await apiClient.get<TicketSummary>('/parking/tickets/resumen');
    return response.data;
  },

  /**
   * Cierra la jornada operativa diaria.
   */
  cerrarJornada: async () => {
    const response = await apiClient.post('/parking/jornada/cerrar');
    return response.data;
  },
};
