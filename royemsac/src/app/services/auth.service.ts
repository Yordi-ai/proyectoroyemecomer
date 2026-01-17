import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
  rol: string;
}

export interface LoginResponse {
  mensaje: string;
  usuario: Usuario;
  token: string;
}

export interface RegistroData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/usuarios';
  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  public usuario$ = this.usuarioSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router  // AGREGADO: Para redirigir
  ) {
    this.cargarUsuario();
  }

  // ACTUALIZADO: Ahora guarda el token también
  registro(datos: RegistroData): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/registro`, datos)
      .pipe(
        tap(response => {
          if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('usuario', JSON.stringify(response.usuario));
            this.usuarioSubject.next(response.usuario);
          }
        })
      );
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('usuario', JSON.stringify(response.usuario));
          this.usuarioSubject.next(response.usuario);
        })
      );
  }

  // ACTUALIZADO: Ahora redirige al login
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.usuarioSubject.next(null);
    this.router.navigate(['/login']);
  }

  estaAutenticado(): boolean {
    return !!localStorage.getItem('token');
  }

  obtenerUsuario(): Usuario | null {
    return this.usuarioSubject.value;
  }

  // NUEVO: Obtener el token
  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  // NUEVO: Verificar si es admin
  esAdmin(): boolean {
    const usuario = this.obtenerUsuario();
    return usuario?.rol === 'ADMIN';
  }

  // NUEVO: Verificar si el token expiró
  tokenExpirado(): boolean {
    const token = this.obtenerToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() > expiry;
    } catch (error) {
      return true;
    }
  }

  private cargarUsuario() {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      this.usuarioSubject.next(JSON.parse(usuarioGuardado));
    }
  }
}