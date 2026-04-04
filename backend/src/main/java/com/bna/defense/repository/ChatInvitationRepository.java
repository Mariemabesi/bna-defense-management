package com.bna.defense.repository;

import com.bna.defense.entity.ChatInvitation;
import com.bna.defense.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatInvitationRepository extends JpaRepository<ChatInvitation, Long> {
    
    List<ChatInvitation> findByReceiverAndStatus(User receiver, ChatInvitation.InvitationStatus status);
    
    List<ChatInvitation> findBySenderAndStatus(User sender, ChatInvitation.InvitationStatus status);

    @Query("SELECT ci FROM ChatInvitation ci WHERE ((ci.sender = :user1 AND ci.receiver = :user2) OR (ci.sender = :user2 AND ci.receiver = :user1)) AND ci.status = 'ACCEPTED'")
    Optional<ChatInvitation> findAcceptedFriendship(@Param("user1") User user1, @Param("user2") User user2);

    @Query("SELECT CASE WHEN count(ci) > 0 THEN true ELSE false END FROM ChatInvitation ci WHERE ((ci.sender = :user1 AND ci.receiver = :user2) OR (ci.sender = :user2 AND ci.receiver = :user1)) AND ci.status = 'PENDING'")
    boolean isInvitationPending(@Param("user1") User user1, @Param("user2") User user2);

    @Query("SELECT ci FROM ChatInvitation ci WHERE (ci.sender = :user OR ci.receiver = :user) AND ci.status = 'ACCEPTED'")
    List<ChatInvitation> findAllFriends(@Param("user") User user);
}
