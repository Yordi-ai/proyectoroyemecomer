import { Routes } from '@angular/router';
import { CarritoComponent } from './components/carrito/carrito.component';
import { HomeComponent } from './components/home/home.component';
import { ProductoDetalleComponent } from './components/producto-detalle/producto-detalle.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { AdminComponent } from './components/admin/admin.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { MisPedidosComponent } from './components/mis-pedidos/mis-pedidos.component';
import { AdminPedidosComponent } from './components/admin-pedidos/admin-pedidos.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'producto/:id', component: ProductoDetalleComponent },
  { path: 'carrito', component: CarritoComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  
  // Rutas protegidas - requieren autenticación
  { 
    path: 'checkout', 
    component: CheckoutComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'mis-pedidos', 
    component: MisPedidosComponent,
    canActivate: [authGuard]
  },
  
  // Rutas protegidas - solo ADMIN
  { 
    path: 'admin', 
    component: AdminComponent,
    canActivate: [adminGuard]
  },
  { 
    path: 'admin/pedidos', 
    component: AdminPedidosComponent,
    canActivate: [adminGuard]
  },
  
  { path: '**', redirectTo: '' }
];