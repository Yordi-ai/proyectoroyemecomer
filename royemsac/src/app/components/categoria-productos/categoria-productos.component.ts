import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductoService, Producto } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito.service';

interface ProductoProcesado extends Producto {
  imagenUrl: string;
}

@Component({
  selector: 'app-categoria-productos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './categoria-productos.component.html',
  styleUrl: './categoria-productos.component.css',
  changeDetection: ChangeDetectionStrategy.Default
})
export class CategoriaProductosComponent implements OnInit {
  productos: ProductoProcesado[] = [];
  nombreCategoria: string = '';
  esCategoriaPrincipal: boolean = false;
  mostrarToast: boolean = false;
  mensajeToast: string = '';
  cargando: boolean = true;

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
    private route: ActivatedRoute,
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // ✅ SCROLL AL INICIO
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    this.route.params.subscribe(params => {
      const categoria = params['categoria'];
      if (categoria) {
        this.nombreCategoria = decodeURIComponent(categoria);
        this.cargarProductosPorCategoria(this.nombreCategoria);
      }
    });
  }

  cargarProductosPorCategoria(categoria: string) {
    this.cargando = true;
    this.cdr.markForCheck();

    // Verificar si es categoría principal
    if (this.mapaCategoriasSubcategorias[categoria]) {
      this.esCategoriaPrincipal = true;
      this.cargarCategoriaPrincipal(categoria);
    } else {
      this.esCategoriaPrincipal = false;
      // ✅ BUSCAR POR NOMBRE Y CATEGORÍA
      this.buscarPorNombreYCategoria(categoria);
    }
  }

  private cargarCategoriaPrincipal(categoriaPrincipal: string) {
    const subcategorias = this.mapaCategoriasSubcategorias[categoriaPrincipal];
    
    this.productoService.obtenerTodos().subscribe({
      next: (data) => {
        const productosFiltrados = data.filter(p => 
          subcategorias.some(sub => 
            this.coincide(p.categoria, sub)
          )
        );
        
        this.productos = productosFiltrados.map(p => this.procesarProducto(p));
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar categoría principal:', err);
        this.productos = [];
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ✅ NUEVA FUNCIÓN - Busca por NOMBRE y CATEGORÍA
  private buscarPorNombreYCategoria(termino: string) {
    this.productoService.obtenerTodos().subscribe({
      next: (data) => {
        const t = termino.toLowerCase().trim();
        
        // Filtrar por nombre O categoría
        const productosFiltrados = data.filter(p => {
          const nombreMatch = p.nombre.toLowerCase().includes(t);
          const categoriaMatch = p.categoria.toLowerCase().includes(t);
          return nombreMatch || categoriaMatch;
        });
        
        this.productos = productosFiltrados.map(p => this.procesarProducto(p));
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error en búsqueda:', err);
        this.productos = [];
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ✅ COINCIDENCIA FLEXIBLE
  private coincide(cat1: string, cat2: string): boolean {
    const c1 = cat1.toLowerCase().trim();
    const c2 = cat2.toLowerCase().trim();
    return c1.includes(c2) || c2.includes(c1) || c1 === c2;
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
    if (!imagen) return 'https://via.placeholder.com/300x200?text=Sin+Imagen';
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

  obtenerDescripcionCategoria(): string {
    if (this.esCategoriaPrincipal) {
      return `Explora nuestra línea completa de ${this.nombreCategoria.toLowerCase()}`;
    }
    
    const descripciones: { [key: string]: string } = {
      'Protección de manos': 'Guantes industriales certificados para máxima protección',
      'Protección de pies': 'Calzado de seguridad resistente y cómodo',
      'Protección respiratoria': 'Respiradores y mascarillas certificadas',
      'Protección de cabeza, visual y facial': 'Cascos, lentes y protectores faciales',
      'Herramientas manuales': 'Herramientas de alta calidad para trabajo profesional',
      'Herramientas eléctricas': 'Equipos eléctricos industriales de última generación'
    };
    
    return descripciones[this.nombreCategoria] || `Resultados para: "${this.nombreCategoria}"`;
  }
}