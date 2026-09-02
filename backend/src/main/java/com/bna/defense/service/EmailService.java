package com.bna.defense.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendResetToken(String to, String token) {
        System.out.println("OTP FOR TESTING: " + token + " SENT TO " + to);
        SimpleMailMessage message = new SimpleMailMessage();
        
        // If fromEmail is a Mailtrap username (alphanumeric), use a default domain email as Sender
        String senderEmail = (fromEmail != null && fromEmail.contains("@")) ? fromEmail : "no-reply@bna.tn";
        message.setFrom(senderEmail);
        message.setTo(to);
        message.setSubject("Réinitialisation de votre mot de passe - BNA LegalOps");
        message.setText(
            "Bonjour,\n\n" +
            "Votre code de vérification pour la réinitialisation de votre mot de passe est :\n\n" +
            "    " + token + "\n\n" +
            "Ce code expirera dans 15 minutes.\n\n" +
            "Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.\n\n" +
            "Cordialement,\nL'équipe BNA LegalOps"
        );
        try {
            mailSender.send(message);
            System.out.println("Email OTP envoyé avec succès à : " + to);
        } catch (Exception e) {
            System.err.println("Erreur envoi email SMTP: " + e.getMessage());
        }
    }
}
