package com.royemsac.ecommerce_backend.service;

import com.royemsac.ecommerce_backend.model.Producto;
import com.royemsac.ecommerce_backend.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
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

    // ✅ MEJORADO: Obtener productos destacados DINÁMICOS Y VARIADOS
    // Devuelve 12 productos para tener 3 slides de 4 productos cada uno
    public List<Producto> obtenerDestacados() {
        List<Producto> destacados = new ArrayList<>();
        
        try {
            // 1. Obtener los 4 productos más vendidos
            List<Producto> masVendidos = productoRepository.findTopByVentas(PageRequest.of(0, 4));
            destacados.addAll(masVendidos);
            
            // 2. Obtener los 4 productos más recientes (que no estén ya en masVendidos)
            List<Producto> masRecientes = productoRepository.findTopByRecientes(PageRequest.of(0, 12));
            
            for (Producto reciente : masRecientes) {
                // Agregar solo si no está ya en la lista y no hemos llegado a 8
                if (!destacados.contains(reciente) && destacados.size() < 8) {
                    destacados.add(reciente);
                }
            }
            
            // 3. Si aún no tenemos 12 productos, agregar productos aleatorios
            if (destacados.size() < 12) {
                List<Producto> todosProductos = productoRepository.findAll();
                List<Producto> todosActivos = new ArrayList<>();
                
                // Filtrar productos activos que no estén ya en destacados
                for (Producto p : todosProductos) {
                    if (p.getActivo() != null && p.getActivo() && !destacados.contains(p)) {
                        todosActivos.add(p);
                    }
                }
                
                // Mezclar aleatoriamente para variedad
                Collections.shuffle(todosActivos);
                
                // Agregar hasta completar 12 productos
                for (Producto producto : todosActivos) {
                    if (destacados.size() >= 12) break;
                    destacados.add(producto);
                }
            }
            
            System.out.println("✅ Productos destacados cargados: " + destacados.size() + " productos");
            
        } catch (Exception e) {
            // Si falla (porque aún no tienes las columnas), usa el método antiguo
            System.out.println("⚠️ Usando método antiguo de destacados. Error: " + e.getMessage());
            System.out.println("⚠️ Ejecuta el SQL para actualizar la BD con las nuevas columnas.");
            return productoRepository.findByDestacadoTrue();
        }
        
        // Asegurar máximo 12 productos
        if (destacados.size() > 12) {
            destacados = destacados.subList(0, 12);
        }
        
        return destacados;
    }
}