package com.bna.defense.service;

import com.bna.defense.entity.Dossier;
import com.bna.defense.entity.Notification;
import com.bna.defense.entity.User;
import com.bna.defense.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Transactional
    public Notification create(User recipient, String message, String type, Dossier dossier) {
        Notification n = new Notification(recipient, message, type, dossier);
        return notificationRepository.save(n);
    }

    public List<Notification> getForUser(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public long countUnread(User user) {
        return notificationRepository.countUnreadByUser(user);
    }

    @Transactional
    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unread = notificationRepository.findByUserAndReadFalse(user);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    /**
     * Notify the pré-validateur of a dépassement on a dossier
     */
    @Transactional
    public void notifyDepassement(User preValidateur, Dossier dossier, java.math.BigDecimal depassement) {
        String msg = String.format(
            "⚠️ Dépassement détecté sur le dossier %s : +%.2f TND au-delà du budget initial de %.2f TND.",
            dossier.getReference(),
            depassement,
            dossier.getFraisInitial()
        );
        create(preValidateur, msg, "DEPASSEMENT", dossier);
    }

    /**
     * Notify pré-validateur that a new dossier has been submitted and awaits review
     */
    @Transactional
    public void notifySubmitted(User preValidateur, Dossier dossier, String chargeUsername) {
        String msg = String.format(
            "📝 Nouveau dossier %s créé par %s. Il attend votre pré-validation.",
            dossier.getReference(),
            chargeUsername
        );
        create(preValidateur, msg, "PRE_VALIDATION_REQUIRED", dossier);
    }

    /**
     * Notify validateur that a dossier has been pre-validated and awaits final validation
     */
    @Transactional
    public void notifyPreValidated(User validateur, Dossier dossier, String preValUsername) {
        String msg = String.format(
            "✅ Le dossier %s a été pré-validé par %s. Il attend votre validation finale.",
            dossier.getReference(),
            preValUsername
        );
        create(validateur, msg, "VALIDATION_REQUIRED", dossier);
    }

    /**
     * Notify chargé de dossier that their dossier was refused
     */
    @Transactional
    public void notifyRefus(User charge, Dossier dossier, String motif, String refuseurUsername) {
        String msg = String.format(
            "❌ Le dossier %s a été refusé par %s. Motif : %s",
            dossier.getReference(),
            refuseurUsername,
            motif
        );
        create(charge, msg, "REFUS", dossier);
    }
}
