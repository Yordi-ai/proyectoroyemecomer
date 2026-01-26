package com.royemsac.ecommerce_backend.repository;

import com.royemsac.ecommerce_backend.model.Role;
import com.royemsac.ecommerce_backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    // ============== BÚSQUEDAS BÁSICAS ==============
    
    Optional<Usuario> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    // ============== BÚSQUEDAS POR ROL ==============
    
    List<Usuario> findByRol(Role rol);
    
    long countByRol(Role rol);
    
    // ============== BÚSQUEDAS POR ESTADO ==============
    
    List<Usuario> findByActivo(Boolean activo);
    
    long countByActivo(Boolean activo);
    
    // ============== BÚSQUEDAS COMBINADAS ==============
    
    List<Usuario> findByRolAndActivo(Role rol, Boolean activo);
    
    // ============== CONSULTAS PERSONALIZADAS ==============
    
    @Query("SELECT u FROM Usuario u WHERE u.rol = :rol AND u.activo = true")
    List<Usuario> findAdminsActivos(Role rol);
    
    @Query("SELECT COUNT(u) FROM Usuario u WHERE u.activo = true")
    long countUsuariosActivos();
}