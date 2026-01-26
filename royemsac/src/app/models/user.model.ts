import { Role } from './role.enum';

export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
  rol: Role;
  activo: boolean;
  fechaRegistro: Date;
  nombreCompleto?: string; // Campo calculado
}

export class UserModel implements User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
  rol: Role;
  activo: boolean;
  fechaRegistro: Date;

  constructor(data: any) {
    this.id = data.id;
    this.email = data.email;
    this.nombre = data.nombre;
    this.apellido = data.apellido;
    this.telefono = data.telefono;
    this.direccion = data.direccion;
    this.rol = data.rol as Role;
    this.activo = data.activo ?? true;
    this.fechaRegistro = data.fechaRegistro ? new Date(data.fechaRegistro) : new Date();
  }

  get nombreCompleto(): string {
    return `${this.nombre} ${this.apellido}`;
  }

  isAdmin(): boolean {
    return this.rol === Role.ADMIN;
  }

  isCliente(): boolean {
    return this.rol === Role.CLIENTE;
  }
}