package com.royemsac.ecommerce_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "productos")
public class Producto {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nombre;
    private String descripcion;
    private Double precio;
    private Integer stock;
    private String imagen;
    private String categoria;
    
    @Column(name = "destacado")
    private Boolean destacado = false;
    
    // ✅ NUEVOS CAMPOS PARA PRODUCTOS DINÁMICOS
    @Column(name = "cantidad_vendida")
    private Integer cantidadVendida = 0;
    
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
    
    @Column(name = "activo")
    private Boolean activo = true;
    
    // ✅ Auto-asignar fecha al crear
    @PrePersist
    protected void onCreate() {
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }
    }
}