package com.royemsac.ecommerce_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    
    private String token;
    private String tokenType = "Bearer";
    private Long userId;
    private String email;
    private String nombre;
    private String apellido;
    private String rol;
    private String mensaje;
    private Long expiresIn; // Tiempo de expiración en milisegundos
}