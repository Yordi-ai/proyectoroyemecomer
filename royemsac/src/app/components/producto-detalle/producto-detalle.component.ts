import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductoService, Producto } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-producto-detalle',
  imports: [CommonModule, RouterLink],
  templateUrl: './producto-detalle.component.html',
  styleUrl: './producto-detalle.component.css'
})
export class ProductoDetalleComponent implements OnInit {
  producto: Producto | null = null;
  cantidad: number = 1;
  cargando: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoService: ProductoService,
    private carritoService: CarritoService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarProducto(Number(id));
    }
  }

  cargarProducto(id: number) {
    this.productoService.obtenerPorId(id).subscribe({
      next: (data) => {
        this.producto = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar producto:', err);
        this.cargando = false;
        alert('Producto no encontrado');
        this.router.navigate(['/']);
      }
    });
  }

  aumentarCantidad() {
    if (this.producto && this.cantidad < this.producto.stock) {
      this.cantidad++;
    }
  }

  disminuirCantidad() {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  agregarAlCarrito() {
    if (this.producto) {
      for (let i = 0; i < this.cantidad; i++) {
        this.carritoService.agregarProducto(this.producto);
      }
      alert(`${this.cantidad} ${this.producto.nombre}(s) añadido(s) al carrito ✅`);
      this.router.navigate(['/carrito']);
    }
  }

  volverInicio() {
    this.router.navigate(['/']);
  }
}
