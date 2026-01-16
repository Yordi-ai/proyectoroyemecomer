package com.royemsac.ecommerce_backend.model;


import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "usuarios")
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    private String nombre;
    private String apellido;
    private String telefono;
    private String direccion;
    
    @Column(nullable = false)
    private String rol = "CLIENTE"; // CLIENTE o ADMIN
}