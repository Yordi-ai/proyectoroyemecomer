package com.royemsac.ecommerce_backend.service;


import com.royemsac.ecommerce_backend.model.Orden;
import com.royemsac.ecommerce_backend.model.DetalleOrden;
import com.royemsac.ecommerce_backend.repository.OrdenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrdenService {
    
    @Autowired
    private OrdenRepository ordenRepository;
    
    public Orden crearOrden(Orden orden) {
        orden.setFecha(LocalDateTime.now());
        orden.setEstado("PENDIENTE");
        
        // Calcular subtotales
        if (orden.getDetalles() != null) {
            for (DetalleOrden detalle : orden.getDetalles()) {
                detalle.setSubtotal(detalle.getCantidad() * detalle.getPrecioUnitario());
                detalle.setOrden(orden);
            }
        }
        
        return ordenRepository.save(orden);
    }
    
    public List<Orden> obtenerOrdenesPorUsuario(Long usuarioId) {
        return ordenRepository.findByUsuarioIdOrderByFechaDesc(usuarioId);
    }
    
    public Optional<Orden> obtenerPorId(Long id) {
        return ordenRepository.findById(id);
    }
    
    public List<Orden> obtenerTodas() {
        return ordenRepository.findAll();
    }
    public Orden actualizarEstado(Orden orden) {
    return ordenRepository.save(orden);
}
}