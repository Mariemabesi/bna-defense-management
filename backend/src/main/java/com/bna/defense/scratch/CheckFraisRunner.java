package com.bna.defense.scratch;

import com.bna.defense.entity.Frais;
import com.bna.defense.repository.FraisRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CheckFraisRunner implements CommandLineRunner {

    private final FraisRepository repository;

    public CheckFraisRunner(FraisRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("--- CHECKING FRAIS ---");
        List<Frais> all = repository.findAll();
        System.out.println("Total frais in DB: " + all.size());
        for (Frais f : all) {
            System.out.println("Frais ID: " + f.getId() + ", Libelle: " + f.getLibelle() + ", Statut: " + f.getStatut() + ", CreatedBy: " + f.getCreatedBy());
        }
        System.out.println("--- END CHECK ---");
    }
}
