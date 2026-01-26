import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, UserEstadisticas } from '../../services/admin.service';
import { UserModel } from '../../models/user.model';
import { Role, RoleDisplay } from '../../models/role.enum';
import { RegisterRequest } from '../../models/auth.models';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-usuarios.component.html',
  styleUrl: './admin-usuarios.component.css'
})
export class AdminUsuariosComponent implements OnInit {
  // Usuarios
  usuarios: UserModel[] = [];
  usuariosFiltrados: UserModel[] = [];

  // Estados
  cargando: boolean = false;
  mostrarFormulario: boolean = false;

  // Formulario
  nuevoAdmin: RegisterRequest = this.inicializarFormulario();

  // Filtros
  terminoBusqueda: string = '';
  rolFiltro: string = '';
  estadoFiltro: string = '';

  // Estadísticas
  estadisticas: UserEstadisticas = {
    total: 0,
    admins: 0,
    clientes: 0,
    activos: 0,
    inactivos: 0
  };

  // Enums para template
  Role = Role;
  RoleDisplay = RoleDisplay;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  // ============== CARGA DE DATOS ==============

  cargarUsuarios(): void {
    this.cargando = true;
    
    this.adminService.listarUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.usuariosFiltrados = usuarios;
        this.actualizarEstadisticas();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        alert('❌ Error al cargar usuarios: ' + error.message);
        this.cargando = false;
      }
    });
  }

  actualizarEstadisticas(): void {
    this.adminService.obtenerEstadisticas().subscribe({
      next: (stats) => {
        this.estadisticas = stats;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }

  // ============== FILTROS ==============

  aplicarFiltros(): void {
    let resultado = [...this.usuarios];

    // Filtro por búsqueda
    if (this.terminoBusqueda) {
      resultado = this.adminService.buscarUsuarios(resultado, this.terminoBusqueda);
    }

    // Filtro por rol
    if (this.rolFiltro) {
      resultado = this.adminService.filtrarPorRol(resultado, this.rolFiltro as Role);
    }

    // Filtro por estado
    if (this.estadoFiltro !== '') {
      const activo = this.estadoFiltro === 'true';
      resultado = this.adminService.filtrarPorEstado(resultado, activo);
    }

    this.usuariosFiltrados = resultado;
  }

  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.rolFiltro = '';
    this.estadoFiltro = '';
    this.usuariosFiltrados = [...this.usuarios];
  }

  // ============== FORMULARIO ==============

  inicializarFormulario(): RegisterRequest {
    return {
      email: '',
      password: '',
      nombre: '',
      apellido: '',
      telefono: '',
      direccion: ''
    };
  }

  mostrarFormularioCrear(): void {
    this.nuevoAdmin = this.inicializarFormulario();
    this.mostrarFormulario = true;
  }

  cancelarFormulario(): void {
    this.mostrarFormulario = false;
    this.nuevoAdmin = this.inicializarFormulario();
  }

  crearAdministrador(): void {
    // Validar
    const error = this.adminService.validarDatosAdmin(this.nuevoAdmin);
    if (error) {
      alert('⚠️ ' + error);
      return;
    }

    this.cargando = true;

    this.adminService.crearAdmin(this.nuevoAdmin).subscribe({
      next: (nuevoUsuario) => {
        alert('✅ Administrador creado exitosamente');
        this.cargarUsuarios();
        this.cancelarFormulario();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al crear admin:', error);
        alert('❌ Error al crear administrador: ' + error.message);
        this.cargando = false;
      }
    });
  }

  // ============== ACCIONES DE USUARIOS ==============

  activarUsuario(usuario: UserModel): void {
    if (!confirm(`¿Activar al usuario ${usuario.nombreCompleto}?`)) {
      return;
    }

    this.adminService.activarUsuario(usuario.id).subscribe({
      next: () => {
        alert('✅ Usuario activado exitosamente');
        this.cargarUsuarios();
      },
      error: (error) => {
        console.error('Error al activar:', error);
        alert('❌ Error al activar usuario: ' + error.message);
      }
    });
  }

  desactivarUsuario(usuario: UserModel): void {
    if (!confirm(`⚠️ ¿Desactivar al usuario ${usuario.nombreCompleto}?\n\nNo podrá iniciar sesión hasta que sea reactivado.`)) {
      return;
    }

    this.adminService.desactivarUsuario(usuario.id).subscribe({
      next: () => {
        alert('✅ Usuario desactivado exitosamente');
        this.cargarUsuarios();
      },
      error: (error) => {
        console.error('Error al desactivar:', error);
        alert('❌ Error al desactivar usuario: ' + error.message);
      }
    });
  }

  eliminarUsuario(usuario: UserModel): void {
    if (!confirm(`⚠️ ¿ELIMINAR permanentemente al usuario ${usuario.nombreCompleto}?\n\n⚠️ ESTA ACCIÓN NO SE PUEDE DESHACER`)) {
      return;
    }

    this.adminService.eliminarUsuario(usuario.id).subscribe({
      next: () => {
        alert('✅ Usuario eliminado exitosamente');
        this.cargarUsuarios();
      },
      error: (error) => {
        console.error('Error al eliminar:', error);
        alert('❌ Error al eliminar usuario: ' + error.message);
      }
    });
  }

  // ============== UTILIDADES ==============

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  obtenerIconoRol(rol: Role): string {
    return rol === Role.ADMIN ? '👑' : '👤';
  }

  obtenerColorEstado(activo: boolean): string {
    return activo ? 'badge-success' : 'badge-danger';
  }
}