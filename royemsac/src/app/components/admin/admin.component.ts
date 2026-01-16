import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoService, Producto } from '../../services/producto.service';
import { AuthService } from '../../services/auth.service';

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

  constructor(
    private productoService: ProductoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Verificar si el usuario es admin
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
  }

  editarProducto(producto: Producto) {
    this.nuevoProducto = { ...producto };
    this.modoEdicion = true;
    this.mostrarFormulario = true;
  }

  guardarProducto() {
    if (!this.validarProducto()) {
      return;
    }

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
  }
}