package com.bna.defense.repository.referentiel;
import com.bna.defense.entity.referentiel.Notaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface NotaireRepository extends JpaRepository<Notaire, Long> {}
