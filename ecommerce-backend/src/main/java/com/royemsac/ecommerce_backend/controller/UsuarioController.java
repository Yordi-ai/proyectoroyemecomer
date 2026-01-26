package com.royemsac.ecommerce_backend.controller;

import com.royemsac.ecommerce_backend.dto.*;
import com.royemsac.ecommerce_backend.model.Role;
import com.royemsac.ecommerce_backend.model.Usuario;
import com.royemsac.ecommerce_backend.security.JwtUtil;
import com.royemsac.ecommerce_backend.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:4200")
public class UsuarioController {
    
    @Autowired
    private UsuarioService usuarioService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    // ============== RUTAS PÚBLICAS ==============
    
   @PostMapping("/registro")
    public ResponseEntity<?> registrar(@Valid @RequestBody RegisterRequest request) {
     try {
        // Crear usuario desde el DTO
        Usuario usuario = new Usuario();
        usuario.setEmail(request.getEmail());
        usuario.setPassword(request.getPassword());
        usuario.setNombre(request.getNombre());
        usuario.setApellido(request.getApellido());
        usuario.setTelefono(request.getTelefono());
        usuario.setDireccion(request.getDireccion());
        
        // 🔑 DETERMINAR ROL SEGÚN CREDENCIAL
        // Si envía credencial de admin y es correcta, crear como ADMIN
        if (request.getCredencialAdmin() != null && 
            request.getCredencialAdmin().equals("ROYEM2024")) {
            usuario.setRol(Role.ADMIN);
        } else {
            usuario.setRol(Role.CLIENTE); // Por defecto CLIENTE
        }
        
        // Registrar usuario
        Usuario nuevoUsuario = usuarioService.registrar(usuario);
        
        // Generar token JWT
        String token = jwtUtil.generateToken(
            nuevoUsuario.getEmail(), 
            nuevoUsuario.getRol().name()
        );
        
        // Construir respuesta
        AuthResponse response = AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(nuevoUsuario.getId())
                .email(nuevoUsuario.getEmail())
                .nombre(nuevoUsuario.getNombre())
                .apellido(nuevoUsuario.getApellido())
                .rol(nuevoUsuario.getRol().name())
                .mensaje(nuevoUsuario.getRol() == Role.ADMIN 
                    ? "Administrador registrado exitosamente" 
                    : "Usuario registrado exitosamente")
                .expiresIn(24 * 60 * 60 * 1000L)
                .build();
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
        
    } catch (RuntimeException e) {
        ErrorResponse error = ErrorResponse.of(
            "REGISTRO_ERROR",
            e.getMessage(),
            HttpStatus.BAD_REQUEST.value()
        );
        return ResponseEntity.badRequest().body(error);
    }
}
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            Optional<Usuario> usuarioOpt = usuarioService.login(
                request.getEmail(), 
                request.getPassword()
            );
            
            if (usuarioOpt.isEmpty()) {
                ErrorResponse error = ErrorResponse.of(
                    "CREDENCIALES_INVALIDAS",
                    "Email o contraseña incorrectos",
                    HttpStatus.UNAUTHORIZED.value()
                );
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            Usuario usuario = usuarioOpt.get();
            
            // Verificar si el usuario está activo
            if (!usuario.getActivo()) {
                ErrorResponse error = ErrorResponse.of(
                    "USUARIO_INACTIVO",
                    "Tu cuenta ha sido desactivada. Contacta al administrador",
                    HttpStatus.FORBIDDEN.value()
                );
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            // Generar token JWT
            String token = jwtUtil.generateToken(
                usuario.getEmail(), 
                usuario.getRol().name()
            );
            
            // Construir respuesta
            AuthResponse response = AuthResponse.builder()
                    .token(token)
                    .tokenType("Bearer")
                    .userId(usuario.getId())
                    .email(usuario.getEmail())
                    .nombre(usuario.getNombre())
                    .apellido(usuario.getApellido())
                    .rol(usuario.getRol().name())
                    .mensaje("Login exitoso")
                    .expiresIn(24 * 60 * 60 * 1000L) // 24 horas
                    .build();
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            ErrorResponse error = ErrorResponse.of(
                "LOGIN_ERROR",
                "Error al iniciar sesión: " + e.getMessage(),
                HttpStatus.INTERNAL_SERVER_ERROR.value()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    // ============== RUTAS PROTEGIDAS - ADMIN ==============
    
    @PostMapping("/admin/crear")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> crearAdmin(@Valid @RequestBody RegisterRequest request) {
        try {
            // Crear usuario administrador
            Usuario usuario = new Usuario();
            usuario.setEmail(request.getEmail());
            usuario.setPassword(request.getPassword());
            usuario.setNombre(request.getNombre());
            usuario.setApellido(request.getApellido());
            usuario.setTelefono(request.getTelefono());
            usuario.setDireccion(request.getDireccion());
            usuario.setRol(Role.ADMIN); // ROL ADMIN
            
            Usuario nuevoAdmin = usuarioService.registrar(usuario);
            
            UsuarioResponse response = UsuarioResponse.fromUsuario(nuevoAdmin);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            ErrorResponse error = ErrorResponse.of(
                "CREAR_ADMIN_ERROR",
                e.getMessage(),
                HttpStatus.BAD_REQUEST.value()
            );
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UsuarioResponse>> listarTodos() {
        List<Usuario> usuarios = usuarioService.listarTodos();
        List<UsuarioResponse> response = usuarios.stream()
                .map(UsuarioResponse::fromUsuario)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            Optional<Usuario> usuarioOpt = usuarioService.obtenerPorId(id);
            
            if (usuarioOpt.isPresent()) {
                UsuarioResponse response = UsuarioResponse.fromUsuario(usuarioOpt.get());
                return ResponseEntity.ok(response);
            } else {
                ErrorResponse error = ErrorResponse.of(
                    "USUARIO_NO_ENCONTRADO",
                    "No se encontró el usuario con ID: " + id,
                    HttpStatus.NOT_FOUND.value()
                );
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (Exception e) {
            ErrorResponse error = ErrorResponse.of(
                "ERROR_INTERNO",
                "Error al obtener usuario: " + e.getMessage(),
                HttpStatus.INTERNAL_SERVER_ERROR.value()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PutMapping("/{id}/activar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> activarUsuario(@PathVariable Long id) {
        try {
            Usuario usuario = usuarioService.cambiarEstado(id, true);
            return ResponseEntity.ok(UsuarioResponse.fromUsuario(usuario));
        } catch (RuntimeException e) {
            ErrorResponse error = ErrorResponse.of(
                "ACTIVAR_ERROR",
                e.getMessage(),
                HttpStatus.BAD_REQUEST.value()
            );
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PutMapping("/{id}/desactivar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> desactivarUsuario(@PathVariable Long id) {
        try {
            Usuario usuario = usuarioService.cambiarEstado(id, false);
            return ResponseEntity.ok(UsuarioResponse.fromUsuario(usuario));
        } catch (RuntimeException e) {
            ErrorResponse error = ErrorResponse.of(
                "DESACTIVAR_ERROR",
                e.getMessage(),
                HttpStatus.BAD_REQUEST.value()
            );
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id) {
        try {
            usuarioService.eliminar(id);
            return ResponseEntity.ok().body(
                ErrorResponse.of(
                    "USUARIO_ELIMINADO",
                    "Usuario eliminado exitosamente",
                    HttpStatus.OK.value()
                )
            );
        } catch (RuntimeException e) {
            ErrorResponse error = ErrorResponse.of(
                "ELIMINAR_ERROR",
                e.getMessage(),
                HttpStatus.BAD_REQUEST.value()
            );
            return ResponseEntity.badRequest().body(error);
        }
    }
}