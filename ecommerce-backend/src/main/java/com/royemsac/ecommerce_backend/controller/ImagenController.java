package com.royemsac.ecommerce_backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/imagenes")
@CrossOrigin(origins = "http://localhost:4200")
public class ImagenController {

    @Value("${upload.path}")
    private String uploadPath;

    @PostMapping("/upload")
    public ResponseEntity<?> subirImagen(@RequestParam("file") MultipartFile file) {
        try {
            System.out.println("📤 Subiendo archivo: " + file.getOriginalFilename());
            
            // Validar que sea una imagen
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El archivo debe ser una imagen");
                System.err.println("❌ Archivo rechazado: no es una imagen");
                return ResponseEntity.badRequest().body(error);
            }

            // Generar nombre único para el archivo
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();

            // Crear directorio si no existe
            Path uploadDir = Paths.get(uploadPath).toAbsolutePath().normalize();
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
                System.out.println("📁 Directorio creado: " + uploadDir.toString());
            }

            // Guardar archivo
            Path filePath = uploadDir.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            System.out.println("✅ Archivo guardado en: " + filePath.toString());

            // ✅ IMPORTANTE: Retornar la URL correcta
            String imageUrl = "/api/imagenes/" + fileName;
            
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Imagen subida exitosamente");
            response.put("url", imageUrl);
            response.put("fileName", fileName);
            
            System.out.println("✅ URL generada: " + imageUrl);
            
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            System.err.println("❌ ERROR al subir imagen: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al subir la imagen: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> obtenerImagen(@PathVariable String filename) {
        try {
            System.out.println("🔍 Buscando imagen: " + filename);
            
            Path uploadDir = Paths.get(uploadPath).toAbsolutePath().normalize();
            Path filePath = uploadDir.resolve(filename).normalize();
            
            System.out.println("   Ruta completa: " + filePath.toString());
            
            // ✅ Verificar que el archivo no intente salir del directorio de uploads (seguridad)
            if (!filePath.startsWith(uploadDir)) {
                System.err.println("❌ Intento de acceso fuera del directorio de uploads");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                System.out.println("✅ Imagen encontrada y legible");
                
                // Detectar el tipo de contenido
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .header(HttpHeaders.CACHE_CONTROL, "max-age=3600") // Cache por 1 hora
                        .body(resource);
            } else {
                System.err.println("❌ Imagen no encontrada o no legible");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("❌ ERROR al obtener imagen: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{filename:.+}")
    public ResponseEntity<?> eliminarImagen(@PathVariable String filename) {
        try {
            System.out.println("🗑️ Eliminando imagen: " + filename);
            
            Path uploadDir = Paths.get(uploadPath).toAbsolutePath().normalize();
            Path filePath = uploadDir.resolve(filename).normalize();
            
            // Verificar seguridad
            if (!filePath.startsWith(uploadDir)) {
                System.err.println("❌ Intento de eliminación fuera del directorio de uploads");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            boolean deleted = Files.deleteIfExists(filePath);
            
            if (deleted) {
                System.out.println("✅ Imagen eliminada exitosamente");
                Map<String, String> response = new HashMap<>();
                response.put("mensaje", "Imagen eliminada exitosamente");
                return ResponseEntity.ok(response);
            } else {
                System.err.println("⚠️ Imagen no encontrada para eliminar");
                return ResponseEntity.notFound().build();
            }

        } catch (IOException e) {
            System.err.println("❌ ERROR al eliminar imagen: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al eliminar la imagen: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ✅ NUEVO: Endpoint para verificar configuración
    @GetMapping("/config")
    public ResponseEntity<?> obtenerConfig() {
        try {
            Path uploadDir = Paths.get(uploadPath).toAbsolutePath().normalize();
            
            Map<String, Object> config = new HashMap<>();
            config.put("uploadPath", uploadPath);
            config.put("absolutePath", uploadDir.toString());
            config.put("exists", Files.exists(uploadDir));
            config.put("isDirectory", Files.isDirectory(uploadDir));
            config.put("isWritable", Files.isWritable(uploadDir));
            
            return ResponseEntity.ok(config);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}