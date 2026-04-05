package com.bna.defense.repository;

import com.bna.defense.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);

    Optional<User> findByLinkedAuxiliaireId(Long id);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(d) FROM Dossier d WHERE d.assignedCharge.id = :id OR d.groupValidateur.id = :id")
    long countDossiersByUserId(Long id);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE User u SET u.manager = null WHERE u.manager.id = :id")
    void clearManagerLinksForSubordinates(Long id);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Notification n WHERE n.user.id = :id")
    void deleteNotificationsByUserId(Long id);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query(value = "DELETE FROM recent_dossiers WHERE user_id = :id", nativeQuery = true)
    void deleteRecentDossiersByUserId(Long id);
}
