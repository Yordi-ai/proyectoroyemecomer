package com.royemsac.ecommerce_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Obtener la ruta absoluta de la carpeta uploads
        Path uploadPath = Paths.get("uploads").toAbsolutePath().normalize();
        String uploadsLocation = "file:///" + uploadPath.toString().replace("\\", "/") + "/";
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadsLocation);
        
        System.out.println("📁 Sirviendo archivos desde: " + uploadsLocation);
    }
}
