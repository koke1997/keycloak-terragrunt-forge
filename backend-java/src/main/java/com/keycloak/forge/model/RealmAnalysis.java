package com.keycloak.forge.model;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class RealmAnalysis {
    
    private String realmName;
    private ComplexityScore complexity;
    private List<String> features;
    private Map<String, Integer> resourceCounts;
    private List<String> warnings;
    private List<String> recommendations;
    
    @Data
    @Builder
    public static class ComplexityScore {
        private int score; // 1-100
        private String level; // LOW, MEDIUM, HIGH, VERY_HIGH
        private String description;
        private Map<String, Integer> factors;
    }
}