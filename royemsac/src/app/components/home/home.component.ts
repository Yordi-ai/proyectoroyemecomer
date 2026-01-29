import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ProductoService, Producto } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito.service';

interface ProductoProcesado extends Producto {
  imagenUrl: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  productosDestacados: ProductoProcesado[] = [];
  terminoBusqueda: string = '';
  categoriaSeleccionada: string = '';
  categorias: string[] = [];
  
  mostrarToast: boolean = false;
  mensajeToast: string = '';

  // Carrusel 1
  carouselIndex1: number = 0;
  itemsPerSlide: number = 4;

  // Carrusel 2
  carouselIndex2: number = 0;

  constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarProductosDestacados();
    this.cargarCategorias();
  }

  cargarProductosDestacados() {
    this.productoService.obtenerDestacados().subscribe({
      next: (data) => {
        this.productosDestacados = data.map(p => this.procesarProducto(p));
        console.log('✅ Productos destacados cargados:', this.productosDestacados.length);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Error al cargar destacados:', err);
        this.cdr.markForCheck();
      }
    });
  }

  cargarCategorias() {
    this.productoService.obtenerCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
        this.cdr.markForCheck();
      }
    });
  }

  // ✅ CARRUSEL 1 - PRIMERA MITAD DE PRODUCTOS
get totalSlides1(): number {
  const mitad = Math.ceil(this.productosDestacados.length / 2);
  return Math.ceil(mitad / this.itemsPerSlide);
}

get productosCarrusel1(): ProductoProcesado[] {
  const mitad = Math.ceil(this.productosDestacados.length / 2);
  const primerasMitad = this.productosDestacados.slice(0, mitad);
  const start = this.carouselIndex1 * this.itemsPerSlide;
  return primerasMitad.slice(start, start + this.itemsPerSlide);
}

nextSlide1() {
  if (this.carouselIndex1 < this.totalSlides1 - 1) {
    this.carouselIndex1++;
  } else {
    this.carouselIndex1 = 0;
  }
  this.cdr.markForCheck();
}

prevSlide1() {
  if (this.carouselIndex1 > 0) {
    this.carouselIndex1--;
  } else {
    this.carouselIndex1 = this.totalSlides1 - 1;
  }
  this.cdr.markForCheck();
}

goToSlide1(index: number) {
  this.carouselIndex1 = index;
  this.cdr.markForCheck();
}

// ✅ CARRUSEL 2 - SEGUNDA MITAD DE PRODUCTOS
get totalSlides2(): number {
  const mitad = Math.ceil(this.productosDestacados.length / 2);
  const segundaMitad = this.productosDestacados.length - mitad;
  return Math.ceil(segundaMitad / this.itemsPerSlide);
}

get productosCarrusel2(): ProductoProcesado[] {
  const mitad = Math.ceil(this.productosDestacados.length / 2);
  const segundasMitad = this.productosDestacados.slice(mitad);
  const start = this.carouselIndex2 * this.itemsPerSlide;
  return segundasMitad.slice(start, start + this.itemsPerSlide);
}

nextSlide2() {
  if (this.carouselIndex2 < this.totalSlides2 - 1) {
    this.carouselIndex2++;
  } else {
    this.carouselIndex2 = 0;
  }
  this.cdr.markForCheck();
}

prevSlide2() {
  if (this.carouselIndex2 > 0) {
    this.carouselIndex2--;
  } else {
    this.carouselIndex2 = this.totalSlides2 - 1;
  }
  this.cdr.markForCheck();
}

goToSlide2(index: number) {
  this.carouselIndex2 = index;
  this.cdr.markForCheck();
}
  navegarCategoria(categoria: string) {
    this.router.navigate(['/categoria', encodeURIComponent(categoria)]);
  }

  buscarProductos() {
    if (this.terminoBusqueda.trim()) {
      this.router.navigate(['/categoria', this.terminoBusqueda]);
    }
  }

  filtrarPorCategoria() {
    if (this.categoriaSeleccionada) {
      this.router.navigate(['/categoria', this.categoriaSeleccionada]);
    }
  }

  limpiarFiltros() {
    this.terminoBusqueda = '';
    this.categoriaSeleccionada = '';
  }

  scrollToProducts() {
    const element = document.getElementById('productsCarousel');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  addToCart(producto: Producto) {
    this.carritoService.agregarProducto(producto);
    this.mostrarNotificacion(`${producto.nombre} añadido al carrito`);
  }

  private procesarProducto(producto: Producto): ProductoProcesado {
    return {
      ...producto,
      imagenUrl: this.obtenerUrlImagen(producto.imagen)
    };
  }

  private obtenerUrlImagen(imagen: string): string {
    if (!imagen) {
      return 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22%3E%3Crect width=%22300%22 height=%22200%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2216%22 fill=%22%23999%22%3ESin Imagen%3C/text%3E%3C/svg%3E';
    }
    if (imagen.startsWith('http')) return imagen;
    return `http://localhost:8080${imagen}`;
  }

  mostrarNotificacion(mensaje: string) {
    this.mensajeToast = mensaje;
    this.mostrarToast = true;
    this.cdr.markForCheck();
    
    setTimeout(() => {
      this.mostrarToast = false;
      this.cdr.markForCheck();
    }, 3000);
  }

  trackByProductoId(index: number, producto: ProductoProcesado): number {
    return producto.id;
  }
}