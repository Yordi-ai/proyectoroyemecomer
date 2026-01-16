package com.royemsac.ecommerce_backend.model;


import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "ordenes")
public class Orden {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
    
    private LocalDateTime fecha;
    private Double total;
    private String estado; // PENDIENTE, CONFIRMADO, ENVIADO, ENTREGADO
    
    private String nombreCliente;
    private String emailCliente;
    private String telefonoCliente;
    private String direccionEnvio;
    
    @OneToMany(mappedBy = "orden", cascade = CascadeType.ALL)
    private List<DetalleOrden> detalles;
}