import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CarritoService } from './services/carrito.service';
import { AuthService } from './services/auth.service';
import { UserModel } from './models/user.model';

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

  logout() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      this.authService.logout();
      alert('Sesión cerrada exitosamente');
      this.router.navigate(['/']);
    }
  }
}