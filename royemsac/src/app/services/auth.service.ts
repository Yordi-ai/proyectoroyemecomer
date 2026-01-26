import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  UserResponse, 
  UserSession,
  ErrorResponse 
} from '../models/auth.models';
import { Role } from '../models/role.enum';
import { UserModel } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/usuarios';
  
  // Observables para el estado de autenticación
  private currentUserSubject = new BehaviorSubject<UserModel | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  // ============== AUTENTICACIÓN ==============

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(this.handleError)
      );
  }

  registro(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/registro`, data)
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(this.handleError)
      );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  // ============== VERIFICACIONES ==============

  isAuthenticated(): boolean {
    if (!this.getToken()) {
      return false;
    }

    if (this.isTokenExpired()) {
      this.clearSession();
      return false;
    }

    return true;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.rol === Role.ADMIN;
  }

  isCliente(): boolean {
    const user = this.currentUserSubject.value;
    return user?.rol === Role.CLIENTE;
  }

  hasRole(role: Role): boolean {
    const user = this.currentUserSubject.value;
    return user?.rol === role;
  }

  // ============== GETTERS ==============

  getCurrentUser(): UserModel | null {
    return this.currentUserSubject.value;
  }

  getUserId(): number | null {
    return this.currentUserSubject.value?.id ?? null;
  }

  getUserEmail(): string | null {
    return this.currentUserSubject.value?.email ?? null;
  }

  getUserRole(): Role | null {
    return this.currentUserSubject.value?.rol ?? null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ============== GESTIÓN DE SESIÓN ==============

  private handleAuthResponse(response: AuthResponse): void {
    // Guardar token
    localStorage.setItem('token', response.token);

    // Crear objeto de usuario
    const user = new UserModel({
      id: response.userId,
      email: response.email,
      nombre: response.nombre,
      apellido: response.apellido,
      rol: response.rol,
      activo: true,
      fechaRegistro: new Date()
    });

    // Guardar sesión
    const session: UserSession = {
      token: response.token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol
      },
      expiresAt: Date.now() + response.expiresIn
    };

    localStorage.setItem('userSession', JSON.stringify(session));

    // Actualizar estado
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  private loadUserFromStorage(): void {
    const sessionStr = localStorage.getItem('userSession');
    
    if (!sessionStr) {
      this.isAuthenticatedSubject.next(false);
      return;
    }

    try {
      const session: UserSession = JSON.parse(sessionStr);
      
      // Verificar si la sesión expiró
      if (Date.now() > session.expiresAt) {
        this.clearSession();
        return;
      }

      // Restaurar usuario
      const user = new UserModel(session.user);
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);

    } catch (error) {
      console.error('Error al cargar sesión:', error);
      this.clearSession();
    }
  }

  private clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userSession');
    // Mantener compatibilidad con versión antigua
    localStorage.removeItem('usuario');
    
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  // ============== TOKEN ==============

  private isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = this.decodeToken(token);
      if (!payload.exp) return true;
      
      const expiryTime = payload.exp * 1000;
      const currentTime = Date.now();
      
      return currentTime > expiryTime;
    } catch (error) {
      return true;
    }
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  getTokenExpirationTime(): Date | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = this.decodeToken(token);
      return payload.exp ? new Date(payload.exp * 1000) : null;
    } catch (error) {
      return null;
    }
  }

  getTokenRemainingTime(): number {
    const expirationTime = this.getTokenExpirationTime();
    if (!expirationTime) return 0;
    
    return Math.max(0, expirationTime.getTime() - Date.now());
  }

  isTokenExpiringSoon(minutes: number = 5): boolean {
    const remaining = this.getTokenRemainingTime();
    return remaining > 0 && remaining < minutes * 60 * 1000;
  }

  // ============== NAVEGACIÓN POR ROL ==============

  navigateByRole(): void {
    const user = this.getCurrentUser();
    
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    if (user.isAdmin()) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/home']);
    }
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

    console.error('Error en AuthService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // ============== ACTUALIZACIÓN DE USUARIO ==============

  refreshUser(): Observable<UserModel> {
    const userId = this.getUserId();
    
    if (!userId) {
      return throwError(() => new Error('No hay usuario autenticado'));
    }

    return this.http.get<UserResponse>(`${this.apiUrl}/${userId}`)
      .pipe(
        map(response => new UserModel(response)),
        tap(user => this.currentUserSubject.next(user)),
        catchError(this.handleError)
      );
  }
}