package com.bna.defense.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

@Component
public class DatabaseMigrationRunner implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            System.out.println("--- Starting Database Fix: Remove roles_name_check ---");
            jdbcTemplate.execute("ALTER TABLE roles DROP CONSTRAINT IF EXISTS roles_name_check");
            System.out.println("--- Database Fix: Successfully dropped roles_name_check ---");

            // AI Features Additions
            System.out.println("--- AI Migration: Adding risk_score and embedding ---");
            jdbcTemplate.execute("ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS risk_score VARCHAR(10)");
            
            // Try enabling vector extension (might need superuser)
            try {
                jdbcTemplate.execute("CREATE EXTENSION IF NOT EXISTS vector");
                jdbcTemplate.execute("ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS embedding vector(1536)");
            } catch (Exception vex) {
                System.err.println("--- pgvector could not be enabled: Skipping embedding column ---");
            }

            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS ai_results (" +
                "id SERIAL PRIMARY KEY, feature VARCHAR(100), entity_type VARCHAR(50), entity_id INTEGER, " +
                "result JSONB, generated_at TIMESTAMP DEFAULT NOW(), expires_at TIMESTAMP, feedback VARCHAR(10))");

            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS notifications (" +
                "id SERIAL PRIMARY KEY, user_id INTEGER, message TEXT, type VARCHAR(50), " +
                "read BOOLEAN DEFAULT FALSE, dossier_id INTEGER, created_at TIMESTAMP DEFAULT NOW())");

            System.out.println("--- AI Migration: Successfully updated schema ---");
        } catch (Exception e) {
            System.err.println("--- Database Fix: Error in migration: " + e.getMessage());
        }
    }
}
