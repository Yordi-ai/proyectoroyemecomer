import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from './producto.service';
import { Usuario } from './auth.service';

export interface DetalleOrden {
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Orden {
  id?: number;
  usuario?: Usuario;
  fecha?: string;
  total: number;
  estado?: string;
  nombreCliente: string;
  emailCliente: string;
  telefonoCliente: string;
  direccionEnvio: string;
  detalles: DetalleOrden[];
}

@Injectable({
  providedIn: 'root'
})
export class OrdenService {
  private apiUrl = 'http://localhost:8080/api/ordenes';

  constructor(private http: HttpClient) { }

  crearOrden(orden: Orden): Observable<Orden> {
    return this.http.post<Orden>(this.apiUrl, orden);
  }

  obtenerOrdenesPorUsuario(usuarioId: number): Observable<Orden[]> {
    return this.http.get<Orden[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  obtenerPorId(id: number): Observable<Orden> {
    return this.http.get<Orden>(`${this.apiUrl}/${id}`);
  }

  obtenerTodas(): Observable<Orden[]> {
    return this.http.get<Orden[]>(this.apiUrl);
  }

  actualizarEstado(ordenId: number, nuevoEstado: string): Observable<Orden> {
    return this.http.put<Orden>(`${this.apiUrl}/${ordenId}/estado`, { estado: nuevoEstado });
  }
}