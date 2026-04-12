package com.bna.defense.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseFixInitializer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            System.out.println("BNA-FIX: Dropping affaires_type_check constraint if exists...");
            jdbcTemplate.execute("ALTER TABLE affaires DROP CONSTRAINT IF EXISTS affaires_type_check;");
            System.out.println("BNA-FIX: Constraint dropped successfully.");
        } catch (Exception e) {
            System.err.println("BNA-FIX: Could not drop constraint (might not exist): " + e.getMessage());
        }
    }
}
