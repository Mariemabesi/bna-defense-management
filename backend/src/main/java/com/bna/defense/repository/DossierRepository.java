package com.bna.defense.repository;

import com.bna.defense.entity.Dossier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DossierRepository extends JpaRepository<Dossier, Long> {
    Optional<Dossier> findByReference(String reference);
    List<Dossier> findByReferenceContainingIgnoreCaseOrTitreContainingIgnoreCase(String reference, String titre);
}
