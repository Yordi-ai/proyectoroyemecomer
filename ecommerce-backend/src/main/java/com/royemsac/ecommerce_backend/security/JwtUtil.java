package com.royemsac.ecommerce_backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    // Clave secreta para firmar los tokens (en producción usa variable de entorno)
    private final SecretKey SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    
    // Token válido por 24 horas
    private static final long JWT_TOKEN_VALIDITY = 24 * 60 * 60 * 1000;

    // ============== EXTRAER INFORMACIÓN DEL TOKEN ==============
    
    // Extraer el email del token
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Extraer la fecha de expiración
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Extraer cualquier claim del token
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Extraer todos los claims
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(SECRET_KEY)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // Extraer el rol del token
    public String extractRol(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("rol", String.class);
    }

    // Extraer el ID del usuario del token (nuevo)
    public Long extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        Object userId = claims.get("userId");
        if (userId instanceof Integer) {
            return ((Integer) userId).longValue();
        }
        return claims.get("userId", Long.class);
    }

    // ============== VERIFICACIÓN Y VALIDACIÓN ==============
    
    // Verificar si el token está expirado
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // Validar el token
    public Boolean validateToken(String token, String email) {
        final String tokenEmail = extractEmail(token);
        return (tokenEmail.equals(email) && !isTokenExpired(token));
    }

    // Verificar si el usuario es ADMIN (nuevo)
    public Boolean isAdmin(String token) {
        String rol = extractRol(token);
        return "ADMIN".equals(rol) || "ROLE_ADMIN".equals(rol);
    }

    // Verificar si el usuario es CLIENTE (nuevo)
    public Boolean isCliente(String token) {
        String rol = extractRol(token);
        return "CLIENTE".equals(rol) || "ROLE_CLIENTE".equals(rol);
    }

    // ============== GENERACIÓN DE TOKENS ==============
    
    // Generar token para un usuario (mejorado)
    public String generateToken(String email, String rol, Long userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("rol", rol);
        claims.put("userId", userId);
        claims.put("tokenType", "Bearer");
        return createToken(claims, email);
    }

    // Sobrecarga del método anterior para mantener compatibilidad
    public String generateToken(String email, String rol) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("rol", rol);
        claims.put("tokenType", "Bearer");
        return createToken(claims, email);
    }

    // Crear el token
    private String createToken(Map<String, Object> claims, String subject) {
        long currentTime = System.currentTimeMillis();
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(currentTime))
                .expiration(new Date(currentTime + JWT_TOKEN_VALIDITY))
                .signWith(SECRET_KEY)
                .compact();
    }

    // ============== MÉTODOS AUXILIARES ==============
    
    // Obtener tiempo restante del token en milisegundos (nuevo)
    public Long getTokenRemainingTime(String token) {
        Date expiration = extractExpiration(token);
        return expiration.getTime() - System.currentTimeMillis();
    }

    // Verificar si el token está por expirar (menos de 1 hora) (nuevo)
    public Boolean isTokenExpiringSoon(String token) {
        Long remainingTime = getTokenRemainingTime(token);
        return remainingTime < 60 * 60 * 1000; // 1 hora en milisegundos
    }
}