package com.keycloak.forge.controller;

import com.keycloak.forge.model.RoundTripValidation;
import com.keycloak.forge.model.ValidationResult;
import com.keycloak.forge.service.ValidationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.representations.idm.RealmRepresentation;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * REST controller for validation operations
 * 
 * Provides endpoints for:
 * - Round-trip validation (realm.json → Terragrunt → Keycloak → export → compare)
 * - Export validation (export deployed realm and compare)
 * - Compliance checking (ensure deployed matches original)
 */
@RestController
@RequestMapping("/api/v1/validate")
@RequiredArgsConstructor
@Slf4j
@Validated
public class ValidationController {

    private final ValidationService validationService;

    /**
     * Perform complete round-trip validation
     * 
     * Tests the entire pipeline:
     * 1. Original realm.json
     * 2. Generate Terragrunt modules
     * 3. Deploy to Keycloak
     * 4. Export from deployed Keycloak
     * 5. Compare original vs exported
     */
    @PostMapping("/round-trip")
    public ResponseEntity<RoundTripValidation> performRoundTripValidation(
            @Valid @RequestBody RealmRepresentation originalRealm,
            @RequestParam String deployedRealmName) {
        
        log.info("Starting round-trip validation for realm: {} -> {}", 
            originalRealm.getRealm(), deployedRealmName);
        
        try {
            RoundTripValidation validation = validationService.performRoundTripValidation(
                originalRealm, deployedRealmName);
            
            log.info("Round-trip validation completed. Success: {}, Accuracy: {}%", 
                validation.isSuccess(), 
                validation.getValidationResult() != null ? 
                    validation.getValidationResult().getAccuracyPercentage() : "N/A");
            
            return ResponseEntity.ok(validation);
            
        } catch (Exception e) {
            log.error("Round-trip validation failed", e);
            return ResponseEntity.internalServerError()
                .body(RoundTripValidation.builder()
                    .originalRealm(originalRealm.getRealm())
                    .deployedRealm(deployedRealmName)
                    .success(false)
                    .error("Validation failed: " + e.getMessage())
                    .build());
        }
    }

    /**
     * Export a deployed realm configuration
     */
    @GetMapping("/export/{realmName}")
    public ResponseEntity<RealmRepresentation> exportRealm(
            @PathVariable String realmName) {
        
        log.info("Exporting realm configuration for: {}", realmName);
        
        try {
            RealmRepresentation exported = validationService.exportDeployedRealm(realmName);
            log.info("Successfully exported realm: {}", realmName);
            return ResponseEntity.ok(exported);
            
        } catch (Exception e) {
            log.error("Failed to export realm: {}", realmName, e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Compare two realm representations
     */
    @PostMapping("/compare")
    public ResponseEntity<ValidationResult> compareRealms(
            @RequestBody ComparisonRequest request) {
        
        log.info("Comparing realms: {} vs {}", 
            request.getOriginal().getRealm(), 
            request.getExported().getRealm());
        
        try {
            ValidationResult result = validationService.compareRealms(
                request.getOriginal(), request.getExported());
            
            log.info("Realm comparison completed. Accuracy: {}%, Valid: {}", 
                result.getAccuracyPercentage(), result.isValid());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Realm comparison failed", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Validate Terraform/Terragrunt files syntax
     */
    @PostMapping("/terraform")
    public ResponseEntity<ValidationResult> validateTerraformFiles(
            @RequestBody TerraformValidationRequest request) {
        
        log.info("Validating Terraform files for realm: {}", request.getRealmName());
        
        // This would integrate with Go backend for Terraform validation
        // For now, return a placeholder response
        ValidationResult result = ValidationResult.builder()
            .valid(true)
            .accuracyPercentage(100.0)
            .totalElements(request.getFiles().size())
            .matchedElements(request.getFiles().size())
            .build();
        
        return ResponseEntity.ok(result);
    }

    // Request DTOs
    public static class ComparisonRequest {
        private RealmRepresentation original;
        private RealmRepresentation exported;
        
        // Getters and setters
        public RealmRepresentation getOriginal() { return original; }
        public void setOriginal(RealmRepresentation original) { this.original = original; }
        public RealmRepresentation getExported() { return exported; }
        public void setExported(RealmRepresentation exported) { this.exported = exported; }
    }

    public static class TerraformValidationRequest {
        private String realmName;
        private java.util.Map<String, String> files;
        
        // Getters and setters
        public String getRealmName() { return realmName; }
        public void setRealmName(String realmName) { this.realmName = realmName; }
        public java.util.Map<String, String> getFiles() { return files; }
        public void setFiles(java.util.Map<String, String> files) { this.files = files; }
    }
}