import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CarritoService } from './services/carrito.service';
import { AuthService } from './services/auth.service';
import { UserModel } from './models/user.model';

interface CategoriaMenu {
  nombre: string;
  subcategorias: string[];
}

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

  categoriasMenu: CategoriaMenu[] = [
    {
      nombre: 'Seguridad Industrial',
      subcategorias: [
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
      ]
    },
    {
      nombre: 'Eléctricos e Instrumentación',
      subcategorias: [
        'Materiales eléctricos',
        'Iluminación',
        'Conductores',
        'Cintas aislantes',
        'Elementos de protección eléctrica',
        'Amarracables'
      ]
    },
    {
      nombre: 'Herramientas Industriales',
      subcategorias: [
        'Herramientas manuales',
        'Herramientas eléctricas',
        'Herramientas inalámbricas',
        'Instrumentos de medición',
        'Almacenamiento de herramientas',
        'Herramientas neumáticas',
        'Otras herramientas manuales y accesorios'
      ]
    },
    {
      nombre: 'MRO & Misceláneos',
      subcategorias: [
        'Mantenimiento y limpieza',
        'Ferretería industrial',
        'Materiales de construcción',
        'Abastecimiento integral',
        'Equipamiento de campamentos'
      ]
    }
  ];

  constructor(
    private carritoService: CarritoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.carritoService.carrito$.subscribe(() => {
      this.cartCount = this.carritoService.obtenerCantidadTotal();
    });

    this.authService.currentUser$.subscribe(usuario =>  {
      this.usuarioActual = usuario;
    });
  }

  esAdmin(): boolean {
    return this.authService.isAdmin();
  }

  // ✅ ACTUALIZADO: Navegar a página dedicada de categoría
  navegarACategoria(categoria: string) {
    // Codificar la categoría para URL (maneja espacios y caracteres especiales)
    const categoriaEncoded = encodeURIComponent(categoria);
    this.router.navigate(['/categoria', categoriaEncoded]);
    this.mostrarMenuProductos = false;
  }

  logout() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      this.authService.logout();
      alert('Sesión cerrada exitosamente');
      this.router.navigate(['/']);
    }
  }
}