package com.keycloak.forge.controller;

import com.keycloak.forge.model.ConversionRequest;
import com.keycloak.forge.model.ConversionResult;
import com.keycloak.forge.model.RealmAnalysis;
import com.keycloak.forge.service.KeycloakService;
import com.keycloak.forge.service.TerraformGeneratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

/**
 * REST controller for Keycloak realm conversion operations
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Slf4j
@Validated
public class ConversionController {

    private final KeycloakService keycloakService;
    private final TerraformGeneratorService terraformGeneratorService;

    /**
     * Convert a Keycloak realm JSON to Terragrunt modules
     */
    @PostMapping("/convert")
    public ResponseEntity<ConversionResult> convertRealm(
            @Valid @RequestBody ConversionRequest request) {
        
        log.info("Starting realm conversion for realm: {}", request.getRealm().getRealm());
        
        try {
            // Analyze the realm first
            RealmAnalysis analysis = keycloakService.analyzeRealm(request.getRealm());
            log.info("Realm analysis completed. Complexity score: {}", analysis.getComplexity().getScore());
            
            // Generate Terragrunt modules
            ConversionResult result = terraformGeneratorService.generateTerragruntModules(
                request.getRealm(), 
                request.getOptions()
            );
            
            // Add analysis metadata
            result.setAnalysis(analysis);
            result.setConversionId(UUID.randomUUID().toString());
            
            log.info("Conversion completed successfully. Generated {} files", result.getFiles().size());
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Conversion failed for realm: {}", request.getRealm().getRealm(), e);
            return ResponseEntity.internalServerError()
                .body(ConversionResult.builder()
                    .success(false)
                    .error("Conversion failed: " + e.getMessage())
                    .build());
        }
    }

    /**
     * Upload and convert multiple realm files
     */
    @PostMapping("/convert/upload")
    public ResponseEntity<List<ConversionResult>> convertUploadedFiles(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "options", required = false) String optionsJson) {
        
        log.info("Starting batch conversion for {} files", files.size());
        
        try {
            List<ConversionResult> results = keycloakService.processBatchUpload(files, optionsJson);
            log.info("Batch conversion completed. {} results generated", results.size());
            return ResponseEntity.ok(results);
            
        } catch (IOException e) {
            log.error("Batch conversion failed", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Analyze a realm without conversion
     */
    @PostMapping("/analyze")
    public ResponseEntity<RealmAnalysis> analyzeRealm(
            @Valid @RequestBody org.keycloak.representations.idm.RealmRepresentation realm) {
        
        log.info("Starting realm analysis for: {}", realm.getRealm());
        
        try {
            RealmAnalysis analysis = keycloakService.analyzeRealm(realm);
            log.info("Analysis completed. Complexity: {}, Features: {}", 
                analysis.getComplexity().getScore(), 
                analysis.getFeatures().size());
            return ResponseEntity.ok(analysis);
            
        } catch (Exception e) {
            log.error("Analysis failed for realm: {}", realm.getRealm(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get conversion status (for async operations)
     */
    @GetMapping("/convert/{conversionId}/status")
    public ResponseEntity<ConversionResult> getConversionStatus(
            @PathVariable String conversionId) {
        
        ConversionResult result = keycloakService.getConversionStatus(conversionId);
        if (result == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(result);
    }
}