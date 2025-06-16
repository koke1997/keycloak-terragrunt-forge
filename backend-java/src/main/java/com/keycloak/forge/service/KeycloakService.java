package com.keycloak.forge.service;

import com.keycloak.forge.model.ConversionResult;
import com.keycloak.forge.model.RealmAnalysis;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.representations.idm.RealmRepresentation;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class KeycloakService {
    
    private final Map<String, ConversionResult> conversionCache = new ConcurrentHashMap<>();
    
    public RealmAnalysis analyzeRealm(RealmRepresentation realm) {
        log.info("Analyzing realm: {}", realm.getRealm());
        
        int complexityScore = calculateComplexityScore(realm);
        String level = getComplexityLevel(complexityScore);
        
        return RealmAnalysis.builder()
            .realmName(realm.getRealm())
            .complexity(RealmAnalysis.ComplexityScore.builder()
                .score(complexityScore)
                .level(level)
                .description("Realm complexity based on resource count and configuration")
                .build())
            .build();
    }
    
    public List<ConversionResult> processBatchUpload(List<MultipartFile> files, String optionsJson) throws IOException {
        throw new UnsupportedOperationException("Batch upload not implemented yet");
    }
    
    public ConversionResult getConversionStatus(String conversionId) {
        return conversionCache.get(conversionId);
    }
    
    private int calculateComplexityScore(RealmRepresentation realm) {
        int score = 10; // Base score
        
        if (realm.getUsers() != null) {
            score += Math.min(realm.getUsers().size() * 2, 20);
        }
        if (realm.getGroups() != null) {
            score += Math.min(realm.getGroups().size() * 3, 15);
        }
        if (realm.getClients() != null) {
            score += Math.min(realm.getClients().size() * 5, 25);
        }
        if (realm.getRoles() != null && realm.getRoles().getRealm() != null) {
            score += Math.min(realm.getRoles().getRealm().size() * 2, 15);
        }
        
        return Math.min(score, 100);
    }
    
    private String getComplexityLevel(int score) {
        if (score <= 25) return "LOW";
        if (score <= 50) return "MEDIUM";
        if (score <= 75) return "HIGH";
        return "VERY_HIGH";
    }
}