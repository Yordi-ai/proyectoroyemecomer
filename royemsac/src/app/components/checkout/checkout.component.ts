import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CarritoService, ItemCarrito } from '../../services/carrito.service';
import { AuthService } from '../../services/auth.service';
import { OrdenService, Orden, DetalleOrden } from '../../services/orden.service';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  items: ItemCarrito[] = [];
  total: number = 0;
  
  datosEnvio = {
    nombreCliente: '',
    emailCliente: '',
    telefonoCliente: '',
    direccionEnvio: ''
  };
  
  cargando: boolean = false;
  error: string = '';

  constructor(
    private carritoService: CarritoService,
    private authService: AuthService,
    private ordenService: OrdenService,
    private router: Router
  ) {}

  ngOnInit() {
    this.items = this.carritoService.obtenerItems();
    this.total = this.carritoService.obtenerTotal();
    
    if (this.items.length === 0) {
      alert('Tu carrito está vacío');
      this.router.navigate(['/']);
      return;
    }
    
    // Pre-llenar con datos del usuario si está logueado
    const usuario = this.authService.obtenerUsuario();
    if (usuario) {
      this.datosEnvio.nombreCliente = `${usuario.nombre} ${usuario.apellido}`;
      this.datosEnvio.emailCliente = usuario.email;
      this.datosEnvio.telefonoCliente = usuario.telefono || '';
      this.datosEnvio.direccionEnvio = usuario.direccion || '';
    }
  }

  validarFormulario(): boolean {
    if (!this.datosEnvio.nombreCliente || !this.datosEnvio.emailCliente || 
        !this.datosEnvio.telefonoCliente || !this.datosEnvio.direccionEnvio) {
      this.error = 'Por favor completa todos los campos';
      return false;
    }
    return true;
  }

  finalizarCompra() {
    if (!this.validarFormulario()) {
      return;
    }

    this.cargando = true;
    this.error = '';

    // Preparar detalles de la orden
    const detalles: DetalleOrden[] = this.items.map(item => ({
      producto: item.producto,
      cantidad: item.cantidad,
      precioUnitario: item.producto.precio,
      subtotal: item.producto.precio * item.cantidad
    }));

    // Crear orden
    const orden: Orden = {
      ...this.datosEnvio,
      total: this.total,
      detalles: detalles,
      usuario: this.authService.obtenerUsuario() || undefined
    };

    this.ordenService.crearOrden(orden).subscribe({
      next: (response) => {
        alert('¡Pedido realizado con éxito! 🎉\nNúmero de orden: ' + response.id);
        this.carritoService.limpiarCarrito();
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Error al crear orden:', err);
        this.error = 'Error al procesar el pedido. Intenta nuevamente.';
        this.cargando = false;
      }
    });
  }

  volver() {
    this.router.navigate(['/carrito']);
  }
}