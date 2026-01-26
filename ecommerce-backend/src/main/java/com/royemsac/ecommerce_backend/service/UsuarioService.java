package com.royemsac.ecommerce_backend.service;

import com.royemsac.ecommerce_backend.model.Role;
import com.royemsac.ecommerce_backend.model.Usuario;
import com.royemsac.ecommerce_backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UsuarioService {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    // ============== REGISTRO Y AUTENTICACIÓN ==============
    
    public Usuario registrar(Usuario usuario) {
        // Validar email único
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }
        
        // Validar campos obligatorios
        if (usuario.getEmail() == null || usuario.getEmail().trim().isEmpty()) {
            throw new RuntimeException("El email es obligatorio");
        }
        
        if (usuario.getPassword() == null || usuario.getPassword().length() < 6) {
            throw new RuntimeException("La contraseña debe tener al menos 6 caracteres");
        }
        
        if (usuario.getNombre() == null || usuario.getNombre().trim().isEmpty()) {
            throw new RuntimeException("El nombre es obligatorio");
        }
        
        if (usuario.getApellido() == null || usuario.getApellido().trim().isEmpty()) {
            throw new RuntimeException("El apellido es obligatorio");
        }
        
        // Asegurar que tenga un rol
        if (usuario.getRol() == null) {
            usuario.setRol(Role.CLIENTE);
        }
        
        // Asegurar que esté activo por defecto
        if (usuario.getActivo() == null) {
            usuario.setActivo(true);
        }
        
        // Encriptar la contraseña con BCrypt
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        
        return usuarioRepository.save(usuario);
    }
    
    public Optional<Usuario> login(String email, String password) {
        // Validar parámetros
        if (email == null || email.trim().isEmpty()) {
            return Optional.empty();
        }
        
        if (password == null || password.trim().isEmpty()) {
            return Optional.empty();
        }
        
        Optional<Usuario> usuario = usuarioRepository.findByEmail(email);
        
        if (usuario.isPresent() && passwordEncoder.matches(password, usuario.get().getPassword())) {
            return usuario;
        }
        
        return Optional.empty();
    }
    
    // ============== CONSULTAS ==============
    
    public Optional<Usuario> obtenerPorId(Long id) {
        if (id == null || id <= 0) {
            throw new RuntimeException("ID inválido");
        }
        return usuarioRepository.findById(id);
    }
    
    public Optional<Usuario> obtenerPorEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email inválido");
        }
        return usuarioRepository.findByEmail(email);
    }
    
    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }
    
    public List<Usuario> listarPorRol(Role rol) {
        return usuarioRepository.findByRol(rol);
    }
    
    public List<Usuario> listarActivos() {
        return usuarioRepository.findByActivo(true);
    }
    
    public long contarUsuarios() {
        return usuarioRepository.count();
    }
    
    public long contarPorRol(Role rol) {
        return usuarioRepository.countByRol(rol);
    }
    
    // ============== ACTUALIZACIÓN ==============
    
    public Usuario actualizar(Long id, Usuario usuarioActualizado) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Actualizar solo los campos permitidos
        if (usuarioActualizado.getNombre() != null) {
            usuario.setNombre(usuarioActualizado.getNombre());
        }
        
        if (usuarioActualizado.getApellido() != null) {
            usuario.setApellido(usuarioActualizado.getApellido());
        }
        
        if (usuarioActualizado.getTelefono() != null) {
            usuario.setTelefono(usuarioActualizado.getTelefono());
        }
        
        if (usuarioActualizado.getDireccion() != null) {
            usuario.setDireccion(usuarioActualizado.getDireccion());
        }
        
        return usuarioRepository.save(usuario);
    }
    
    public Usuario cambiarPassword(Long id, String passwordActual, String passwordNuevo) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Verificar password actual
        if (!passwordEncoder.matches(passwordActual, usuario.getPassword())) {
            throw new RuntimeException("La contraseña actual es incorrecta");
        }
        
        // Validar nueva contraseña
        if (passwordNuevo == null || passwordNuevo.length() < 6) {
            throw new RuntimeException("La nueva contraseña debe tener al menos 6 caracteres");
        }
        
        // Actualizar password
        usuario.setPassword(passwordEncoder.encode(passwordNuevo));
        
        return usuarioRepository.save(usuario);
    }
    
    public Usuario cambiarRol(Long id, Role nuevoRol) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        usuario.setRol(nuevoRol);
        
        return usuarioRepository.save(usuario);
    }
    
    public Usuario cambiarEstado(Long id, Boolean activo) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
        
        usuario.setActivo(activo);
        
        return usuarioRepository.save(usuario);
    }
    
    // ============== ELIMINACIÓN ==============
    
    public void eliminar(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RuntimeException("Usuario no encontrado con ID: " + id);
        }
        
        // Verificar que no sea el único admin
        Usuario usuario = usuarioRepository.findById(id).get();
        if (usuario.getRol() == Role.ADMIN) {
            long cantidadAdmins = usuarioRepository.countByRol(Role.ADMIN);
            if (cantidadAdmins <= 1) {
                throw new RuntimeException("No se puede eliminar el único administrador del sistema");
            }
        }
        
        usuarioRepository.deleteById(id);
    }
    
    // ============== VERIFICACIONES ==============
    
    public boolean existeEmail(String email) {
        return usuarioRepository.existsByEmail(email);
    }
    
    public boolean esAdmin(Long id) {
        return usuarioRepository.findById(id)
                .map(u -> u.getRol() == Role.ADMIN)
                .orElse(false);
    }
    
    public boolean estaActivo(Long id) {
        return usuarioRepository.findById(id)
                .map(Usuario::getActivo)
                .orElse(false);
    }
}