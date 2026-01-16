import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarritoService, ItemCarrito } from '../../services/carrito.service';

@Component({
  selector: 'app-carrito',
  imports: [CommonModule, RouterLink],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent implements OnInit {
  items: ItemCarrito[] = [];
  total = 0;

  constructor(private carritoService: CarritoService) {}

  ngOnInit() {
    this.carritoService.carrito$.subscribe(() => {
      this.items = this.carritoService.obtenerItems();
      this.total = this.carritoService.obtenerTotal();
    });
  }

  eliminarItem(productoId: number) {
    this.carritoService.eliminarItem(productoId);
  }

  limpiarCarrito() {
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
      this.carritoService.limpiarCarrito();
    }
  }
}
