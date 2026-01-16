package com.royemsac.ecommerce_backend.repository;


import com.royemsac.ecommerce_backend.model.Producto;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByNombreContainingIgnoreCase(String nombre);
    List<Producto> findByCategoria(String categoria);
    
    @Query("SELECT DISTINCT p.categoria FROM Producto p")
    List<String> findDistinctCategorias();
}