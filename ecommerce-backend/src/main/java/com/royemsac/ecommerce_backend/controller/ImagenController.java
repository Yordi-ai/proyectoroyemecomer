package com.royemsac.ecommerce_backend.controller;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/imagenes")
@CrossOrigin(origins = "http://localhost:4200")
public class ImagenController {

    // ✅ Tu información de Supabase
    private static final String SUPABASE_URL = "https://ubwaoekciocabtxmmtzv.supabase.co";
    private static final String SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVid2FvZWtjaW9jYWJ0eG1tdHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4Njk0MjksImV4cCI6MjA4NDQ0NTQyOX0.LoDknkCl2O2_Hul7TGfD2Cdvy3l4drZKbJXwlEwv7nk";
    private static final String BUCKET_NAME = "productos-imagenes";

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @PostMapping("/upload")
    public ResponseEntity<?> subirImagen(@RequestParam("file") MultipartFile file) {
        try {
            System.out.println("📤 Subiendo imagen a Supabase Storage: " + file.getOriginalFilename());
            
            // Validar que sea una imagen
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El archivo debe ser una imagen");
                return ResponseEntity.badRequest().body(error);
            }

            // Generar nombre único
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            
            // URL de Supabase Storage
            String uploadUrl = SUPABASE_URL + "/storage/v1/object/" + BUCKET_NAME + "/" + fileName;
            
            // Crear request para Supabase
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(uploadUrl))
                    .header("Authorization", "Bearer " + SUPABASE_KEY)
                    .header("Content-Type", contentType)
                    .header("apikey", SUPABASE_KEY)
                    .POST(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                    .build();

            // Enviar a Supabase
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200 || response.statusCode() == 201) {
                // URL pública de la imagen
                String publicUrl = SUPABASE_URL + "/storage/v1/object/public/" + BUCKET_NAME + "/" + fileName;
                
                System.out.println("✅ Imagen subida a Supabase: " + publicUrl);
                
                Map<String, String> responseMap = new HashMap<>();
                responseMap.put("mensaje", "Imagen subida exitosamente");
                responseMap.put("url", publicUrl);
                responseMap.put("fileName", fileName);
                
                return ResponseEntity.ok(responseMap);
            } else {
                System.err.println("❌ Error de Supabase: " + response.statusCode() + " - " + response.body());
                
                Map<String, String> error = new HashMap<>();
                error.put("error", "Error al subir imagen a Supabase: " + response.body());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
            }

        } catch (IOException | InterruptedException e) {
            System.err.println("❌ ERROR al subir imagen: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al subir la imagen: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{fileName:.+}")
    public ResponseEntity<?> eliminarImagen(@PathVariable String fileName) {
        try {
            System.out.println("🗑️ Eliminando imagen de Supabase: " + fileName);
            
            String deleteUrl = SUPABASE_URL + "/storage/v1/object/" + BUCKET_NAME + "/" + fileName;
            
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(deleteUrl))
                    .header("Authorization", "Bearer " + SUPABASE_KEY)
                    .header("apikey", SUPABASE_KEY)
                    .DELETE()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                System.out.println("✅ Imagen eliminada de Supabase");
                
                Map<String, String> responseMap = new HashMap<>();
                responseMap.put("mensaje", "Imagen eliminada exitosamente");
                return ResponseEntity.ok(responseMap);
            } else {
                System.err.println("❌ Error al eliminar: " + response.statusCode());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }

        } catch (IOException | InterruptedException e) {
            System.err.println("❌ ERROR: " + e.getMessage());
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al eliminar imagen: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}