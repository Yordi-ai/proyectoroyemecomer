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
    
    public Producto guardar(Producto producto) {
    if (producto.getId() != null && producto.getId() > 0) {
        // Actualizar producto existente
        Optional<Producto> existente = productoRepository.findById(producto.getId());
        if (existente.isPresent()) {
            return productoRepository.save(producto);
                }
            }
            // Crear nuevo producto
            return productoRepository.save(producto);
        }
    
    public void eliminar(Long id) {
        productoRepository.deleteById(id);
    }

    public List<Producto> buscarPorNombre(String nombre) {
    return productoRepository.findByNombreContainingIgnoreCase(nombre);
    }

    public List<Producto> obtenerPorCategoria(String categoria) {
        return productoRepository.findByCategoria(categoria);
    }

    public List<String> obtenerCategorias() {
        return productoRepository.findDistinctCategorias();
    }

    
}