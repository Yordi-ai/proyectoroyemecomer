package com.royemsac.ecommerce_backend.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    
    private String error;
    private String mensaje;
    private Integer status;
    private LocalDateTime timestamp;
    
    public static ErrorResponse of(String error, String mensaje, Integer status) {
        return ErrorResponse.builder()
                .error(error)
                .mensaje(mensaje)
                .status(status)
                .timestamp(LocalDateTime.now())
                .build();
    }
}