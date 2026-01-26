import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Obtener el token
  const token = authService.getToken();

  // Clonar la petición y agregar el token si existe
  let authReq = req;
  
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Enviar la petición y manejar errores
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Error 401 - Token inválido o expirado
      if (error.status === 401) {
        console.warn('Token inválido o expirado. Cerrando sesión...');
        authService.logout();
      }

      // Error 403 - Sin permisos
      if (error.status === 403) {
        console.warn('Acceso prohibido. No tienes permisos para esta acción.');
        router.navigate(['/home']);
      }

      return throwError(() => error);
    })
  );
};