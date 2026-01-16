import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen: string;
  categoria: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'http://localhost:8080/api/productos';

  constructor(private http: HttpClient) { }

  obtenerTodos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  buscarProductos(query: string): Observable<Producto[]> {
  return this.http.get<Producto[]>(`${this.apiUrl}/buscar?query=${query}`);
}

obtenerPorCategoria(categoria: string): Observable<Producto[]> {
  return this.http.get<Producto[]>(`${this.apiUrl}/categoria/${categoria}`);
}

obtenerCategorias(): Observable<string[]> {
  return this.http.get<string[]>(`${this.apiUrl}/categorias`);
}
guardar(producto: Producto): Observable<Producto> {
  if (producto.id && producto.id > 0) {
    return this.http.put<Producto>(`${this.apiUrl}/${producto.id}`, producto);
  } else {
    return this.http.post<Producto>(this.apiUrl, producto);
  }
}

eliminar(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${id}`);
}
}