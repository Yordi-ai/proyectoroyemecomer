
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImagenService {
  private apiUrl = 'http://localhost:8080/api/imagenes';

  constructor(private http: HttpClient) {}

  subirImagen(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  obtenerUrlImagen(filename: string): string {
    return `${this.apiUrl}/${filename}`;
  }

  eliminarImagen(filename: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${filename}`);
  }
}