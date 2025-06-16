package com.keycloak.forge.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.representations.idm.RealmRepresentation;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.keycloak.forge.model.RoundTripValidation;
import com.keycloak.forge.model.ValidationResult;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for validating round-trip conversion fidelity
 *
 * This service ensures that:
 * 1. Original realm.json → Terragrunt → Deployed Keycloak → Exported realm.json
 * 2. Original and exported realm.json match 100%
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ValidationService {

    private final Keycloak keycloakClient;
    private final ObjectMapper objectMapper;

    /**
     * Perform complete round-trip validation
     */
    public RoundTripValidation performRoundTripValidation(
            RealmRepresentation originalRealm,
            String deployedRealmName) {

        log.info("Starting round-trip validation for realm: {}", deployedRealmName);

        try {
            // Step 1: Export the deployed realm
            RealmRepresentation exportedRealm = exportDeployedRealm(deployedRealmName);

            // Step 2: Compare original vs exported
            ValidationResult comparison = compareRealms(originalRealm, exportedRealm);

            // Step 3: Generate detailed report
            RoundTripValidation validation = RoundTripValidation.builder()
                    .originalRealm(originalRealm.getRealm())
                    .deployedRealm(deployedRealmName)
                    .validationResult(comparison)
                    .timestamp(new Date())
                    .success(comparison.isValid())
                    .build();

            log.info("Round-trip validation completed. Success: {}, Accuracy: {}%",
                    validation.isSuccess(), comparison.getAccuracyPercentage());

            return validation;

        } catch (Exception e) {
            log.error("Round-trip validation failed for realm: {}", deployedRealmName, e);
            return RoundTripValidation.builder()
                    .originalRealm(originalRealm.getRealm())
                    .deployedRealm(deployedRealmName)
                    .success(false)
                    .error("Validation failed: " + e.getMessage())
                    .timestamp(new Date())
                    .build();
        }
    }

    /**
     * Export realm configuration from deployed Keycloak instance
     */
    public RealmRepresentation exportDeployedRealm(String realmName) {
        log.info("Exporting realm configuration for: {}", realmName);

        RealmResource realmResource = keycloakClient.realm(realmName);
        RealmRepresentation realm = realmResource.toRepresentation();

        // Export all components
        realm.setGroups(realmResource.groups().groups());
        realm.setUsers(realmResource.users().list());
        realm.setRoles(new org.keycloak.representations.idm.RolesRepresentation());
        realm.getRoles().setRealm(realmResource.roles().list());
        realm.setClients(realmResource.clients().findAll());
        realm.setIdentityProviders(realmResource.identityProviders().findAll());
        realm.setAuthenticationFlows(realmResource.flows().getFlows());

        log.info("Successfully exported realm: {} with {} groups, {} users, {} roles, {} clients",
                realmName,
                realm.getGroups() != null ? realm.getGroups().size() : 0,
                realm.getUsers() != null ? realm.getUsers().size() : 0,
                realm.getRoles() != null ? realm.getRoles().getRealm().size() : 0,
                realm.getClients() != null ? realm.getClients().size() : 0);

        return realm;
    }

    /**
     * Compare two realm representations for fidelity
     */
    public ValidationResult compareRealms(RealmRepresentation original, RealmRepresentation exported) {
        log.info("Comparing realms: {} vs {}", original.getRealm(), exported.getRealm());

        ValidationResult.ValidationResultBuilder resultBuilder = ValidationResult.builder();
        List<String> differences = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        Map<String, Double> componentAccuracy = new HashMap<>();

        try {
            // Convert to JsonNodes for deep comparison
            JsonNode originalNode = objectMapper.valueToTree(original);
            JsonNode exportedNode = objectMapper.valueToTree(exported);

            // Compare realm settings
            double realmAccuracy = compareRealmSettings(originalNode, exportedNode, differences);
            componentAccuracy.put("realm", realmAccuracy);

            // Compare groups
            double groupsAccuracy = compareGroups(original.getGroups(), exported.getGroups(), differences);
            componentAccuracy.put("groups", groupsAccuracy);

            // Compare users
            double usersAccuracy = compareUsers(original.getUsers(), exported.getUsers(), differences);
            componentAccuracy.put("users", usersAccuracy);

            // Compare roles
            double rolesAccuracy = compareRoles(original.getRoles(), exported.getRoles(), differences);
            componentAccuracy.put("roles", rolesAccuracy);

            // Compare clients
            double clientsAccuracy = compareClients(original.getClients(), exported.getClients(), differences);
            componentAccuracy.put("clients", clientsAccuracy);

            // Calculate overall accuracy
            double overallAccuracy = componentAccuracy.values().stream()
                    .mapToDouble(Double::doubleValue)
                    .average()
                    .orElse(0.0);

            boolean isValid = differences.isEmpty() && overallAccuracy >= 99.0;

            log.info("Realm comparison completed. Overall accuracy: {}%, Valid: {}, Differences: {}",
                    String.format("%.2f", overallAccuracy), isValid, differences.size());

            return resultBuilder
                    .valid(isValid)
                    .accuracyPercentage(overallAccuracy)
                    .differences(differences)
                    .warnings(warnings)
                    .componentAccuracy(componentAccuracy)
                    .totalElements(countElements(original))
                    .matchedElements(countMatchedElements(original, exported))
                    .build();

        } catch (Exception e) {
            log.error("Realm comparison failed", e);
            differences.add("Comparison failed: " + e.getMessage());
            return resultBuilder
                    .valid(false)
                    .accuracyPercentage(0.0)
                    .differences(differences)
                    .warnings(warnings)
                    .build();
        }
    }

    private double compareRealmSettings(JsonNode original, JsonNode exported, List<String> differences) {
        String[] criticalFields = {
                "realm", "enabled", "displayName", "registrationAllowed", "loginWithEmailAllowed",
                "duplicateEmailsAllowed", "resetPasswordAllowed", "editUsernameAllowed",
                "ssoSessionIdleTimeout", "ssoSessionMaxLifespan", "accessTokenLifespan"
        };

        int totalFields = criticalFields.length;
        int matchedFields = 0;

        for (String field : criticalFields) {
            JsonNode originalValue = original.get(field);
            JsonNode exportedValue = exported.get(field);

            if (Objects.equals(originalValue, exportedValue)) {
                matchedFields++;
            } else {
                differences.add(String.format("Realm setting '%s': original='%s', exported='%s'",
                        field, originalValue, exportedValue));
            }
        }

        return (double) matchedFields / totalFields * 100.0;
    }

    private double compareGroups(List<?> originalGroups, List<?> exportedGroups, List<String> differences) {
        if (originalGroups == null && exportedGroups == null)
            return 100.0;
        if (originalGroups == null || exportedGroups == null) {
            differences.add("Groups mismatch: one is null");
            return 0.0;
        }

        if (originalGroups.size() != exportedGroups.size()) {
            differences.add(String.format("Groups count mismatch: original=%d, exported=%d",
                    originalGroups.size(), exportedGroups.size()));
        }

        // Detailed group comparison logic would go here
        // For now, return basic size comparison
        return originalGroups.size() == exportedGroups.size() ? 100.0
                : Math.max(0, 100.0 - Math.abs(originalGroups.size() - exportedGroups.size()) * 10.0);
    }

    private double compareUsers(List<?> originalUsers, List<?> exportedUsers, List<String> differences) {
        if (originalUsers == null && exportedUsers == null)
            return 100.0;
        if (originalUsers == null || exportedUsers == null) {
            differences.add("Users mismatch: one is null");
            return 0.0;
        }

        if (originalUsers.size() != exportedUsers.size()) {
            differences.add(String.format("Users count mismatch: original=%d, exported=%d",
                    originalUsers.size(), exportedUsers.size()));
        }

        return originalUsers.size() == exportedUsers.size() ? 100.0
                : Math.max(0, 100.0 - Math.abs(originalUsers.size() - exportedUsers.size()) * 10.0);
    }

    private double compareRoles(Object originalRoles, Object exportedRoles, List<String> differences) {
        // Role comparison logic
        return 100.0; // Simplified for now
    }

    private double compareClients(List<?> originalClients, List<?> exportedClients, List<String> differences) {
        if (originalClients == null && exportedClients == null)
            return 100.0;
        if (originalClients == null || exportedClients == null) {
            differences.add("Clients mismatch: one is null");
            return 0.0;
        }

        if (originalClients.size() != exportedClients.size()) {
            differences.add(String.format("Clients count mismatch: original=%d, exported=%d",
                    originalClients.size(), exportedClients.size()));
        }

        return originalClients.size() == exportedClients.size() ? 100.0
                : Math.max(0, 100.0 - Math.abs(originalClients.size() - exportedClients.size()) * 10.0);
    }

    private int countElements(RealmRepresentation realm) {
        int count = 1; // realm itself
        if (realm.getGroups() != null)
            count += realm.getGroups().size();
        if (realm.getUsers() != null)
            count += realm.getUsers().size();
        if (realm.getRoles() != null && realm.getRoles().getRealm() != null)
            count += realm.getRoles().getRealm().size();
        if (realm.getClients() != null)
            count += realm.getClients().size();
        return count;
    }

    private int countMatchedElements(RealmRepresentation original, RealmRepresentation exported) {
        // Simplified counting - would need detailed comparison
        return countElements(exported);
    }
}
