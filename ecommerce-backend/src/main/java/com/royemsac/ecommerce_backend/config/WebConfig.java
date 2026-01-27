package com.royemsac.ecommerce_backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${upload.path}")
    private String uploadPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Convertir ruta relativa a absoluta
        Path uploadDir = Paths.get(uploadPath).toAbsolutePath().normalize();
        String uploadDirPath = uploadDir.toUri().toString();

        System.out.println("=================================================");
        System.out.println("📁 Configurando recursos estáticos:");
        System.out.println("   Ruta absoluta: " + uploadDir.toString());
        System.out.println("   URI: " + uploadDirPath);
        System.out.println("=================================================");

        // Servir archivos estáticos desde /uploads/**
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadDirPath);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:4200")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}