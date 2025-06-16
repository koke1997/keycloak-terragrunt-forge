package com.keycloak.forge.service;

import com.keycloak.forge.model.ConversionRequest;
import com.keycloak.forge.model.ConversionResult;
import com.keycloak.forge.utils.TestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.keycloak.representations.idm.*;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.util.*;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

import static org.assertj.core.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("Terraform Generator Performance Tests")
class TerraformGeneratorPerformanceTest {

    @InjectMocks
    private TerraformGeneratorService terraformGeneratorService;

    private ConversionRequest.ConversionOptions defaultOptions;

    @BeforeEach
    void setUp() {
        defaultOptions = createDefaultOptions();
    }

    @Test
    @DisplayName("Should process small realm quickly")
    void shouldProcessSmallRealmQuickly() {
        // Given
        RealmRepresentation realm = TestDataFactory.createSimpleRealm();

        // When
        long startTime = System.currentTimeMillis();
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, defaultOptions);
        long endTime = System.currentTimeMillis();

        // Then
        assertThat(result.isSuccess()).isTrue();
        long processingTime = endTime - startTime;
        
        assertThat(processingTime)
            .as("Small realm should process in under 100ms")
            .isLessThan(100);
            
        System.out.printf("Small realm processing time: %d ms%n", processingTime);
    }

    @Test
    @DisplayName("Should process medium realm efficiently")
    void shouldProcessMediumRealmEfficiently() {
        // Given
        RealmRepresentation realm = createMediumComplexityRealm();

        // When
        long startTime = System.currentTimeMillis();
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, defaultOptions);
        long endTime = System.currentTimeMillis();

        // Then
        assertThat(result.isSuccess()).isTrue();
        long processingTime = endTime - startTime;
        
        assertThat(processingTime)
            .as("Medium realm should process in under 1 second")
            .isLessThan(1000);
            
        System.out.printf("Medium realm processing time: %d ms%n", processingTime);
        System.out.printf("Generated %d files%n", result.getFiles().size());
    }

    @Test
    @DisplayName("Should process large realm within acceptable time")
    void shouldProcessLargeRealmWithinAcceptableTime() {
        // Given
        RealmRepresentation realm = createLargeComplexityRealm();

        // When
        long startTime = System.currentTimeMillis();
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, defaultOptions);
        long endTime = System.currentTimeMillis();

        // Then
        assertThat(result.isSuccess()).isTrue();
        long processingTime = endTime - startTime;
        
        assertThat(processingTime)
            .as("Large realm should process in under 5 seconds")
            .isLessThan(5000);
            
        System.out.printf("Large realm processing time: %d ms%n", processingTime);
        System.out.printf("Generated %d files%n", result.getFiles().size());
    }

    @Test
    @DisplayName("Should handle concurrent requests efficiently")
    void shouldHandleConcurrentRequestsEfficiently() throws InterruptedException {
        // Given
        int numberOfThreads = 5;
        int requestsPerThread = 3;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch latch = new CountDownLatch(numberOfThreads * requestsPerThread);
        AtomicLong totalProcessingTime = new AtomicLong(0);
        List<Exception> exceptions = Collections.synchronizedList(new ArrayList<>());
        
        RealmRepresentation realm = TestDataFactory.createComprehensiveRealm();

        // When
        long overallStartTime = System.currentTimeMillis();
        
        for (int thread = 0; thread < numberOfThreads; thread++) {
            executor.submit(() -> {
                for (int request = 0; request < requestsPerThread; request++) {
                    try {
                        long startTime = System.currentTimeMillis();
                        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, defaultOptions);
                        long endTime = System.currentTimeMillis();
                        
                        if (!result.isSuccess()) {
                            exceptions.add(new RuntimeException("Conversion failed"));
                        }
                        
                        totalProcessingTime.addAndGet(endTime - startTime);
                    } catch (Exception e) {
                        exceptions.add(e);
                    } finally {
                        latch.countDown();
                    }
                }
            });
        }
        
        boolean completed = latch.await(30, TimeUnit.SECONDS);
        long overallEndTime = System.currentTimeMillis();
        executor.shutdown();

        // Then
        assertThat(completed).as("All requests should complete within 30 seconds").isTrue();
        assertThat(exceptions).as("No exceptions should occur").isEmpty();
        
        long overallTime = overallEndTime - overallStartTime;
        long averageProcessingTime = totalProcessingTime.get() / (numberOfThreads * requestsPerThread);
        
        System.out.printf("Concurrent processing - Overall time: %d ms%n", overallTime);
        System.out.printf("Concurrent processing - Average per request: %d ms%n", averageProcessingTime);
        System.out.printf("Concurrent processing - Total requests: %d%n", numberOfThreads * requestsPerThread);
        
        assertThat(averageProcessingTime)
            .as("Average processing time should be reasonable")
            .isLessThan(2000);
    }

    @Test
    @DisplayName("Should maintain performance with repeated processing")
    void shouldMaintainPerformanceWithRepeatedProcessing() {
        // Given
        RealmRepresentation realm = TestDataFactory.createComprehensiveRealm();
        int iterations = 10;
        List<Long> processingTimes = new ArrayList<>();

        // When
        for (int i = 0; i < iterations; i++) {
            long startTime = System.currentTimeMillis();
            ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, defaultOptions);
            long endTime = System.currentTimeMillis();
            
            assertThat(result.isSuccess()).isTrue();
            processingTimes.add(endTime - startTime);
        }

        // Then
        long averageTime = processingTimes.stream().mapToLong(Long::longValue).sum() / iterations;
        long maxTime = processingTimes.stream().mapToLong(Long::longValue).max().orElse(0);
        long minTime = processingTimes.stream().mapToLong(Long::longValue).min().orElse(0);
        
        System.out.printf("Repeated processing - Average: %d ms, Min: %d ms, Max: %d ms%n", 
            averageTime, minTime, maxTime);
        
        // Performance should be consistent (max time shouldn't be more than 3x average)
        assertThat(maxTime)
            .as("Maximum processing time should not exceed 3x average time")
            .isLessThan(averageTime * 3);
            
        assertThat(averageTime)
            .as("Average processing time should be reasonable")
            .isLessThan(2000);
    }

    @Test
    @DisplayName("Should scale linearly with realm complexity")
    void shouldScaleLinearlyWithRealmComplexity() {
        // Given
        RealmRepresentation smallRealm = TestDataFactory.createSimpleRealm();
        RealmRepresentation mediumRealm = createMediumComplexityRealm();
        RealmRepresentation largeRealm = createLargeComplexityRealm();

        // When & Then
        long smallTime = measureProcessingTime(smallRealm);
        long mediumTime = measureProcessingTime(mediumRealm);
        long largeTime = measureProcessingTime(largeRealm);
        
        System.out.printf("Scaling test - Small: %d ms, Medium: %d ms, Large: %d ms%n", 
            smallTime, mediumTime, largeTime);
        
        // Performance should scale reasonably (not exponentially)
        assertThat(mediumTime)
            .as("Medium realm should not take more than 10x small realm time")
            .isLessThan(smallTime * 10);
            
        assertThat(largeTime)
            .as("Large realm should not take more than 5x medium realm time")
            .isLessThan(mediumTime * 5);
    }

    @Test
    @DisplayName("Should handle memory efficiently for large realms")
    void shouldHandleMemoryEfficientlyForLargeRealms() {
        // Given
        RealmRepresentation realm = createLargeComplexityRealm();
        Runtime runtime = Runtime.getRuntime();

        // When
        long memoryBefore = runtime.totalMemory() - runtime.freeMemory();
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, defaultOptions);
        long memoryAfter = runtime.totalMemory() - runtime.freeMemory();

        // Then
        assertThat(result.isSuccess()).isTrue();
        
        long memoryUsed = memoryAfter - memoryBefore;
        System.out.printf("Memory usage: %d KB%n", memoryUsed / 1024);
        
        // Should not use excessive memory (less than 100MB for large realm)
        assertThat(memoryUsed)
            .as("Memory usage should be reasonable")
            .isLessThan(100 * 1024 * 1024); // 100MB
    }

    // Helper methods for creating test realms of different complexities
    private RealmRepresentation createMediumComplexityRealm() {
        RealmRepresentation realm = TestDataFactory.createComprehensiveRealm();
        realm.setRealm("medium-complexity-realm");
        
        // Add more roles (20 total)
        List<RoleRepresentation> additionalRoles = new ArrayList<>();
        for (int i = 3; i <= 20; i++) {
            RoleRepresentation role = new RoleRepresentation();
            role.setId("role-" + i + "-id");
            role.setName("role-" + i);
            role.setDescription("Role number " + i);
            role.setComposite(false);
            role.setClientRole(false);
            
            Map<String, List<String>> attributes = new HashMap<>();
            attributes.put("level", List.of("level-" + (i % 5)));
            attributes.put("department", List.of("dept-" + (i % 3)));
            role.setAttributes(attributes);
            
            additionalRoles.add(role);
        }
        
        if (realm.getRoles() != null && realm.getRoles().getRealm() != null) {
            realm.getRoles().getRealm().addAll(additionalRoles);
        }
        
        // Add more groups (10 total with 2-level hierarchy)
        List<GroupRepresentation> additionalGroups = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            GroupRepresentation parentGroup = new GroupRepresentation();
            parentGroup.setId("parent-group-" + i + "-id");
            parentGroup.setName("department-" + i);
            parentGroup.setPath("/department-" + i);
            
            List<GroupRepresentation> children = new ArrayList<>();
            for (int j = 1; j <= 3; j++) {
                GroupRepresentation childGroup = new GroupRepresentation();
                childGroup.setId("child-group-" + i + "-" + j + "-id");
                childGroup.setName("team-" + j);
                childGroup.setPath("/department-" + i + "/team-" + j);
                children.add(childGroup);
            }
            
            parentGroup.setSubGroups(children);
            additionalGroups.add(parentGroup);
        }
        
        if (realm.getGroups() != null) {
            realm.getGroups().addAll(additionalGroups);
        }
        
        return realm;
    }

    private RealmRepresentation createLargeComplexityRealm() {
        RealmRepresentation realm = createMediumComplexityRealm();
        realm.setRealm("large-complexity-realm");
        
        // Add many more roles (100 total)
        List<RoleRepresentation> manyRoles = new ArrayList<>();
        for (int i = 21; i <= 100; i++) {
            RoleRepresentation role = new RoleRepresentation();
            role.setId("role-" + i + "-id");
            role.setName("role-" + i);
            role.setDescription("Role number " + i);
            role.setComposite(i % 10 == 0); // Every 10th role is composite
            role.setClientRole(false);
            
            Map<String, List<String>> attributes = new HashMap<>();
            attributes.put("level", List.of("level-" + (i % 10)));
            attributes.put("department", List.of("dept-" + (i % 5)));
            attributes.put("permissions", List.of("perm1", "perm2", "perm3"));
            role.setAttributes(attributes);
            
            if (role.isComposite()) {
                RoleRepresentation.Composites composites = new RoleRepresentation.Composites();
                composites.setRealm(new ArrayList<>(List.of("role-" + (i - 1))));
                role.setComposites(composites);
            }
            
            manyRoles.add(role);
        }
        
        if (realm.getRoles() != null && realm.getRoles().getRealm() != null) {
            realm.getRoles().getRealm().addAll(manyRoles);
        }
        
        // Add deep group hierarchy (50 groups with 4-level depth)
        List<GroupRepresentation> deepGroups = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            GroupRepresentation level1 = new GroupRepresentation();
            level1.setId("l1-group-" + i + "-id");
            level1.setName("division-" + i);
            level1.setPath("/division-" + i);
            
            List<GroupRepresentation> level2Groups = new ArrayList<>();
            for (int j = 1; j <= 3; j++) {
                GroupRepresentation level2 = new GroupRepresentation();
                level2.setId("l2-group-" + i + "-" + j + "-id");
                level2.setName("department-" + j);
                level2.setPath("/division-" + i + "/department-" + j);
                
                List<GroupRepresentation> level3Groups = new ArrayList<>();
                for (int k = 1; k <= 2; k++) {
                    GroupRepresentation level3 = new GroupRepresentation();
                    level3.setId("l3-group-" + i + "-" + j + "-" + k + "-id");
                    level3.setName("team-" + k);
                    level3.setPath("/division-" + i + "/department-" + j + "/team-" + k);
                    level3Groups.add(level3);
                }
                
                level2.setSubGroups(level3Groups);
                level2Groups.add(level2);
            }
            
            level1.setSubGroups(level2Groups);
            deepGroups.add(level1);
        }
        
        if (realm.getGroups() != null) {
            realm.getGroups().addAll(deepGroups);
        }
        
        // Add many users (50 total)
        List<UserRepresentation> manyUsers = new ArrayList<>();
        for (int i = 1; i <= 50; i++) {
            UserRepresentation user = new UserRepresentation();
            user.setId("user-" + i + "-id");
            user.setUsername("user" + i);
            user.setEmail("user" + i + "@example.com");
            user.setFirstName("User");
            user.setLastName("Number" + i);
            user.setEnabled(true);
            
            Map<String, List<String>> attributes = new HashMap<>();
            attributes.put("employee_id", List.of("E" + String.format("%03d", i)));
            attributes.put("department", List.of("dept-" + (i % 5)));
            user.setAttributes(attributes);
            
            user.setGroups(new ArrayList<>(List.of("/division-" + ((i % 10) + 1))));
            manyUsers.add(user);
        }
        
        if (realm.getUsers() != null) {
            realm.getUsers().addAll(manyUsers);
        }
        
        return realm;
    }

    private long measureProcessingTime(RealmRepresentation realm) {
        long startTime = System.currentTimeMillis();
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, defaultOptions);
        long endTime = System.currentTimeMillis();
        
        assertThat(result.isSuccess()).isTrue();
        return endTime - startTime;
    }

    private ConversionRequest.ConversionOptions createDefaultOptions() {
        ConversionRequest.ConversionOptions options = new ConversionRequest.ConversionOptions();
        options.setIncludeUsers(true);
        options.setIncludeGroups(true);
        options.setIncludeClients(true);
        options.setIncludeRoles(true);
        options.setGenerateTerragrunt(true);
        options.setOutputFormat("terragrunt");
        options.setValidateOutput(true);
        return options;
    }
}