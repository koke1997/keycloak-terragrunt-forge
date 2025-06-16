package com.keycloak.forge.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Model for detailed validation results
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationResult {
    
    /**
     * Whether the validation passed (100% match)
     */
    private boolean valid;
    
    /**
     * Overall accuracy percentage (0-100)
     */
    private double accuracyPercentage;
    
    /**
     * List of differences found between original and exported
     */
    private List<String> differences;
    
    /**
     * List of warnings (non-critical differences)
     */
    private List<String> warnings;
    
    /**
     * Accuracy breakdown by component
     */
    private Map<String, Double> componentAccuracy;
    
    /**
     * Total number of elements compared
     */
    private int totalElements;
    
    /**
     * Number of elements that matched
     */
    private int matchedElements;
    
    /**
     * Detailed comparison results by category
     */
    private Map<String, ComponentComparison> detailedComparison;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComponentComparison {
        private String componentType;
        private int originalCount;
        private int exportedCount;
        private double accuracy;
        private List<String> missingElements;
        private List<String> extraElements;
        private List<String> modifiedElements;
    }
}