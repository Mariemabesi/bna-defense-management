package com.bna.defense.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendResetToken(String to, String token) {
        System.out.println("OTP FOR TESTING: " + token + " SENT TO " + to);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("no-reply@bna.tn");
        message.setTo(to);
        message.setSubject("Réinitialisation de votre mot de passe - BNA LegalOps");
        message.setText("Votre code de vérification pour la réinitialisation de votre mot de passe est : " + token + 
                        "\n\nCe code expirera dans 15 minutes.");
        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Note: SMTP failed (normal for dev): " + e.getMessage());
        }
    }
}
