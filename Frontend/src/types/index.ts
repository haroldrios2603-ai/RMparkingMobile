/**
 * Tipos de datos sincronizados con las entidades Prisma y DTOs del Backend NestJS.
 */

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN_PARKING = 'ADMIN_PARKING',
  OPERATOR = 'OPERATOR',
  AUDITOR = 'AUDITOR',
  CLIENT = 'CLIENT',
}

export enum VehicleType {
  CAR = 'CAR',
  MOTORCYCLE = 'MOTORCYCLE',
  VAN = 'VAN',
}

export interface User {
  id: string;
  email: string;
  name: string;
  fullName?: string;
  role: Role;
  isActive: boolean;
  documentNumber?: string;
  phone?: string;
  parkingId?: string;
  permissions?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  attendanceId?: string;
  checkIn?: string;
  attendanceAction?: 'CHECK_IN_CREATED' | 'CHECK_IN_REUSED' | 'NONE';
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: Role;
  documentNumber?: string;
  phone?: string;
  parkingId?: string;
}

export interface Parking {
  id: string;
  name: string;
  address?: string;
  capacity?: number;
  baseRate?: number;
  isActive: boolean;
}

export interface EntryRequest {
  placa: string;
  vehicleType: VehicleType;
  parkingId: string;
}

export interface ExitRequest {
  placa: string;
}

export interface ActiveTicket {
  id: string;
  ticketCode: string;
  entryTime: string;
  vehicle?: {
    plate: string;
    type: string;
  };
  parking?: {
    name: string;
  };
}

export interface TicketSummary {
  activos: any[];
  cerrados: any[];
}

export interface ClientContract {
  id: string;
  placa: string;
  tipoVehiculo: string;
  montoMensual: number;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
  user?: {
    fullName: string;
    email: string;
  };
}
