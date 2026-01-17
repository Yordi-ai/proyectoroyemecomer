import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductoService, Producto } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent implements OnInit {
  productos: Producto[] = [];
  categorias: string[] = [];
  terminoBusqueda: string = '';
  categoriaSeleccionada: string = '';

  constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService
  ) {}

  ngOnInit() {
    this.cargarProductos();
    this.cargarCategorias();
  }

  cargarProductos() {
    this.productoService.obtenerTodos().subscribe({
      next: (data) => {
        this.productos = data;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
      }
    });
  }

  cargarCategorias() {
    this.productoService.obtenerCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
      }
    });
  }

  buscarProductos() {
    if (this.terminoBusqueda.trim()) {
      this.productoService.buscarProductos(this.terminoBusqueda).subscribe({
        next: (data) => {
          this.productos = data;
        },
        error: (err) => {
          console.error('Error al buscar productos:', err);
        }
      });
    } else {
      this.cargarProductos();
    }
  }

  filtrarPorCategoria() {
    if (this.categoriaSeleccionada) {
      this.productoService.obtenerPorCategoria(this.categoriaSeleccionada).subscribe({
        next: (data) => {
          this.productos = data;
        },
        error: (err) => {
          console.error('Error al filtrar productos:', err);
        }
      });
    } else {
      this.cargarProductos();
    }
  }

  limpiarFiltros() {
    this.terminoBusqueda = '';
    this.categoriaSeleccionada = '';
    this.cargarProductos();
  }

  addToCart(producto: Producto) {
    this.carritoService.agregarProducto(producto);
    alert(`${producto.nombre} añadido al carrito ✅`);
  }

  scrollToProducts() {
    document.getElementById('productsGrid')?.scrollIntoView({ behavior: 'smooth' });
  }

  // NUEVO: Obtener URL completa de imagen
  obtenerUrlImagen(imagen: string): string {
    if (!imagen) return 'https://via.placeholder.com/300?text=Sin+Imagen';
    if (imagen.startsWith('http')) return imagen;
    return 'http://localhost:8080' + imagen;
  }
}