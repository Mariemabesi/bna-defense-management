package com.bna.defense.repository.referentiel;
import com.bna.defense.entity.referentiel.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface ModeReglementRepository extends JpaRepository<ModeReglement, Long> {}
