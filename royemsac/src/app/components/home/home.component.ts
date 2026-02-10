import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
export class HomeComponent implements OnInit, OnDestroy {
  productosDestacados: ProductoProcesado[] = [];
  productosVisibles: ProductoProcesado[] = [];
  terminoBusqueda: string = '';
  categoriaSeleccionada: string = '';
  categorias: string[] = [];
  
  mostrarToast: boolean = false;
  mensajeToast: string = '';

  // Carrusel de productos
  currentIndex: number = 0;
  itemsPerView: number = 4;
  autoPlayInterval: any;
  isPaused: boolean = false;
  productosOriginales: ProductoProcesado[] = [];

  // CARRUSEL DE HERO
  heroSlides = [
   {
    image: 'assets/images/hero/mineria1.jpg',
    title: 'Equipos para Minería',
    subtitle: 'Protección certificada para operaciones mineras',
    badge: '🏔️ Minería'
  },
  {
    image: 'assets/images/hero/mineria2.jpg',
    title: 'Seguridad Industrial',
    subtitle: 'EPP de alta resistencia para trabajos pesados',
    badge: '⚙️ Industria Pesada'
  },
  {
    image: 'assets/images/hero/refineria.jpg',
    title: 'Refinerías y Petróleo',
    subtitle: 'Equipos especializados para la industria petrolera',
    badge: '🛢️ Refinería'
  }
  ];
  currentSlideIndex: number = 0;
  heroInterval: any;

  constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarProductosDestacados();
    this.cargarCategorias();
    this.iniciarCarruselHero();
  }

  ngOnDestroy() {
    this.detenerAutoPlay();
    this.detenerCarruselHero();
  }

  // ========================================
  // CARRUSEL DE HERO
  // ========================================

  iniciarCarruselHero() {
    this.heroInterval = setInterval(() => {
      this.nextHeroSlide();
    }, 6000);
  }

  detenerCarruselHero() {
    if (this.heroInterval) {
      clearInterval(this.heroInterval);
    }
  }

  nextHeroSlide() {
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.heroSlides.length;
    this.cdr.markForCheck();
  }

  prevHeroSlide() {
    this.currentSlideIndex = this.currentSlideIndex === 0 
      ? this.heroSlides.length - 1 
      : this.currentSlideIndex - 1;
    this.cdr.markForCheck();
  }

  goToSlide(index: number) {
    this.currentSlideIndex = index;
    this.cdr.markForCheck();
  }

  // ========================================
  // CARRUSEL DE PRODUCTOS
  // ========================================

  cargarProductosDestacados() {
    this.productoService.obtenerDestacados().subscribe({
      next: (data) => {
        this.productosOriginales = data.map(p => this.procesarProducto(p));
        
        this.productosDestacados = [
          ...this.productosOriginales,
          ...this.productosOriginales,
          ...this.productosOriginales
        ];
        
        this.actualizarProductosVisibles();
        console.log('✅ Productos cargados:', this.productosOriginales.length);
        
        setTimeout(() => {
          this.iniciarAutoPlay();
        }, 100);
        
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

  actualizarProductosVisibles() {
    this.productosVisibles = this.productosDestacados.slice(
      this.currentIndex,
      this.currentIndex + this.itemsPerView
    );
  }

  nextSlide() {
    this.currentIndex++;
    
    const maxIndex = this.productosOriginales.length * 2;
    if (this.currentIndex >= maxIndex) {
      this.currentIndex = this.productosOriginales.length;
    }
    
    this.actualizarProductosVisibles();
    this.cdr.detectChanges();
  }

  prevSlide() {
    this.currentIndex--;
    
    if (this.currentIndex < 0) {
      this.currentIndex = this.productosOriginales.length - 1;
    }
    
    this.actualizarProductosVisibles();
    this.cdr.detectChanges();
  }

  iniciarAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
    
    this.autoPlayInterval = setInterval(() => {
      if (!this.isPaused && this.productosDestacados.length > 0) {
        this.nextSlide();
      }
    }, 3000);
  }

  detenerAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  pauseCarousel() {
    this.isPaused = true;
  }

  resumeCarousel() {
    this.isPaused = false;
  }

  reiniciarAutoPlay() {
    this.detenerAutoPlay();
    this.iniciarAutoPlay();
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