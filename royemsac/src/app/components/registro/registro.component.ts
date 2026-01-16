import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegistroData } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  datos: RegistroData = {
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: ''
  };
  
  confirmarPassword: string = '';
  error: string = '';
  cargando: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  registrar() {
    // Validaciones
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

    this.cargando = true;
    this.error = '';

    this.authService.registro(this.datos).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
        alert('¡Registro exitoso! Ahora puedes iniciar sesión 🎉');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error en registro:', err);
        this.error = err.error?.error || 'Error al registrar usuario';
        this.cargando = false;
      }
    });
  }
}