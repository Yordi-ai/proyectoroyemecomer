import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService, Producto } from '../../services/producto.service';
import { AuthService } from '../../services/auth.service';
import { ImagenService } from '../../services/imagen.service';
import { UserModel } from '../../models/user.model';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

// ✅ NUEVA INTERFAZ
interface ProductoConUrl extends Producto {
  imagenUrl: string;
}

interface EstadisticasAdmin {
  totalProductos: number;
  totalUsuarios: number;
  totalPedidos: number;
  ventasDelMes: number;
}

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  // Usuario actual
  currentUser: UserModel | null = null;

  // Productos - ✅ ACTUALIZADO
  productos: ProductoConUrl[] = [];
  productosFiltrados: ProductoConUrl[] = [];
  productoEditando: Producto | null = null;
  nuevoProducto: Producto = this.inicializarProducto();
  
  // Estados
  modoEdicion: boolean = false;
  mostrarFormulario: boolean = false;
  cargando: boolean = false;
  
  // Imágenes
  archivoSeleccionado: File | null = null;
  imagenPreview: string | null = null;
  subiendoImagen: boolean = false;

  // Búsqueda y filtros
  terminoBusqueda: string = '';
  categoriaFiltro: string = '';
  categorias: string[] = [];

  // Estadísticas (opcional)
  estadisticas: EstadisticasAdmin = {
    totalProductos: 0,
    totalUsuarios: 0,
    totalPedidos: 0,
    ventasDelMes: 0
  };

  // Vistas del panel
  vistaActual: 'productos' | 'usuarios' | 'pedidos' | 'estadisticas' = 'productos';

  constructor(
    private productoService: ProductoService,
    private authService: AuthService,
    private imagenService: ImagenService,
    private router: Router
  ) {
    // Detectar cambios de ruta para mantener sidebar sincronizado
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.url;
      if (url.includes('/admin/usuarios')) {
        this.vistaActual = 'usuarios';
      } else if (url.includes('/admin/pedidos')) {
        this.vistaActual = 'pedidos';
      } else if (url === '/admin' || url.startsWith('/admin?')) {
        this.vistaActual = 'productos';
      }
    });
  }

  ngOnInit() {
    // Verificar autenticación y rol de admin
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.authService.isAdmin()) {
      alert('Acceso denegado. Solo administradores.');
      this.router.navigate(['/']);
      return;
    }

    // Obtener usuario actual
    this.currentUser = this.authService.getCurrentUser();
    
    // Cargar datos iniciales
    this.cargarProductos();
    this.cargarEstadisticas();
  }

  // ============== GESTIÓN DE PRODUCTOS ==============

  // ✅ OPTIMIZADO
  cargarProductos() {
    this.cargando = true;
    this.productoService.obtenerTodos().subscribe({
      next: (data) => {
        // Pre-procesar las URLs de las imágenes
        this.productos = data.map(p => ({
          ...p,
          imagenUrl: this.obtenerUrlImagen(p.imagen)
        }));
        this.productosFiltrados = this.productos;
        this.extraerCategorias();
        this.estadisticas.totalProductos = data.length;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        alert('Error al cargar productos');
        this.cargando = false;
      }
    });
  }

  extraerCategorias() {
    const categoriasSet = new Set(this.productos.map(p => p.categoria).filter(c => c));
    this.categorias = Array.from(categoriasSet).sort();
  }

  filtrarProductos() {
    this.productosFiltrados = this.productos.filter(producto => {
      const coincideBusqueda = !this.terminoBusqueda || 
        producto.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
        producto.descripcion?.toLowerCase().includes(this.terminoBusqueda.toLowerCase());
      
      const coincideCategoria = !this.categoriaFiltro || 
        producto.categoria === this.categoriaFiltro;
      
      return coincideBusqueda && coincideCategoria;
    });
  }

  inicializarProducto(): Producto {
    return {
      id: 0,
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      imagen: '',
      categoria: ''
    };
  }

  mostrarFormularioNuevo() {
    this.nuevoProducto = this.inicializarProducto();
    this.modoEdicion = false;
    this.mostrarFormulario = true;
    this.archivoSeleccionado = null;
    this.imagenPreview = null;
  }

  editarProducto(producto: Producto) {
    this.nuevoProducto = { ...producto };
    this.modoEdicion = true;
    this.mostrarFormulario = true;
    this.archivoSeleccionado = null;
    
    // Mostrar imagen actual si existe
    if (producto.imagen) {
      this.imagenPreview = this.obtenerUrlImagen(producto.imagen);
    }
  }

  // ============== MANEJO DE IMÁGENES ==============

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida (JPG, PNG, etc.)');
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('La imagen no debe superar los 5MB');
      return;
    }

    this.archivoSeleccionado = file;

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagenPreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  async subirImagen(): Promise<string> {
    if (!this.archivoSeleccionado) {
      return this.nuevoProducto.imagen; // Mantener imagen actual
    }

    return new Promise((resolve, reject) => {
      this.subiendoImagen = true;
      
      this.imagenService.subirImagen(this.archivoSeleccionado!).subscribe({
        next: (response) => {
          this.subiendoImagen = false;
          resolve(response.url);
        },
        error: (err) => {
          this.subiendoImagen = false;
          console.error('Error al subir imagen:', err);
          alert('Error al subir la imagen. Por favor intenta de nuevo.');
          reject(err);
        }
      });
    });
  }

  // ============== GUARDAR Y VALIDAR ==============

  async guardarProducto() {
    if (!this.validarProducto()) {
      return;
    }

    this.cargando = true;

    try {
      // Subir imagen primero (si hay una nueva)
      const urlImagen = await this.subirImagen();
      this.nuevoProducto.imagen = urlImagen;

      // Guardar producto
      this.productoService.guardar(this.nuevoProducto).subscribe({
        next: (data) => {
          const mensaje = this.modoEdicion 
            ? '✅ Producto actualizado exitosamente' 
            : '✅ Producto creado exitosamente';
          
          alert(mensaje);
          this.cargarProductos();
          this.cancelar();
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al guardar producto:', err);
          alert('❌ Error al guardar el producto. Por favor intenta de nuevo.');
          this.cargando = false;
        }
      });
    } catch (error) {
      console.error('Error en el proceso:', error);
      this.cargando = false;
    }
  }

  validarProducto(): boolean {
    if (!this.nuevoProducto.nombre?.trim()) {
      alert('⚠️ El nombre del producto es obligatorio');
      return false;
    }

    if (!this.nuevoProducto.categoria?.trim()) {
      alert('⚠️ La categoría es obligatoria');
      return false;
    }

    if (this.nuevoProducto.precio <= 0) {
      alert('⚠️ El precio debe ser mayor a 0');
      return false;
    }

    if (this.nuevoProducto.stock < 0) {
      alert('⚠️ El stock no puede ser negativo');
      return false;
    }

    return true;
  }

  eliminarProducto(id: number) {
    if (!confirm('⚠️ ¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) {
      return;
    }

    this.productoService.eliminar(id).subscribe({
      next: () => {
        alert('✅ Producto eliminado exitosamente');
        this.cargarProductos();
      },
      error: (err) => {
        console.error('Error al eliminar producto:', err);
        alert('❌ Error al eliminar el producto');
      }
    });
  }

  cancelar() {
    this.mostrarFormulario = false;
    this.nuevoProducto = this.inicializarProducto();
    this.modoEdicion = false;
    this.archivoSeleccionado = null;
    this.imagenPreview = null;
  }

  // ============== UTILIDADES ==============

  private obtenerUrlImagen(imagen: string): string {
    if (!imagen) return '';
    if (imagen.startsWith('http')) return imagen;
    return `http://localhost:8080${imagen}`;
  }

  get productosConStock(): number {
    return this.productos.filter(p => p.stock > 0).length;
  }

  get productosStockBajo(): number {
    return this.productos.filter(p => p.stock > 0 && p.stock <= 10).length;
  }

  cambiarVista(vista: 'productos' | 'usuarios' | 'pedidos' | 'estadisticas') {
    if (vista === 'usuarios') {
      this.router.navigate(['/admin/usuarios']);
    } else if (vista === 'pedidos') {
      this.router.navigate(['/admin/pedidos']);
    } else {
      this.vistaActual = vista;
    }
  }

  cargarEstadisticas() {
    this.estadisticas.totalProductos = this.productos.length;
  }

  cerrarSesion() {
    if (confirm('¿Deseas cerrar sesión?')) {
      this.authService.logout();
    }
  }

  get nombreAdmin(): string {
    return this.currentUser?.nombreCompleto || 'Administrador';
  }

  // ✅ NUEVO: TrackBy para optimizar renderizado
  trackByProductoId(index: number, producto: ProductoConUrl): number {
    return producto.id;
  }
}