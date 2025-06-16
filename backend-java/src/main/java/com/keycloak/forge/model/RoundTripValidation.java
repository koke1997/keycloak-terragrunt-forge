package com.keycloak.forge.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.util.Date;
import java.util.List;

/**
 * Model for round-trip validation results
 * 
 * Represents the complete validation of:
 * Original realm.json → Terragrunt → Deployed Keycloak → Exported realm.json
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoundTripValidation {
    
    /**
     * Name of the original realm
     */
    private String originalRealm;
    
    /**
     * Name of the deployed realm being validated
     */
    private String deployedRealm;
    
    /**
     * Overall validation success
     */
    private boolean success;
    
    /**
     * Detailed validation results
     */
    private ValidationResult validationResult;
    
    /**
     * Validation timestamp
     */
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private Date timestamp;
    
    /**
     * Error message if validation failed
     */
    private String error;
    
    /**
     * Validation execution time in milliseconds
     */
    private Long executionTimeMs;
    
    /**
     * List of validation steps performed
     */
    private List<ValidationStep> steps;
    
    /**
     * Additional metadata about the validation
     */
    private ValidationMetadata metadata;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ValidationStep {
        private String name;
        private boolean success;
        private String description;
        private Long durationMs;
        private String error;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ValidationMetadata {
        private String keycloakVersion;
        private String terraformProviderVersion;
        private String terragrutVersion;
        private int originalFileSize;
        private int exportedFileSize;
        private String environment;
    }
}