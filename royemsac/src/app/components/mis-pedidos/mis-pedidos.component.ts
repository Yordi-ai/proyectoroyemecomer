import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { OrdenService, Orden } from '../../services/orden.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mis-pedidos',
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-pedidos.component.html',
  styleUrl: './mis-pedidos.component.css'
})
export class MisPedidosComponent implements OnInit {
  ordenes: Orden[] = [];
  cargando: boolean = true;

  constructor(
    private ordenService: OrdenService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const usuario = this.authService.obtenerUsuario();
    
    if (!usuario) {
      alert('Debes iniciar sesión para ver tus pedidos');
      this.router.navigate(['/login']);
      return;
    }

    this.cargarPedidos(usuario.id);
  }

  cargarPedidos(usuarioId: number) {
    this.ordenService.obtenerOrdenesPorUsuario(usuarioId).subscribe({
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