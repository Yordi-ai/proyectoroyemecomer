import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/auth.models';

@Component({
  selector: 'app-registro',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  datos: RegisterRequest = {
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: ''
    // 👆 NO incluir credencialAdmin aquí, se agrega después
  };
  
  confirmarPassword: string = '';
  error: string = '';
  cargando: boolean = false;

  // 🔑 NUEVAS PROPIEDADES PARA ADMIN
  esAdmin: boolean = false;
  credencialAdmin: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  registrar() {
    // Validaciones básicas
    if (!this.datos.email || !this.datos.password || !this.datos.nombre || !this.datos.apellido) {
      this.error = 'Por favor completa todos los campos obligatorios';
      return;
    }

    if (this.datos.password !== this.confirmarPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    if (this.datos.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    // 🔑 VALIDACIÓN ADICIONAL SI ES ADMIN
    if (this.esAdmin && !this.credencialAdmin) {
      this.error = 'Debes ingresar la credencial de administrador';
      return;
    }

    this.cargando = true;
    this.error = '';

    // 🔑 AGREGAR CREDENCIAL SI ES ADMIN
    const datosRegistro: RegisterRequest = {
      ...this.datos,
      credencialAdmin: this.esAdmin ? this.credencialAdmin : undefined
    };

    this.authService.registro(datosRegistro).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
        
        // Mensaje personalizado según el rol
        const tipoUsuario = response.rol === 'ADMIN' ? 'Administrador' : 'Usuario';
        const emoji = response.rol === 'ADMIN' ? '👑' : '🎉';
        
        alert(`${emoji} ¡Bienvenido ${tipoUsuario} ${response.nombre}!`);
        
        // Redirigir según el rol
        if (response.rol === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
        
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error en registro:', err);
        
        // Mensajes de error más específicos
        if (err.error?.mensaje) {
          this.error = err.error.mensaje;
        } else if (err.error?.error === 'REGISTRO_ERROR') {
          this.error = err.error.mensaje || 'Error al registrar usuario';
        } else if (err.message) {
          this.error = err.message;
        } else {
          this.error = 'Error al registrar usuario. Intenta nuevamente.';
        }
        
        // Si la credencial es incorrecta, limpiarla
        if (this.error.includes('credencial')) {
          this.credencialAdmin = '';
        }
        
        this.cargando = false;
      }
    });
  }

  // Método auxiliar para limpiar el formulario
  limpiarFormulario() {
    this.datos = {
      email: '',
      password: '',
      nombre: '',
      apellido: '',
      telefono: '',
      direccion: ''
    };
    this.confirmarPassword = '';
    this.esAdmin = false;
    this.credencialAdmin = '';
    this.error = '';
  }
}