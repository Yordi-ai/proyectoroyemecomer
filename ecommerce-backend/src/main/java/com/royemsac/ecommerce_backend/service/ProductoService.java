package com.royemsac.ecommerce_backend.service;


import com.royemsac.ecommerce_backend.model.Producto;
import com.royemsac.ecommerce_backend.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    public List<Producto> obtenerTodos() {
        return productoRepository.findAll();
    }

    public Optional<Producto> obtenerPorId(Long id) {
        return productoRepository.findById(id);
    }

    // ✅ CORREGIDO: Manejo correcto de nuevo producto
    public Producto guardar(Producto producto) {
        if (producto.getId() == null || producto.getId() == 0) {
            producto.setId(null); // Forzar a null para que JPA lo trate como nuevo
        }
        return productoRepository.save(producto);
    }

    public void eliminar(Long id) {
        productoRepository.deleteById(id);
    }

    // ✅ CORREGIDO: usa el método que existe en el repository
    public List<Producto> buscar(String query) {
        return productoRepository.findByNombreContainingIgnoreCase(query);
    }

    public List<Producto> obtenerPorCategoria(String categoria) {
        return productoRepository.findByCategoria(categoria);
    }

    public List<String> obtenerCategorias() {
        return productoRepository.findDistinctCategorias();
    }
}