package com.royemsac.ecommerce_backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");
        final String requestURI = request.getRequestURI();

        String email = null;
        String jwt = null;
        String rol = null;

        // ============== EXTRACCIÓN DEL TOKEN ==============
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            
            try {
                email = jwtUtil.extractEmail(jwt);
                rol = jwtUtil.extractRol(jwt);
                
                logger.debug("Token extraído correctamente para: " + email + " con rol: " + rol);
                
            } catch (io.jsonwebtoken.ExpiredJwtException e) {
                logger.warn("Token expirado para la petición: " + requestURI);
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\": \"Token expirado\", \"message\": \"Por favor inicie sesión nuevamente\"}");
                response.setContentType("application/json");
                return;
                
            } catch (io.jsonwebtoken.MalformedJwtException e) {
                logger.error("Token malformado: " + e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\": \"Token inválido\", \"message\": \"El token proporcionado no es válido\"}");
                response.setContentType("application/json");
                return;
                
            } catch (Exception e) {
                logger.error("Error al procesar el token: " + e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\": \"Error de autenticación\", \"message\": \"No se pudo procesar el token\"}");
                response.setContentType("application/json");
                return;
            }
        }

        // ============== VALIDACIÓN Y AUTENTICACIÓN ==============
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            if (jwtUtil.validateToken(jwt, email)) {
                
                // Asegurar que el rol tenga el prefijo ROLE_
                String authority = rol.startsWith("ROLE_") ? rol : "ROLE_" + rol;
                
                // Crear autenticación con el rol
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(
                        email, 
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority(authority))
                    );
                
                // Agregar detalles adicionales de la petición
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // Establecer la autenticación en el contexto de seguridad
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
                logger.debug("Usuario autenticado: " + email + " con autoridad: " + authority);
                
            } else {
                logger.warn("Token no válido para el usuario: " + email);
            }
        }
        
        // Continuar con la cadena de filtros
        chain.doFilter(request, response);
    }

    // ============== MÉTODOS AUXILIARES ==============
    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        
        // No filtrar rutas públicas para mejor rendimiento
        return path.startsWith("/api/usuarios/registro") || 
               path.startsWith("/api/usuarios/login") ||
               path.startsWith("/uploads/") ||
               (path.startsWith("/api/productos") && "GET".equals(request.getMethod()));
    }
}