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
// ❌ COMENTADOS TEMPORALMENTE
// import { AuthGuard } from './guards/auth.guard';
// import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'carrito', component: CarritoComponent },
  { path: 'checkout', component: CheckoutComponent }, // ✅ Sin guard temporalmente
  { path: 'producto/:id', component: ProductoDetalleComponent },
  { path: 'mis-pedidos', component: MisPedidosComponent }, // ✅ Sin guard temporalmente
  { path: 'admin', component: AdminComponent }, // ✅ Sin guard temporalmente
  { path: 'admin/usuarios', component: AdminUsuariosComponent }, // ✅ Sin guard temporalmente
  { path: 'admin/pedidos', component: AdminPedidosComponent }, // ✅ Sin guard temporalmente
  
  // ✅ NUEVA RUTA PARA CATEGORÍAS
  { path: 'categoria/:categoria', component: CategoriaProductosComponent },
  
  { path: '**', redirectTo: '' }
];