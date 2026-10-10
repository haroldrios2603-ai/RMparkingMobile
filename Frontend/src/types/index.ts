/**
 * Tipos de datos sincronizados con las entidades y DTOs del Backend NestJS de RMparking.
 */

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN_PARKING = 'ADMIN_PARKING',
  OPERATOR = 'OPERATOR',
  CLIENT_MONTHLY = 'CLIENT_MONTHLY',
}

export enum VehicleType {
  CARRO = 'CARRO',
  MOTO = 'MOTO'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  documentNumber?: string;
  phone?: string;
  parkingId?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
  attendanceAction?: 'CHECK_IN_CREATED' | 'CHECK_IN_REUSED' | 'NONE';
  attendanceId?: string;
  checkIn?: string;
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
  nombre: string;
  direccion?: string;
  capacidadCarros: number;
  capacidadMotos: number;
  capacidadBicicletas: number;
  activo: boolean;
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
  placa: string;
  vehicleType: VehicleType;
  parkingId: string;
  entryTime: string;
  parkingName?: string;
}

export interface ClosedTicket {
  id: string;
  placa: string;
  vehicleType: VehicleType;
  entryTime: string;
  exitTime: string;
  totalCost: number;
  timeParkedFormatted?: string;
}

export interface TicketSummary {
  activos: ActiveTicket[];
  cerrados: ClosedTicket[];
}

export interface CreateClientContractRequest {
  nombre: string;
  documento: string;
  email: string;
  telefono: string;
  placa: string;
  tipoVehiculo: VehicleType;
  montoMensual: number;
  parkingId: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface ClientContract {
  id: string;
  clientId: string;
  placa: string;
  tipoVehiculo: VehicleType;
  montoMensual: number;
  estado: 'ACTIVO' | 'VENCIDO' | 'SUSPENDIDO' | 'INACTIVO';
  fechaInicio: string;
  fechaFin: string;
  client?: {
    nombre: string;
    documento: string;
    email: string;
    telefono: string;
  };
}

export interface CashPaymentResponse {
  paymentId: string;
  exitId: string;
  amount: number;
  method: 'EFECTIVO';
  status: 'APPROVED';
}

export interface ExitPaymentIntentResponse {
  paymentId: string;
  exitId: string;
  amount: number;
  qrCodeUrl?: string;
  status: 'PENDING' | 'APPROVED';
}
