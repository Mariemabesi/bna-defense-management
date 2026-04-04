package com.bna.defense.repository;

import com.bna.defense.entity.RecentDossier;
import com.bna.defense.entity.User;
import com.bna.defense.entity.Dossier;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecentDossierRepository extends JpaRepository<RecentDossier, Long> {

    @Query("SELECT rd.dossier FROM RecentDossier rd WHERE rd.user = :user ORDER BY rd.accessedAt DESC")
    List<Dossier> findLastConsulted(User user, Pageable pageable);

    Optional<RecentDossier> findByUserAndDossier(User user, Dossier dossier);
    
    void deleteByUser(User user);
}
