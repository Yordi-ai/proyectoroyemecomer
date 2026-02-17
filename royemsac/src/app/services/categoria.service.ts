import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Subcategoria {
  id: string;
  nombre: string;
  visible: boolean;
  orden: number;
}

export interface CategoriaPrincipal {
  id: string;
  nombre: string;
  visible: boolean;
  orden: number;
  subcategorias: Subcategoria[];
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  // ✅ Categorías iniciales (las que tienes ahora)
  private categoriasIniciales: CategoriaPrincipal[] = [
    {
      id: '1',
      nombre: 'Seguridad Industrial',
      visible: true,
      orden: 1,
      subcategorias: [
        { id: '1-1', nombre: 'Protección de pies', visible: true, orden: 1 },
        { id: '1-2', nombre: 'Protección de manos', visible: true, orden: 2 },
        { id: '1-3', nombre: 'Protección corporal', visible: true, orden: 3 },
        { id: '1-4', nombre: 'Protección anticaída', visible: true, orden: 4 },
        { id: '1-5', nombre: 'Protección auditiva', visible: true, orden: 5 },
        { id: '1-6', nombre: 'Protección respiratoria', visible: true, orden: 6 },
        { id: '1-7', nombre: 'Protección de cabeza, visual y facial', visible: true, orden: 7 },
        { id: '1-8', nombre: 'Ropa de trabajo', visible: true, orden: 8 },
        { id: '1-9', nombre: 'Bloqueo y etiquetado', visible: true, orden: 9 },
        { id: '1-10', nombre: 'Paños de seguridad industrial', visible: true, orden: 10 },
        { id: '1-11', nombre: 'Señalización', visible: true, orden: 11 },
        { id: '1-12', nombre: 'Emergencia y primeros auxilios', visible: true, orden: 12 },
        { id: '1-13', nombre: 'Protección solar', visible: true, orden: 13 }
      ]
    },
    {
      id: '2',
      nombre: 'Eléctricos e Instrumentación',
      visible: true,
      orden: 2,
      subcategorias: [
        { id: '2-1', nombre: 'Materiales eléctricos', visible: true, orden: 1 },
        { id: '2-2', nombre: 'Iluminación', visible: true, orden: 2 },
        { id: '2-3', nombre: 'Conductores', visible: true, orden: 3 },
        { id: '2-4', nombre: 'Cintas aislantes', visible: true, orden: 4 },
        { id: '2-5', nombre: 'Elementos de protección eléctrica', visible: true, orden: 5 },
        { id: '2-6', nombre: 'Amarracables', visible: true, orden: 6 }
      ]
    },
    {
      id: '3',
      nombre: 'Herramientas Industriales',
      visible: true,
      orden: 3,
      subcategorias: [
        { id: '3-1', nombre: 'Herramientas manuales', visible: true, orden: 1 },
        { id: '3-2', nombre: 'Herramientas eléctricas', visible: true, orden: 2 },
        { id: '3-3', nombre: 'Herramientas inalámbricas', visible: true, orden: 3 },
        { id: '3-4', nombre: 'Instrumentos de medición', visible: true, orden: 4 },
        { id: '3-5', nombre: 'Almacenamiento de herramientas', visible: true, orden: 5 },
        { id: '3-6', nombre: 'Herramientas neumáticas', visible: true, orden: 6 },
        { id: '3-7', nombre: 'Otras herramientas manuales y accesorios', visible: true, orden: 7 }
      ]
    },
    {
      id: '4',
      nombre: 'MRO & Misceláneos',
      visible: true,
      orden: 4,
      subcategorias: [
        { id: '4-1', nombre: 'Mantenimiento y limpieza', visible: true, orden: 1 },
        { id: '4-2', nombre: 'Ferretería industrial', visible: true, orden: 2 },
        { id: '4-3', nombre: 'Materiales de construcción', visible: true, orden: 3 },
        { id: '4-4', nombre: 'Abastecimiento integral', visible: true, orden: 4 },
        { id: '4-5', nombre: 'Equipamiento de campamentos', visible: true, orden: 5 }
      ]
    }
  ];

  private categoriasSubject = new BehaviorSubject<CategoriaPrincipal[]>(
    this.cargarDesdLocalStorage()
  );

  constructor() {
    // Guardar en localStorage cada vez que cambian las categorías
    this.categoriasSubject.subscribe(categorias => {
      localStorage.setItem('categorias_menu', JSON.stringify(categorias));
    });
  }

  // ✅ OBTENER TODAS LAS CATEGORÍAS
  obtenerCategorias(): Observable<CategoriaPrincipal[]> {
    return this.categoriasSubject.asObservable();
  }

  // ✅ OBTENER SOLO CATEGORÍAS VISIBLES (para el mega menú)
  obtenerCategoriasVisibles(): CategoriaPrincipal[] {
    return this.categoriasSubject.value
      .filter(cat => cat.visible)
      .map(cat => ({
        ...cat,
        subcategorias: cat.subcategorias.filter(sub => sub.visible)
      }))
      .sort((a, b) => a.orden - b.orden);
  }

  // ✅ AGREGAR CATEGORÍA PRINCIPAL
  agregarCategoria(nombre: string): void {
    const categorias = this.categoriasSubject.value;
    const nuevoId = (Math.max(...categorias.map(c => parseInt(c.id))) + 1).toString();
    
    const nuevaCategoria: CategoriaPrincipal = {
      id: nuevoId,
      nombre,
      visible: true,
      orden: categorias.length + 1,
      subcategorias: []
    };
    
    this.categoriasSubject.next([...categorias, nuevaCategoria]);
  }

  // ✅ EDITAR CATEGORÍA PRINCIPAL
  editarCategoria(id: string, nombre: string): void {
    const categorias = this.categoriasSubject.value.map(cat =>
      cat.id === id ? { ...cat, nombre } : cat
    );
    this.categoriasSubject.next(categorias);
  }

  // ✅ ELIMINAR CATEGORÍA PRINCIPAL
  eliminarCategoria(id: string): void {
    const categorias = this.categoriasSubject.value.filter(cat => cat.id !== id);
    this.categoriasSubject.next(categorias);
  }

  // ✅ OCULTAR/MOSTRAR CATEGORÍA
  toggleVisibilidadCategoria(id: string): void {
    const categorias = this.categoriasSubject.value.map(cat =>
      cat.id === id ? { ...cat, visible: !cat.visible } : cat
    );
    this.categoriasSubject.next(categorias);
  }

  // ✅ AGREGAR SUBCATEGORÍA
  agregarSubcategoria(categoriaId: string, nombre: string): void {
    const categorias = this.categoriasSubject.value.map(cat => {
      if (cat.id === categoriaId) {
        const nuevoId = `${categoriaId}-${cat.subcategorias.length + 1}`;
        const nuevaSubcategoria: Subcategoria = {
          id: nuevoId,
          nombre,
          visible: true,
          orden: cat.subcategorias.length + 1
        };
        return {
          ...cat,
          subcategorias: [...cat.subcategorias, nuevaSubcategoria]
        };
      }
      return cat;
    });
    this.categoriasSubject.next(categorias);
  }

  // ✅ EDITAR SUBCATEGORÍA
  editarSubcategoria(categoriaId: string, subcategoriaId: string, nombre: string): void {
    const categorias = this.categoriasSubject.value.map(cat => {
      if (cat.id === categoriaId) {
        return {
          ...cat,
          subcategorias: cat.subcategorias.map(sub =>
            sub.id === subcategoriaId ? { ...sub, nombre } : sub
          )
        };
      }
      return cat;
    });
    this.categoriasSubject.next(categorias);
  }

  // ✅ ELIMINAR SUBCATEGORÍA
  eliminarSubcategoria(categoriaId: string, subcategoriaId: string): void {
    const categorias = this.categoriasSubject.value.map(cat => {
      if (cat.id === categoriaId) {
        return {
          ...cat,
          subcategorias: cat.subcategorias.filter(sub => sub.id !== subcategoriaId)
        };
      }
      return cat;
    });
    this.categoriasSubject.next(categorias);
  }

  // ✅ OCULTAR/MOSTRAR SUBCATEGORÍA
  toggleVisibilidadSubcategoria(categoriaId: string, subcategoriaId: string): void {
    const categorias = this.categoriasSubject.value.map(cat => {
      if (cat.id === categoriaId) {
        return {
          ...cat,
          subcategorias: cat.subcategorias.map(sub =>
            sub.id === subcategoriaId ? { ...sub, visible: !sub.visible } : sub
          )
        };
      }
      return cat;
    });
    this.categoriasSubject.next(categorias);
  }

  // ✅ CARGAR DESDE LOCALSTORAGE
  private cargarDesdLocalStorage(): CategoriaPrincipal[] {
    const guardadas = localStorage.getItem('categorias_menu');
    if (guardadas) {
      return JSON.parse(guardadas);
    }
    return this.categoriasIniciales;
  }

  // ✅ RESTAURAR CATEGORÍAS INICIALES
  restaurarDefecto(): void {
    this.categoriasSubject.next(this.categoriasIniciales);
  }
}