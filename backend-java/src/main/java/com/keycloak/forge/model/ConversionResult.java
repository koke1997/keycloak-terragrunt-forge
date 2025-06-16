package com.keycloak.forge.model;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class ConversionResult {
    
    private String conversionId;
    private boolean success;
    private String error;
    private List<TerraformFile> files;
    private RealmAnalysis analysis;
    private ConversionMetadata metadata;
    
    @Data
    @Builder
    public static class TerraformFile {
        private String filePath;
        private String content;
        private String type; // main, variables, outputs, etc.
        private long size;
    }
    
    @Data
    @Builder
    public static class ConversionMetadata {
        private long startTime;
        private long endTime;
        private long duration;
        private int filesGenerated;
        private Map<String, Object> statistics;
    }
}