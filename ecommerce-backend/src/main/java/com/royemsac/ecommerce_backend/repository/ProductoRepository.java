package com.royemsac.ecommerce_backend.repository;

import com.royemsac.ecommerce_backend.model.Producto;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    
    List<Producto> findByNombreContainingIgnoreCase(String nombre);
    List<Producto> findByCategoria(String categoria);
    
    // ✅ Productos destacados (deprecado - ya no se usa)
    List<Producto> findByDestacadoTrue();
    
    @Query("SELECT DISTINCT p.categoria FROM Producto p")
    List<String> findDistinctCategorias();
    
    // ✅ NUEVOS MÉTODOS PARA PRODUCTOS DINÁMICOS
    
    // Los 4 productos más vendidos
    @Query("SELECT p FROM Producto p WHERE p.activo = true ORDER BY p.cantidadVendida DESC")
    List<Producto> findTopByVentas(Pageable pageable);
    
    // Los 4 productos más recientes
    @Query("SELECT p FROM Producto p WHERE p.activo = true ORDER BY p.fechaCreacion DESC")
    List<Producto> findTopByRecientes(Pageable pageable);
}