import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaService, CategoriaPrincipal, Subcategoria } from '../../services/categoria.service';

interface Confirmacion {
  titulo: string;
  mensaje: string;
  botonTexto: string;
  accion: () => void;
}

@Component({
  selector: 'app-admin-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-categorias.component.html',
  styleUrl: './admin-categorias.component.css'
})
export class AdminCategoriasComponent implements OnInit {
  categorias: CategoriaPrincipal[] = [];
  
  // Formularios
  mostrarFormCategoria = false;
  nuevaCategoriaNombre = '';
  subcategoriaFormCategoriaId: string | null = null;
  nuevaSubcategoriaNombre = '';
  
  // Edición
  categoriaEditando: CategoriaPrincipal | null = null;
  subcategoriaEditando: (Subcategoria & { categoriaId: string }) | null = null;
  
  // Confirmación
  confirmacion: Confirmacion | null = null;

  constructor(private categoriaService: CategoriaService) {}

  ngOnInit() {
    this.categoriaService.obtenerCategorias().subscribe(cats => {
      this.categorias = cats;
    });
  }

  // ===== CATEGORÍAS PRINCIPALES =====

  guardarCategoria() {
    if (this.nuevaCategoriaNombre.trim()) {
      this.categoriaService.agregarCategoria(this.nuevaCategoriaNombre.trim());
      this.cancelarFormCategoria();
    }
  }

  cancelarFormCategoria() {
    this.mostrarFormCategoria = false;
    this.nuevaCategoriaNombre = '';
  }

  editarCategoria(categoria: CategoriaPrincipal) {
    this.categoriaEditando = { ...categoria };
  }

  confirmarEdicionCategoria() {
    if (this.categoriaEditando && this.categoriaEditando.nombre.trim()) {
      this.categoriaService.editarCategoria(
        this.categoriaEditando.id,
        this.categoriaEditando.nombre.trim()
      );
      this.cancelarEdicionCategoria();
    }
  }

  cancelarEdicionCategoria() {
    this.categoriaEditando = null;
  }

  toggleCategoria(id: string) {
    this.categoriaService.toggleVisibilidadCategoria(id);
  }

  confirmarEliminarCategoria(categoria: CategoriaPrincipal) {
    this.confirmacion = {
      titulo: '¿Eliminar Categoría?',
      mensaje: `¿Estás seguro de eliminar "${categoria.nombre}" y todas sus ${categoria.subcategorias.length} subcategorías?`,
      botonTexto: 'Eliminar',
      accion: () => {
        this.categoriaService.eliminarCategoria(categoria.id);
        this.cancelarConfirmacion();
      }
    };
  }

  // ===== SUBCATEGORÍAS =====

  mostrarFormSubcategoria(categoriaId: string) {
    this.subcategoriaFormCategoriaId = categoriaId;
    this.nuevaSubcategoriaNombre = '';
  }

  guardarSubcategoria(categoriaId: string) {
    if (this.nuevaSubcategoriaNombre.trim()) {
      this.categoriaService.agregarSubcategoria(
        categoriaId,
        this.nuevaSubcategoriaNombre.trim()
      );
      this.cancelarFormSubcategoria();
    }
  }

  cancelarFormSubcategoria() {
    this.subcategoriaFormCategoriaId = null;
    this.nuevaSubcategoriaNombre = '';
  }

  editarSubcategoria(categoriaId: string, subcategoria: Subcategoria) {
    this.subcategoriaEditando = { ...subcategoria, categoriaId };
  }

  confirmarEdicionSubcategoria() {
    if (this.subcategoriaEditando && this.subcategoriaEditando.nombre.trim()) {
      this.categoriaService.editarSubcategoria(
        this.subcategoriaEditando.categoriaId,
        this.subcategoriaEditando.id,
        this.subcategoriaEditando.nombre.trim()
      );
      this.cancelarEdicionSubcategoria();
    }
  }

  cancelarEdicionSubcategoria() {
    this.subcategoriaEditando = null;
  }

  toggleSubcategoria(categoriaId: string, subcategoriaId: string) {
    this.categoriaService.toggleVisibilidadSubcategoria(categoriaId, subcategoriaId);
  }

  confirmarEliminarSubcategoria(categoriaId: string, subcategoria: Subcategoria) {
    this.confirmacion = {
      titulo: '¿Eliminar Subcategoría?',
      mensaje: `¿Estás seguro de eliminar "${subcategoria.nombre}"?`,
      botonTexto: 'Eliminar',
      accion: () => {
        this.categoriaService.eliminarSubcategoria(categoriaId, subcategoria.id);
        this.cancelarConfirmacion();
      }
    };
  }

  // ===== RESTAURAR =====

  confirmarRestaurar() {
    this.confirmacion = {
      titulo: '¿Restaurar Categorías Predeterminadas?',
      mensaje: 'Esto eliminará todas las categorías personalizadas y restaurará las categorías originales del sistema.',
      botonTexto: 'Restaurar',
      accion: () => {
        this.categoriaService.restaurarDefecto();
        this.cancelarConfirmacion();
      }
    };
  }

  // ===== CONFIRMACIÓN =====

  ejecutarConfirmacion() {
    if (this.confirmacion) {
      this.confirmacion.accion();
    }
  }

  cancelarConfirmacion() {
    this.confirmacion = null;
  }
}