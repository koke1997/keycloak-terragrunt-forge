package com.keycloak.forge.model;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.keycloak.representations.idm.RealmRepresentation;

@Data
public class ConversionRequest {
    
    @NotNull
    @Valid
    private RealmRepresentation realm;
    
    private ConversionOptions options = new ConversionOptions();
    
    @Data
    public static class ConversionOptions {
        private boolean includeUsers = true;
        private boolean includeGroups = true;
        private boolean includeClients = true;
        private boolean includeRoles = true;
        private boolean generateTerragrunt = true;
        private String outputFormat = "terragrunt";
        private boolean validateOutput = true;
    }
}