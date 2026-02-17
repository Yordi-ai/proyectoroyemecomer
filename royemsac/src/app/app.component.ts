import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CarritoService } from './services/carrito.service';
import { AuthService } from './services/auth.service';
import { UserModel } from './models/user.model';
import { CategoriaService, CategoriaPrincipal } from './services/categoria.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'royemsac';
  cartCount = 0;
  usuarioActual: UserModel | null = null;
  mostrarMenuProductos = false;
  categoriaActivaIndex: number | null = null;

  // ✅ AHORA USA EL TIPO DEL SERVICIO
  categoriasMenu: CategoriaPrincipal[] = [];

  constructor(
    private carritoService: CarritoService,
    private authService: AuthService,
    private router: Router,
    private categoriaService: CategoriaService
  ) {}

  ngOnInit() {
    // Carrito
    this.carritoService.carrito$.subscribe(() => {
      this.cartCount = this.carritoService.obtenerCantidadTotal();
    });

    // Usuario
    this.authService.currentUser$.subscribe(usuario =>  {
      this.usuarioActual = usuario;
    });

    // ✅ CARGAR CATEGORÍAS Y ESCUCHAR CAMBIOS EN TIEMPO REAL
    this.categoriaService.obtenerCategorias().subscribe(categorias => {
      this.categoriasMenu = this.categoriaService.obtenerCategoriasVisibles();
    });
  }

  esAdmin(): boolean {
    return this.authService.isAdmin();
  }

  activarCategoria(index: number) {
    this.categoriaActivaIndex = index;
  }

  desactivarCategoria() {
    this.categoriaActivaIndex = null;
  }

  navegarACategoria(categoria: string) {
    const categoriaEncoded = encodeURIComponent(categoria);
    this.router.navigate(['/categoria', categoriaEncoded]);
    this.mostrarMenuProductos = false;
    this.categoriaActivaIndex = null;
  }

  logout() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      this.authService.logout();
      alert('Sesión cerrada exitosamente');
      this.router.navigate(['/']);
    }
  }
}