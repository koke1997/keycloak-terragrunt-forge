package com.keycloak.forge.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException;

import lombok.extern.slf4j.Slf4j;

/**
 * Global exception handler for the API
 */
@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex, WebRequest request) {

        log.error("JSON parsing error: {}", ex.getMessage(), ex);

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", System.currentTimeMillis());
        errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
        errorResponse.put("error", "Bad Request");
        errorResponse.put("path", request.getDescription(false).replace("uri=", ""));

        // Extract more specific error information
        Throwable rootCause = ex.getRootCause();
        if (rootCause instanceof UnrecognizedPropertyException) {
            UnrecognizedPropertyException upe = (UnrecognizedPropertyException) rootCause;
            errorResponse.put("message", String.format(
                    "Unrecognized field '%s' in class %s. Known fields: %s",
                    upe.getPropertyName(),
                    upe.getReferringClass().getSimpleName(),
                    upe.getKnownPropertyIds()));
        } else if (rootCause instanceof JsonMappingException) {
            JsonMappingException jme = (JsonMappingException) rootCause;
            errorResponse.put("message", "JSON mapping error: " + jme.getOriginalMessage());
            errorResponse.put("location", jme.getLocation() != null ? jme.getLocation().toString() : "unknown");
        } else if (rootCause instanceof JsonParseException) {
            JsonParseException jpe = (JsonParseException) rootCause;
            errorResponse.put("message", "JSON parse error: " + jpe.getOriginalMessage());
            errorResponse.put("location", jpe.getLocation() != null ? jpe.getLocation().toString() : "unknown");
        } else {
            errorResponse.put("message", "Invalid JSON format: " + ex.getMostSpecificCause().getMessage());
        }

        return ResponseEntity.badRequest().body(errorResponse);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {

        log.error("Validation error: {}", ex.getMessage(), ex);

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", System.currentTimeMillis());
        errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
        errorResponse.put("error", "Validation Failed");

        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            fieldErrors.put(fieldName, errorMessage);
        });

        errorResponse.put("fieldErrors", fieldErrors);
        errorResponse.put("message", "Validation failed for fields: " + fieldErrors.keySet());

        return ResponseEntity.badRequest().body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(
            Exception ex, WebRequest request) {

        log.error("Unexpected error: {}", ex.getMessage(), ex);

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", System.currentTimeMillis());
        errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        errorResponse.put("error", "Internal Server Error");
        errorResponse.put("message", ex.getMessage());
        errorResponse.put("path", request.getDescription(false).replace("uri=", ""));

        return ResponseEntity.internalServerError().body(errorResponse);
    }
}
