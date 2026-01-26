import { Role } from './role.enum';

// ============== REQUEST MODELS ==============

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
   credencialAdmin?: string;
}

// ============== RESPONSE MODELS ==============

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
  mensaje: string;
  expiresIn: number;
}

export interface UserResponse {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
  rol: Role;
  activo: boolean;
  fechaRegistro: string;
}

export interface ErrorResponse {
  error: string;
  mensaje: string;
  status: number;
  timestamp: string;
}

// ============== LOCAL STORAGE ==============

export interface UserSession {
  token: string;
  user: {
    id: number;
    email: string;
    nombre: string;
    apellido: string;
    rol: Role;
  };
  expiresAt: number;
}