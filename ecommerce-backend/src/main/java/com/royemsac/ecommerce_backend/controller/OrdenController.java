package com.royemsac.ecommerce_backend.controller;

import com.royemsac.ecommerce_backend.model.Orden;
import com.royemsac.ecommerce_backend.service.OrdenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ordenes")
@CrossOrigin(origins = "http://localhost:4200")
public class OrdenController {
    
    @Autowired
    private OrdenService ordenService;
    
    @PostMapping
    public ResponseEntity<Orden> crearOrden(@RequestBody Orden orden) {
        try {
            Orden nuevaOrden = ordenService.crearOrden(orden);
            return ResponseEntity.ok(nuevaOrden);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/usuario/{usuarioId}")
    public List<Orden> obtenerOrdenesPorUsuario(@PathVariable Long usuarioId) {
        return ordenService.obtenerOrdenesPorUsuario(usuarioId);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Orden> obtenerPorId(@PathVariable Long id) {
        return ordenService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping
    public List<Orden> obtenerTodas() {
        return ordenService.obtenerTodas();
    }
    
    @PutMapping("/{id}/estado")
    public ResponseEntity<Orden> actualizarEstado(
        @PathVariable Long id,
        @RequestBody Map<String, String> body) {
        String nuevoEstado = body.get("estado");
    
        Optional<Orden> ordenOpt = ordenService.obtenerPorId(id);
        if (ordenOpt.isPresent()) {
            Orden orden = ordenOpt.get();
            orden.setEstado(nuevoEstado);
            Orden ordenActualizada = ordenService.actualizarEstado(orden);
            return ResponseEntity.ok(ordenActualizada);
    }
    
    return ResponseEntity.notFound().build();
}
}