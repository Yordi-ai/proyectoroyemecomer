import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductoService, Producto } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito.service';

// ✅ NUEVO: Interfaz para producto procesado
interface ProductoProcesado extends Producto {
  imagenUrl: string;
  iconoCategoria: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  productos: ProductoProcesado[] = [];  // ✅ Cambiado
  categorias: string[] = [];
  terminoBusqueda: string = '';
  categoriaSeleccionada: string = '';
  
  mostrarToast: boolean = false;
  mensajeToast: string = '';

  constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService
  ) {}

  ngOnInit() {
    this.cargarProductos();
    this.cargarCategorias();
  }

  // ✅ OPTIMIZADO: Pre-procesa las imágenes
  cargarProductos() {
    this.productoService.obtenerTodos().subscribe({
      next: (data) => {
        this.productos = data.map(p => this.procesarProducto(p));
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

  // ✅ OPTIMIZADO: Pre-procesa las imágenes
  buscarProductos() {
    if (this.terminoBusqueda.trim()) {
      this.productoService.buscarProductos(this.terminoBusqueda).subscribe({
        next: (data) => {
          this.productos = data.map(p => this.procesarProducto(p));
        },
        error: (err) => {
          console.error('Error al buscar productos:', err);
        }
      });
    } else {
      this.cargarProductos();
    }
  }

  // ✅ OPTIMIZADO: Pre-procesa las imágenes
  filtrarPorCategoria() {
    if (this.categoriaSeleccionada) {
      this.productoService.obtenerPorCategoria(this.categoriaSeleccionada).subscribe({
        next: (data) => {
          this.productos = data.map(p => this.procesarProducto(p));
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
    this.mostrarNotificacion(`${producto.nombre} añadido al carrito`);
  }

  scrollToProducts() {
    document.getElementById('productsGrid')?.scrollIntoView({ behavior: 'smooth' });
  }

  // ✅ NUEVO: Procesa el producto una sola vez
  private procesarProducto(producto: Producto): ProductoProcesado {
    return {
      ...producto,
      imagenUrl: this.obtenerUrlImagen(producto.imagen),
      iconoCategoria: this.obtenerIconoCategoria(producto.categoria)
    };
  }

  private obtenerUrlImagen(imagen: string): string {
    if (!imagen) return 'https://via.placeholder.com/300x200?text=Sin+Imagen';
    if (imagen.startsWith('http')) return imagen;
    return `http://localhost:8080${imagen}`;
  }

  obtenerIconoCategoria(categoria: string): string {
    const iconos: { [key: string]: string } = {
      'EPP': '🦺',
      'Ferretería': '🔧',
      'Ferreteria': '🔧',
      'Seguridad': '⚠️',
      'Industrial': '🏭',
      'Cascos': '⛑️',
      'Guantes': '🧤',
      'Lentes': '🥽',
      'Calzado': '👢',
      'Respiradores': '😷',
      'Arneses': '🪢',
      'Herramientas': '🔨',
      'Protección': '🛡️'
    };
    
    for (const [key, icon] of Object.entries(iconos)) {
      if (categoria.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    return '📦';
  }

  mostrarNotificacion(mensaje: string) {
    this.mensajeToast = mensaje;
    this.mostrarToast = true;
    
    setTimeout(() => {
      this.mostrarToast = false;
    }, 3000);
  }

  trackByProductoId(index: number, producto: ProductoProcesado): number {
    return producto.id;
  }
}