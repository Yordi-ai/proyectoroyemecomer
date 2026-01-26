import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { 
  RegisterRequest, 
  UserResponse, 
  ErrorResponse 
} from '../models/auth.models';
import { Role } from '../models/role.enum';
import { UserModel } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8080/api/usuarios';

  constructor(private http: HttpClient) {}

  // ============== GESTIÓN DE USUARIOS ==============

  /**
   * Listar todos los usuarios
   */
  listarUsuarios(): Observable<UserModel[]> {
    return this.http.get<UserResponse[]>(this.apiUrl)
      .pipe(
        map(users => users.map(u => new UserModel(u))),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener usuario por ID
   */
  obtenerUsuario(id: number): Observable<UserModel> {
    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`)
      .pipe(
        map(user => new UserModel(user)),
        catchError(this.handleError)
      );
  }

  /**
   * Crear nuevo administrador
   */
  crearAdmin(data: RegisterRequest): Observable<UserModel> {
    return this.http.post<UserResponse>(`${this.apiUrl}/admin/crear`, data)
      .pipe(
        map(user => new UserModel(user)),
        catchError(this.handleError)
      );
  }

  /**
   * Activar usuario
   */
  activarUsuario(id: number): Observable<UserModel> {
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}/activar`, {})
      .pipe(
        map(user => new UserModel(user)),
        catchError(this.handleError)
      );
  }

  /**
   * Desactivar usuario
   */
  desactivarUsuario(id: number): Observable<UserModel> {
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}/desactivar`, {})
      .pipe(
        map(user => new UserModel(user)),
        catchError(this.handleError)
      );
  }

  /**
   * Eliminar usuario
   */
  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // ============== ESTADÍSTICAS ==============

  /**
   * Obtener estadísticas de usuarios
   */
  obtenerEstadisticas(): Observable<UserEstadisticas> {
    return this.listarUsuarios().pipe(
      map(usuarios => {
        return {
          total: usuarios.length,
          admins: usuarios.filter(u => u.rol === Role.ADMIN).length,
          clientes: usuarios.filter(u => u.rol === Role.CLIENTE).length,
          activos: usuarios.filter(u => u.activo).length,
          inactivos: usuarios.filter(u => !u.activo).length
        };
      })
    );
  }

  // ============== FILTROS Y BÚSQUEDA ==============

  /**
   * Filtrar usuarios por rol
   */
  filtrarPorRol(usuarios: UserModel[], rol: Role): UserModel[] {
    return usuarios.filter(u => u.rol === rol);
  }

  /**
   * Filtrar usuarios por estado
   */
  filtrarPorEstado(usuarios: UserModel[], activo: boolean): UserModel[] {
    return usuarios.filter(u => u.activo === activo);
  }

  /**
   * Buscar usuarios por término
   */
  buscarUsuarios(usuarios: UserModel[], termino: string): UserModel[] {
    if (!termino || termino.trim() === '') {
      return usuarios;
    }

    const terminoLower = termino.toLowerCase();
    
    return usuarios.filter(u => 
      u.nombre.toLowerCase().includes(terminoLower) ||
      u.apellido.toLowerCase().includes(terminoLower) ||
      u.email.toLowerCase().includes(terminoLower)
    );
  }

  // ============== VALIDACIONES ==============

  /**
   * Validar datos de nuevo administrador
   */
  validarDatosAdmin(data: RegisterRequest): string | null {
    if (!data.email || !this.validarEmail(data.email)) {
      return 'Email inválido';
    }

    if (!data.password || data.password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!data.nombre || data.nombre.trim().length === 0) {
      return 'El nombre es obligatorio';
    }

    if (!data.apellido || data.apellido.trim().length === 0) {
      return 'El apellido es obligatorio';
    }

    return null;
  }

  /**
   * Validar formato de email
   */
  private validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ============== MANEJO DE ERRORES ==============

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.error && typeof error.error === 'object') {
        const errorResponse = error.error as ErrorResponse;
        errorMessage = errorResponse.mensaje || errorResponse.error || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
    }

    console.error('Error en AdminService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

// ============== INTERFACES AUXILIARES ==============

export interface UserEstadisticas {
  total: number;
  admins: number;
  clientes: number;
  activos: number;
  inactivos: number;
}