import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { CarritoComponent } from './components/carrito/carrito.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { ProductoDetalleComponent } from './components/producto-detalle/producto-detalle.component';
import { MisPedidosComponent } from './components/mis-pedidos/mis-pedidos.component';
import { AdminComponent } from './components/admin/admin.component';
import { AdminUsuariosComponent } from './components/admin-usuarios/admin-usuarios.component';
import { AdminPedidosComponent } from './components/admin-pedidos/admin-pedidos.component';
import { CategoriaProductosComponent } from './components/categoria-productos/categoria-productos.component';

export const routes: Routes = [
  // ✅ PÁGINA PRINCIPAL
  { path: '', component: HomeComponent },
  
  // ✅ AUTENTICACIÓN
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  
  // ✅ CARRITO Y CHECKOUT
  { path: 'carrito', component: CarritoComponent },
  { path: 'checkout', component: CheckoutComponent },
  
  // ✅ PRODUCTOS
  { path: 'producto/:id', component: ProductoDetalleComponent },
  { path: 'categoria/:categoria', component: CategoriaProductosComponent },
  
  // ✅ USUARIO
  { path: 'mis-pedidos', component: MisPedidosComponent },
  
  // ✅ ADMIN
  { path: 'admin', component: AdminComponent },
  { path: 'admin/usuarios', component: AdminUsuariosComponent },
  { path: 'admin/pedidos', component: AdminPedidosComponent },
  
  // ✅ REDIRECT PARA RUTAS NO ENCONTRADAS
  { path: '**', redirectTo: '' }
];
