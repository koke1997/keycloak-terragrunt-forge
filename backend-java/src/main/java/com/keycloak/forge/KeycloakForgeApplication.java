package com.keycloak.forge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Main application class for Keycloak Terragrunt Forge
 * 
 * This Spring Boot application provides REST APIs for converting Keycloak realm 
 * configurations to Terragrunt/Terraform modules using native Keycloak libraries
 * for maximum compatibility and performance.
 */
@SpringBootApplication
@EnableCaching
@EnableAsync
public class KeycloakForgeApplication {

    public static void main(String[] args) {
        SpringApplication.run(KeycloakForgeApplication.class, args);
    }
}