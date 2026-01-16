import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Producto } from './producto.service';

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private itemsCarrito: ItemCarrito[] = [];
  private carritoSubject = new BehaviorSubject<ItemCarrito[]>([]);
  
  carrito$ = this.carritoSubject.asObservable();

  constructor() {
    this.cargarCarrito();
  }

  agregarProducto(producto: Producto) {
    const itemExistente = this.itemsCarrito.find(item => item.producto.id === producto.id);
    
    if (itemExistente) {
      itemExistente.cantidad++;
    } else {
      this.itemsCarrito.push({ producto, cantidad: 1 });
    }
    
    this.guardarCarrito();
  }

  obtenerItems(): ItemCarrito[] {
    return this.itemsCarrito;
  }

  obtenerCantidadTotal(): number {
    return this.itemsCarrito.reduce((total, item) => total + item.cantidad, 0);
  }

  obtenerTotal(): number {
    return this.itemsCarrito.reduce((total, item) => 
      total + (item.producto.precio * item.cantidad), 0
    );
  }

  eliminarItem(productoId: number) {
    this.itemsCarrito = this.itemsCarrito.filter(item => item.producto.id !== productoId);
    this.guardarCarrito();
  }

  limpiarCarrito() {
    this.itemsCarrito = [];
    this.guardarCarrito();
  }

  private guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(this.itemsCarrito));
    this.carritoSubject.next(this.itemsCarrito);
  }

  private cargarCarrito() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      this.itemsCarrito = JSON.parse(carritoGuardado);
      this.carritoSubject.next(this.itemsCarrito);
    }
  }
}