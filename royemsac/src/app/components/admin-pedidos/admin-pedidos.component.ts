import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrdenService, Orden } from '../../services/orden.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-pedidos',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-pedidos.component.html',
  styleUrl: './admin-pedidos.component.css'
})
export class AdminPedidosComponent implements OnInit {
  ordenes: Orden[] = [];
  cargando: boolean = true;
  estados = ['PENDIENTE', 'CONFIRMADO', 'ENVIADO', 'ENTREGADO'];

  constructor(
    private ordenService: OrdenService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const usuario = this.authService.obtenerUsuario();
    
    if (!usuario || usuario.rol !== 'ADMIN') {
      alert('Acceso denegado. Solo administradores.');
      this.router.navigate(['/']);
      return;
    }

    this.cargarPedidos();
  }

  cargarPedidos() {
    this.ordenService.obtenerTodas().subscribe({
      next: (data) => {
        this.ordenes = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar pedidos:', err);
        this.cargando = false;
      }
    });
  }

  cambiarEstado(orden: Orden, nuevoEstado: string) {
    if (confirm(`¿Cambiar estado del pedido #${orden.id} a ${nuevoEstado}?`)) {
      orden.estado = nuevoEstado;
      this.ordenService.actualizarEstado(orden.id!, nuevoEstado).subscribe({
        next: () => {
          alert('Estado actualizado correctamente ✅');
          this.cargarPedidos();
        },
        error: (err) => {
          console.error('Error al actualizar estado:', err);
          alert('Error al actualizar el estado');
          this.cargarPedidos();
        }
      });
    }
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'estado-pendiente';
      case 'CONFIRMADO': return 'estado-confirmado';
      case 'ENVIADO': return 'estado-enviado';
      case 'ENTREGADO': return 'estado-entregado';
      default: return '';
    }
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-PE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}