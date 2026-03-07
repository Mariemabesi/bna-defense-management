package com.bna.defense.repository;

import com.bna.defense.entity.Auxiliaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuxiliaireRepository extends JpaRepository<Auxiliaire, Long> {
}
