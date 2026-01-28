import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
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
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  productos: ProductoProcesado[] = [];
  categorias: string[] = [];
  terminoBusqueda: string = '';
  categoriaSeleccionada: string = '';
  
  mostrarToast: boolean = false;
  mensajeToast: string = '';

  // ✅ MAPEO DE CATEGORÍAS PRINCIPALES A SUBCATEGORÍAS
  private mapaCategoriasSubcategorias: { [key: string]: string[] } = {
    'Seguridad Industrial': [
      'Protección de pies',
      'Protección de manos',
      'Protección corporal',
      'Protección anticaída',
      'Protección auditiva',
      'Protección respiratoria',
      'Protección de cabeza, visual y facial',
      'Ropa de trabajo',
      'Bloqueo y etiquetado',
      'Paños de seguridad industrial',
      'Señalización',
      'Emergencia y primeros auxilios',
      'Protección solar'
    ],
    'Eléctricos e Instrumentación': [
      'Materiales eléctricos',
      'Iluminación',
      'Conductores',
      'Cintas aislantes',
      'Elementos de protección eléctrica',
      'Amarracables'
    ],
    'Herramientas Industriales': [
      'Herramientas manuales',
      'Herramientas eléctricas',
      'Herramientas inalámbricas',
      'Instrumentos de medición',
      'Almacenamiento de herramientas',
      'Herramientas neumáticas',
      'Otras herramientas manuales y accesorios'
    ],
    'MRO & Misceláneos': [
      'Mantenimiento y limpieza',
      'Ferretería industrial',
      'Materiales de construcción',
      'Abastecimiento integral',
      'Equipamiento de campamentos'
    ]
  };

  constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute // ✅ NUEVO: Para escuchar queryParams
  ) {}

  ngOnInit() {
    this.cargarCategorias();
    
    // ✅ ESCUCHAR CAMBIOS EN URL
    this.route.queryParams.subscribe(params => {
      const categoria = params['categoria'];
      
      if (categoria) {
        this.categoriaSeleccionada = categoria;
        this.filtrarPorCategoriaDesdeURL(categoria);
      } else {
        this.categoriaSeleccionada = '';
        this.cargarProductos();
      }
    });
  }

  cargarProductos() {
    this.productoService.obtenerTodos().subscribe({
      next: (data) => {
        this.productos = data.map(p => this.procesarProducto(p));
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.cdr.markForCheck();
      }
    });
  }

  cargarCategorias() {
    this.productoService.obtenerCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
        this.cdr.markForCheck();
      }
    });
  }

  // ✅ NUEVO: Filtra por categoría desde URL
  filtrarPorCategoriaDesdeURL(categoria: string) {
    // Verificar si es una categoría principal
    if (this.mapaCategoriasSubcategorias[categoria]) {
      // Es categoría principal - mostrar TODOS los productos de sus subcategorías
      this.filtrarPorCategoriaPrincipal(categoria);
    } else {
      // Es subcategoría - mostrar solo productos de esa subcategoría
      this.filtrarPorSubcategoria(categoria);
    }
  }

  // ✅ FILTRAR POR CATEGORÍA PRINCIPAL (muestra todos sus productos)
  private filtrarPorCategoriaPrincipal(categoriaPrincipal: string) {
    const subcategorias = this.mapaCategoriasSubcategorias[categoriaPrincipal];
    
    this.productoService.obtenerTodos().subscribe({
      next: (data) => {
        // Filtrar productos que pertenezcan a cualquiera de las subcategorías
        const productosFiltrados = data.filter(p => 
          subcategorias.some(sub => 
            p.categoria.toLowerCase().includes(sub.toLowerCase()) ||
            sub.toLowerCase().includes(p.categoria.toLowerCase())
          )
        );
        
        this.productos = productosFiltrados.map(p => this.procesarProducto(p));
        this.cdr.markForCheck();
        
        // Scroll automático a productos
        setTimeout(() => this.scrollToProducts(), 100);
      },
      error: (err) => {
        console.error('Error al filtrar por categoría principal:', err);
        this.cdr.markForCheck();
      }
    });
  }

  // ✅ FILTRAR POR SUBCATEGORÍA ESPECÍFICA
  private filtrarPorSubcategoria(subcategoria: string) {
    this.productoService.obtenerPorCategoria(subcategoria).subscribe({
      next: (data) => {
        this.productos = data.map(p => this.procesarProducto(p));
        this.cdr.markForCheck();
        
        // Scroll automático a productos
        setTimeout(() => this.scrollToProducts(), 100);
      },
      error: (err) => {
        console.error('Error al filtrar por subcategoría:', err);
        // Si falla, intentar búsqueda parcial
        this.buscarPorCategoriaFlexible(subcategoria);
      }
    });
  }

  // ✅ BÚSQUEDA FLEXIBLE (si la búsqueda exacta falla)
  private buscarPorCategoriaFlexible(categoria: string) {
    this.productoService.obtenerTodos().subscribe({
      next: (data) => {
        const productosFiltrados = data.filter(p => 
          p.categoria.toLowerCase().includes(categoria.toLowerCase()) ||
          categoria.toLowerCase().includes(p.categoria.toLowerCase())
        );
        
        this.productos = productosFiltrados.map(p => this.procesarProducto(p));
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error en búsqueda flexible:', err);
        this.cdr.markForCheck();
      }
    });
  }

  buscarProductos() {
    if (this.terminoBusqueda.trim()) {
      this.productoService.buscarProductos(this.terminoBusqueda).subscribe({
        next: (data) => {
          this.productos = data.map(p => this.procesarProducto(p));
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error al buscar productos:', err);
          this.cdr.markForCheck();
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
          this.productos = data.map(p => this.procesarProducto(p));
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error al filtrar productos:', err);
          this.cdr.markForCheck();
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
    const element = document.getElementById('productsGrid');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

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
