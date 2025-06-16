package com.keycloak.forge.utils;

import org.keycloak.representations.idm.*;

import java.util.*;

/**
 * Factory class for creating test data fixtures for different realm scenarios.
 * This helps maintain consistent test data across different test classes.
 */
public class TestDataFactory {

    /**
     * Creates a simple realm with basic configuration for unit testing.
     */
    public static RealmRepresentation createSimpleRealm() {
        RealmRepresentation realm = new RealmRepresentation();
        realm.setRealm("simple-realm");
        realm.setDisplayName("Simple Test Realm");
        realm.setEnabled(true);
        realm.setRegistrationAllowed(true);
        realm.setRememberMe(true);
        realm.setVerifyEmail(false);
        realm.setLoginWithEmailAllowed(true);
        realm.setDuplicateEmailsAllowed(false);
        realm.setResetPasswordAllowed(true);
        realm.setEditUsernameAllowed(false);
        realm.setSslRequired("none");
        
        // Session settings
        realm.setAccessTokenLifespan(300);
        realm.setSsoSessionIdleTimeout(1800);
        realm.setSsoSessionMaxLifespan(36000);
        realm.setOfflineSessionIdleTimeout(2592000);
        realm.setOfflineSessionMaxLifespan(5184000);
        realm.setOfflineSessionMaxLifespanEnabled(false);
        realm.setAccessCodeLifespan(60);
        realm.setAccessCodeLifespanUserAction(300);
        realm.setAccessCodeLifespanLogin(1800);
        realm.setActionTokenGeneratedByAdminLifespan(43200);
        realm.setActionTokenGeneratedByUserLifespan(300);
        realm.setRevokeRefreshToken(false);
        realm.setRefreshTokenMaxReuse(0);
        
        return realm;
    }

    /**
     * Creates a realm with roles for testing role generation functionality.
     */
    public static RealmRepresentation createRealmWithRoles() {
        RealmRepresentation realm = createSimpleRealm();
        realm.setRealm("realm-with-roles");
        
        RolesRepresentation roles = new RolesRepresentation();
        List<RoleRepresentation> realmRoles = new ArrayList<>();
        
        // Simple role
        RoleRepresentation userRole = new RoleRepresentation();
        userRole.setId("user-role-id");
        userRole.setName("user");
        userRole.setDescription("Basic user role");
        userRole.setComposite(false);
        userRole.setClientRole(false);
        
        Map<String, List<String>> userAttributes = new HashMap<>();
        userAttributes.put("department", List.of("IT"));
        userAttributes.put("level", List.of("junior"));
        userRole.setAttributes(userAttributes);
        
        // Admin role (composite)
        RoleRepresentation adminRole = new RoleRepresentation();
        adminRole.setId("admin-role-id");
        adminRole.setName("admin");
        adminRole.setDescription("Administrator role");
        adminRole.setComposite(true);
        adminRole.setClientRole(false);
        
        Map<String, List<String>> adminAttributes = new HashMap<>();
        adminAttributes.put("department", List.of("IT"));
        adminAttributes.put("level", List.of("senior"));
        adminAttributes.put("permissions", List.of("read", "write", "delete", "admin"));
        adminRole.setAttributes(adminAttributes);
        
        // Set composite relationship
        RoleRepresentation.Composites composites = new RoleRepresentation.Composites();
        composites.setRealm(new HashSet<>(List.of("user")));
        adminRole.setComposites(composites);
        
        realmRoles.add(userRole);
        realmRoles.add(adminRole);
        
        roles.setRealm(realmRoles);
        realm.setRoles(roles);
        
        return realm;
    }

    /**
     * Creates a realm with groups for testing group hierarchy functionality.
     */
    public static RealmRepresentation createRealmWithGroups() {
        RealmRepresentation realm = createSimpleRealm();
        realm.setRealm("realm-with-groups");
        
        List<GroupRepresentation> groups = new ArrayList<>();
        
        // Parent group
        GroupRepresentation parentGroup = new GroupRepresentation();
        parentGroup.setId("parent-group-id");
        parentGroup.setName("engineering");
        parentGroup.setPath("/engineering");
        
        Map<String, List<String>> parentAttributes = new HashMap<>();
        parentAttributes.put("department", List.of("Engineering"));
        parentAttributes.put("budget", List.of("1000000"));
        parentGroup.setAttributes(parentAttributes);
        
        // Child groups
        GroupRepresentation frontendGroup = new GroupRepresentation();
        frontendGroup.setId("frontend-group-id");
        frontendGroup.setName("frontend");
        frontendGroup.setPath("/engineering/frontend");
        
        Map<String, List<String>> frontendAttributes = new HashMap<>();
        frontendAttributes.put("technology", List.of("React", "TypeScript"));
        frontendAttributes.put("team_size", List.of("5"));
        frontendGroup.setAttributes(frontendAttributes);
        
        GroupRepresentation backendGroup = new GroupRepresentation();
        backendGroup.setId("backend-group-id");
        backendGroup.setName("backend");
        backendGroup.setPath("/engineering/backend");
        
        Map<String, List<String>> backendAttributes = new HashMap<>();
        backendAttributes.put("technology", List.of("Java", "Spring Boot"));
        backendAttributes.put("team_size", List.of("7"));
        backendGroup.setAttributes(backendAttributes);
        
        // Set up hierarchy
        parentGroup.setSubGroups(List.of(frontendGroup, backendGroup));
        
        // Add role assignments
        parentGroup.setRealmRoles(new ArrayList<>(List.of("user")));
        frontendGroup.setRealmRoles(new ArrayList<>(List.of("user", "developer")));
        backendGroup.setRealmRoles(new ArrayList<>(List.of("user", "developer", "admin")));
        
        groups.add(parentGroup);
        realm.setGroups(groups);
        
        return realm;
    }

    /**
     * Creates a realm with users for testing user generation functionality.
     */
    public static RealmRepresentation createRealmWithUsers() {
        RealmRepresentation realm = createSimpleRealm();
        realm.setRealm("realm-with-users");
        
        List<UserRepresentation> users = new ArrayList<>();
        
        // Regular user
        UserRepresentation regularUser = new UserRepresentation();
        regularUser.setId("user1-id");
        regularUser.setUsername("john.doe");
        regularUser.setEmail("john.doe@example.com");
        regularUser.setFirstName("John");
        regularUser.setLastName("Doe");
        regularUser.setEnabled(true);
        regularUser.setEmailVerified(true);
        
        Map<String, List<String>> userAttributes = new HashMap<>();
        userAttributes.put("employee_id", List.of("E001"));
        userAttributes.put("department", List.of("Engineering"));
        regularUser.setAttributes(userAttributes);
        
        regularUser.setGroups(new ArrayList<>(List.of("/engineering/frontend")));
        
        // Admin user
        UserRepresentation adminUser = new UserRepresentation();
        adminUser.setId("admin1-id");
        adminUser.setUsername("admin");
        adminUser.setEmail("admin@example.com");
        adminUser.setFirstName("Admin");
        adminUser.setLastName("User");
        adminUser.setEnabled(true);
        adminUser.setEmailVerified(true);
        
        Map<String, List<String>> adminAttributes = new HashMap<>();
        adminAttributes.put("employee_id", List.of("E999"));
        adminAttributes.put("department", List.of("IT"));
        adminAttributes.put("role", List.of("system-administrator"));
        adminUser.setAttributes(adminAttributes);
        
        adminUser.setGroups(new ArrayList<>(List.of("/engineering", "/engineering/backend")));
        
        users.add(regularUser);
        users.add(adminUser);
        
        realm.setUsers(users);
        
        return realm;
    }

    /**
     * Creates a realm with clients for testing client generation functionality.
     */
    public static RealmRepresentation createRealmWithClients() {
        RealmRepresentation realm = createSimpleRealm();
        realm.setRealm("realm-with-clients");
        
        List<ClientRepresentation> clients = new ArrayList<>();
        
        // Web application client
        ClientRepresentation webClient = new ClientRepresentation();
        webClient.setId("web-client-id");
        webClient.setClientId("web-app");
        webClient.setName("Web Application");
        webClient.setDescription("Main web application client");
        webClient.setEnabled(true);
        webClient.setPublicClient(false);
        webClient.setStandardFlowEnabled(true);
        webClient.setImplicitFlowEnabled(false);
        webClient.setDirectAccessGrantsEnabled(true);
        webClient.setServiceAccountsEnabled(false);
        webClient.setBearerOnly(false);
        
        webClient.setRedirectUris(List.of(
            "http://localhost:3000/*",
            "https://app.example.com/*"
        ));
        webClient.setWebOrigins(List.of(
            "http://localhost:3000",
            "https://app.example.com"
        ));
        
        // Protocol mappers
        List<ProtocolMapperRepresentation> mappers = new ArrayList<>();
        
        ProtocolMapperRepresentation emailMapper = new ProtocolMapperRepresentation();
        emailMapper.setId("email-mapper-id");
        emailMapper.setName("email");
        emailMapper.setProtocol("openid-connect");
        emailMapper.setProtocolMapper("oidc-usermodel-property-mapper");
        
        Map<String, String> emailConfig = new HashMap<>();
        emailConfig.put("user.attribute", "email");
        emailConfig.put("claim.name", "email");
        emailConfig.put("jsonType.label", "String");
        emailConfig.put("id.token.claim", "true");
        emailConfig.put("access.token.claim", "true");
        emailConfig.put("userinfo.token.claim", "true");
        emailMapper.setConfig(emailConfig);
        
        mappers.add(emailMapper);
        webClient.setProtocolMappers(mappers);
        
        // Service account client
        ClientRepresentation serviceClient = new ClientRepresentation();
        serviceClient.setId("service-client-id");
        serviceClient.setClientId("backend-service");
        serviceClient.setName("Backend Service");
        serviceClient.setDescription("Backend service client");
        serviceClient.setEnabled(true);
        serviceClient.setPublicClient(false);
        serviceClient.setStandardFlowEnabled(false);
        serviceClient.setImplicitFlowEnabled(false);
        serviceClient.setDirectAccessGrantsEnabled(false);
        serviceClient.setServiceAccountsEnabled(true);
        serviceClient.setBearerOnly(false);
        
        clients.add(webClient);
        clients.add(serviceClient);
        
        realm.setClients(clients);
        
        return realm;
    }

    /**
     * Creates a realm with identity providers for testing IDP functionality.
     */
    public static RealmRepresentation createRealmWithIdentityProviders() {
        RealmRepresentation realm = createSimpleRealm();
        realm.setRealm("realm-with-idps");
        
        List<IdentityProviderRepresentation> idps = new ArrayList<>();
        
        // Google IDP
        IdentityProviderRepresentation googleIdp = new IdentityProviderRepresentation();
        googleIdp.setAlias("google");
        googleIdp.setDisplayName("Google");
        googleIdp.setProviderId("google");
        googleIdp.setEnabled(true);
        googleIdp.setStoreToken(true);
        googleIdp.setTrustEmail(true);
        googleIdp.setFirstBrokerLoginFlowAlias("first broker login");
        
        Map<String, String> googleConfig = new HashMap<>();
        googleConfig.put("clientId", "google-client-id");
        googleConfig.put("clientSecret", "google-client-secret");
        googleConfig.put("hostedDomain", "example.com");
        googleIdp.setConfig(googleConfig);
        
        // OIDC IDP
        IdentityProviderRepresentation oidcIdp = new IdentityProviderRepresentation();
        oidcIdp.setAlias("corporate-oidc");
        oidcIdp.setDisplayName("Corporate OIDC");
        oidcIdp.setProviderId("oidc");
        oidcIdp.setEnabled(true);
        oidcIdp.setStoreToken(false);
        oidcIdp.setTrustEmail(true);
        oidcIdp.setFirstBrokerLoginFlowAlias("first broker login");
        
        Map<String, String> oidcConfig = new HashMap<>();
        oidcConfig.put("authorizationUrl", "https://corp.example.com/auth");
        oidcConfig.put("tokenUrl", "https://corp.example.com/token");
        oidcConfig.put("clientId", "keycloak-client");
        oidcConfig.put("clientSecret", "secret-key");
        oidcConfig.put("issuer", "https://corp.example.com");
        oidcIdp.setConfig(oidcConfig);
        
        idps.add(googleIdp);
        idps.add(oidcIdp);
        
        realm.setIdentityProviders(idps);
        
        return realm;
    }

    /**
     * Creates a realm with authentication flows for testing flow functionality.
     */
    public static RealmRepresentation createRealmWithAuthenticationFlows() {
        RealmRepresentation realm = createSimpleRealm();
        realm.setRealm("realm-with-flows");
        
        List<AuthenticationFlowRepresentation> flows = new ArrayList<>();
        
        // Custom browser flow
        AuthenticationFlowRepresentation customBrowserFlow = new AuthenticationFlowRepresentation();
        customBrowserFlow.setId("custom-browser-flow-id");
        customBrowserFlow.setAlias("custom-browser");
        customBrowserFlow.setDescription("Custom browser authentication flow");
        customBrowserFlow.setProviderId("basic-flow");
        customBrowserFlow.setTopLevel(true);
        customBrowserFlow.setBuiltIn(false);
        
        // MFA flow
        AuthenticationFlowRepresentation mfaFlow = new AuthenticationFlowRepresentation();
        mfaFlow.setId("mfa-flow-id");
        mfaFlow.setAlias("mfa-required");
        mfaFlow.setDescription("Multi-factor authentication required flow");
        mfaFlow.setProviderId("basic-flow");
        mfaFlow.setTopLevel(false);
        mfaFlow.setBuiltIn(false);
        
        flows.add(customBrowserFlow);
        flows.add(mfaFlow);
        
        realm.setAuthenticationFlows(flows);
        
        return realm;
    }

    /**
     * Creates a realm with client scopes for testing scope functionality.
     */
    public static RealmRepresentation createRealmWithClientScopes() {
        RealmRepresentation realm = createSimpleRealm();
        realm.setRealm("realm-with-scopes");
        
        List<ClientScopeRepresentation> scopes = new ArrayList<>();
        
        // Profile scope
        ClientScopeRepresentation profileScope = new ClientScopeRepresentation();
        profileScope.setId("profile-scope-id");
        profileScope.setName("profile");
        profileScope.setDescription("OpenID Connect built-in scope: profile");
        profileScope.setProtocol("openid-connect");
        
        Map<String, String> profileAttributes = new HashMap<>();
        profileAttributes.put("consent.screen.text", "Profile Information");
        profileAttributes.put("include.in.token.scope", "true");
        profileAttributes.put("display.on.consent.screen", "true");
        profileScope.setAttributes(profileAttributes);
        
        // Custom scope
        ClientScopeRepresentation customScope = new ClientScopeRepresentation();
        customScope.setId("custom-scope-id");
        customScope.setName("custom-permissions");
        customScope.setDescription("Custom application permissions");
        customScope.setProtocol("openid-connect");
        
        Map<String, String> customAttributes = new HashMap<>();
        customAttributes.put("consent.screen.text", "Application Permissions");
        customAttributes.put("include.in.token.scope", "true");
        customAttributes.put("display.on.consent.screen", "true");
        customScope.setAttributes(customAttributes);
        
        scopes.add(profileScope);
        scopes.add(customScope);
        
        realm.setClientScopes(scopes);
        
        return realm;
    }

    /**
     * Creates a comprehensive realm with all components for integration testing.
     */
    public static RealmRepresentation createComprehensiveRealm() {
        RealmRepresentation realm = createSimpleRealm();
        realm.setRealm("comprehensive-realm");
        
        // Add roles
        RealmRepresentation realmWithRoles = createRealmWithRoles();
        realm.setRoles(realmWithRoles.getRoles());
        
        // Add groups
        RealmRepresentation realmWithGroups = createRealmWithGroups();
        realm.setGroups(realmWithGroups.getGroups());
        
        // Add users
        RealmRepresentation realmWithUsers = createRealmWithUsers();
        realm.setUsers(realmWithUsers.getUsers());
        
        // Add clients
        RealmRepresentation realmWithClients = createRealmWithClients();
        realm.setClients(realmWithClients.getClients());
        
        // Add identity providers
        RealmRepresentation realmWithIdps = createRealmWithIdentityProviders();
        realm.setIdentityProviders(realmWithIdps.getIdentityProviders());
        
        // Add authentication flows
        RealmRepresentation realmWithFlows = createRealmWithAuthenticationFlows();
        realm.setAuthenticationFlows(realmWithFlows.getAuthenticationFlows());
        
        // Add client scopes
        RealmRepresentation realmWithScopes = createRealmWithClientScopes();
        realm.setClientScopes(realmWithScopes.getClientScopes());
        
        // Add security policies
        realm.setPasswordPolicy("length(8) and digits(1) and specialChars(1)");
        realm.setOtpPolicyType("totp");
        realm.setOtpPolicyAlgorithm("HmacSHA1");
        realm.setOtpPolicyDigits(6);
        realm.setOtpPolicyPeriod(30);
        
        // Browser security headers
        Map<String, String> browserHeaders = new HashMap<>();
        browserHeaders.put("contentSecurityPolicy", "frame-src 'self'; frame-ancestors 'self'");
        browserHeaders.put("xFrameOptions", "SAMEORIGIN");
        browserHeaders.put("xContentTypeOptions", "nosniff");
        realm.setBrowserSecurityHeaders(browserHeaders);
        
        return realm;
    }
}