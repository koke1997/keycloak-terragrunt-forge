-- Database initialization script for Keycloak Terragrunt Forge

-- Create keycloak database for Keycloak server
CREATE DATABASE keycloak;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE keycloak_forge TO forge_user;
GRANT ALL PRIVILEGES ON DATABASE keycloak TO forge_user;

-- Create application schema if needed
\c keycloak_forge;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create initial tables if they don't exist
CREATE TABLE IF NOT EXISTS conversion_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    realm_name VARCHAR(255) NOT NULL,
    conversion_id VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL,
    input_size INTEGER,
    output_files INTEGER,
    complexity_score INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT
);

CREATE TABLE IF NOT EXISTS validation_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversion_id VARCHAR(255) REFERENCES conversion_history(conversion_id),
    original_realm_name VARCHAR(255) NOT NULL,
    deployed_realm_name VARCHAR(255) NOT NULL,
    accuracy_percentage DECIMAL(5,2),
    is_valid BOOLEAN,
    differences_count INTEGER,
    warnings_count INTEGER,
    execution_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversion_history_realm_name ON conversion_history(realm_name);
CREATE INDEX IF NOT EXISTS idx_conversion_history_status ON conversion_history(status);
CREATE INDEX IF NOT EXISTS idx_conversion_history_created_at ON conversion_history(created_at);
CREATE INDEX IF NOT EXISTS idx_validation_results_conversion_id ON validation_results(conversion_id);

-- Insert sample data for testing
INSERT INTO conversion_history (realm_name, conversion_id, status, input_size, output_files, complexity_score)
VALUES 
    ('groups-test-realm', 'test-conversion-1', 'completed', 15000, 5, 85),
    ('example-realm', 'test-conversion-2', 'completed', 8000, 4, 65)
ON CONFLICT (conversion_id) DO NOTHING;