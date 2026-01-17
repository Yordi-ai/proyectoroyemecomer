import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoService, Producto } from '../../services/producto.service';
import { AuthService } from '../../services/auth.service';
import { ImagenService } from '../../services/imagen.service';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  productos: Producto[] = [];
  productoEditando: Producto | null = null;
  nuevoProducto: Producto = this.inicializarProducto();
  modoEdicion: boolean = false;
  mostrarFormulario: boolean = false;

  // Variables para manejo de imágenes
  archivoSeleccionado: File | null = null;
  imagenPreview: string | null = null;
  subiendoImagen: boolean = false;

  constructor(
    private productoService: ProductoService,
    private authService: AuthService,
    private imagenService: ImagenService,
    private router: Router
  ) {}

  ngOnInit() {
    const usuario = this.authService.obtenerUsuario();
    if (!usuario || usuario.rol !== 'ADMIN') {
      alert('Acceso denegado. Solo administradores.');
      this.router.navigate(['/']);
      return;
    }
    
    this.cargarProductos();
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
      this.imagenPreview = 'http://localhost:8080' + producto.imagen;
    }
  }

  // Manejar selección de archivo
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar que sea imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
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
  }

  // Subir imagen al servidor
  subirImagen(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.archivoSeleccionado) {
        resolve(this.nuevoProducto.imagen); // Mantener imagen actual
        return;
      }

      this.subiendoImagen = true;
      this.imagenService.subirImagen(this.archivoSeleccionado).subscribe({
        next: (response) => {
          this.subiendoImagen = false;
          resolve(response.url); // URL de la imagen subida
        },
        error: (err) => {
          this.subiendoImagen = false;
          console.error('Error al subir imagen:', err);
          alert('Error al subir la imagen');
          reject(err);
        }
      });
    });
  }

  async guardarProducto() {
    if (!this.validarProducto()) {
      return;
    }

    try {
      // Subir imagen primero (si hay una nueva)
      const urlImagen = await this.subirImagen();
      this.nuevoProducto.imagen = urlImagen;

      // Guardar producto
      this.productoService.guardar(this.nuevoProducto).subscribe({
        next: (data) => {
          alert(this.modoEdicion ? 'Producto actualizado ✅' : 'Producto creado ✅');
          this.cargarProductos();
          this.cancelar();
        },
        error: (err) => {
          console.error('Error al guardar producto:', err);
          alert('Error al guardar producto');
        }
      });
    } catch (error) {
      console.error('Error en el proceso:', error);
    }
  }

  eliminarProducto(id: number) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.productoService.eliminar(id).subscribe({
        next: () => {
          alert('Producto eliminado ✅');
          this.cargarProductos();
        },
        error: (err) => {
          console.error('Error al eliminar producto:', err);
          alert('Error al eliminar producto');
        }
      });
    }
  }

  validarProducto(): boolean {
    if (!this.nuevoProducto.nombre || !this.nuevoProducto.precio || !this.nuevoProducto.categoria) {
      alert('Por favor completa todos los campos obligatorios');
      return false;
    }
    return true;
  }

  cancelar() {
    this.mostrarFormulario = false;
    this.nuevoProducto = this.inicializarProducto();
    this.modoEdicion = false;
    this.archivoSeleccionado = null;
    this.imagenPreview = null;
  }

  // Obtener URL completa de imagen
  obtenerUrlImagen(imagen: string): string {
    if (!imagen) return '';
    if (imagen.startsWith('http')) return imagen;
    return 'http://localhost:8080' + imagen;
  }
}