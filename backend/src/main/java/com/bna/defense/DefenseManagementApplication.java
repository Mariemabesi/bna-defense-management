package com.bna.defense;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class DefenseManagementApplication {

	public static void main(String[] args) {
		SpringApplication.run(DefenseManagementApplication.class, args);
	}

}
