package com.bna.defense.controller;

import com.bna.defense.entity.ChatInvitation;
import com.bna.defense.entity.ChatMessage;
import com.bna.defense.entity.User;
import com.bna.defense.repository.ChatInvitationRepository;
import com.bna.defense.repository.ChatMessageRepository;
import com.bna.defense.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChatInvitationRepository chatInvitationRepository;

    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User sender = userRepository.findByUsername(username).orElseThrow();
        
        Long receiverId = Long.valueOf(request.get("receiverId").toString());
        User receiver = userRepository.findById(receiverId).orElseThrow();
        
        String content = request.get("content").toString();
        
        ChatMessage message = new ChatMessage();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content);
        
        chatMessageRepository.save(message);
        return ResponseEntity.ok(Map.of("message", "Message envoyé"));
    }

    @GetMapping("/history/{targetId}")
    public ResponseEntity<?> getHistory(@PathVariable Long targetId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username).orElseThrow();
        User targetUser = userRepository.findById(targetId).orElseThrow();
        
        List<ChatMessage> history = chatMessageRepository.findChatHistory(currentUser, targetUser);
        
        // Mark as read
        history.stream().filter(m -> m.getReceiver().getId().equals(currentUser.getId())).forEach(m -> {
            m.setRead(true);
            chatMessageRepository.save(m);
        });

        return ResponseEntity.ok(history.stream().map(m -> Map.of(
            "senderId", m.getSender().getId(),
            "senderName", m.getSender().getFullName() != null ? m.getSender().getFullName() : m.getSender().getUsername(),
            "content", m.getContent(),
            "timestamp", m.getTimestamp(),
            "isRead", m.isRead()
        )).collect(Collectors.toList()));
    }

    @GetMapping("/partners")
    public ResponseEntity<?> getPartners() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username).orElseThrow();
        
        // Partners from chat history
        List<ChatMessage> messages = chatMessageRepository.findParticipatedMessages(currentUser);
        Set<User> partners = messages.stream()
            .map(m -> m.getSender().getId().equals(currentUser.getId()) ? m.getReceiver() : m.getSender())
            .collect(Collectors.toSet());
            
        // Partners from accepted invitations (friends)
        List<ChatInvitation> friendInvitations = chatInvitationRepository.findAllFriends(currentUser);
        friendInvitations.forEach(ci -> {
            partners.add(ci.getSender().getId().equals(currentUser.getId()) ? ci.getReceiver() : ci.getSender());
        });
        
        return ResponseEntity.ok(partners.stream().map(u -> {
            String role = u.getRoles().stream()
                .map(r -> r.getName().name().replace("ROLE_", ""))
                .findFirst()
                .orElse("UTILISATEUR");
            return Map.of(
                "id", u.getId(),
                "username", u.getUsername(),
                "fullName", u.getFullName() != null && !u.getFullName().isEmpty() ? u.getFullName() : u.getUsername(),
                "role", role,
                "avatarUrl", u.getAvatarUrl() != null ? u.getAvatarUrl() : ""
            );
        }).collect(Collectors.toList()));
    }

    @GetMapping("/invitations/pending")
    public ResponseEntity<?> getPendingInvitations() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username).orElseThrow();
        List<ChatInvitation> invitations = chatInvitationRepository.findByReceiverAndStatus(currentUser, ChatInvitation.InvitationStatus.PENDING);
        return ResponseEntity.ok(invitations.stream().map(ci -> Map.of(
            "id", ci.getId(),
            "senderId", ci.getSender().getId(),
            "senderName", ci.getSender().getFullName() != null ? ci.getSender().getFullName() : ci.getSender().getUsername(),
            "role", ci.getSender().getRoles().stream().findFirst().map(r -> r.getName().name().replace("ROLE_", "")).orElse("USER")
        )).collect(Collectors.toList()));
    }

    @PostMapping("/invitations/send/{targetId}")
    public ResponseEntity<?> sendInvitation(@PathVariable Long targetId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User sender = userRepository.findByUsername(username).orElseThrow();
        User receiver = userRepository.findById(targetId).orElseThrow();

        if (chatInvitationRepository.isInvitationPending(sender, receiver)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invitation déjà en attente"));
        }
        
        ChatInvitation ci = new ChatInvitation();
        ci.setSender(sender);
        ci.setReceiver(receiver);
        ci.setStatus(ChatInvitation.InvitationStatus.PENDING);
        chatInvitationRepository.save(ci);
        return ResponseEntity.ok(Map.of("message", "Invitation envoyée"));
    }

    @PostMapping("/invitations/accept/{id}")
    public ResponseEntity<?> acceptInvitation(@PathVariable Long id) {
        ChatInvitation ci = chatInvitationRepository.findById(id).orElseThrow();
        ci.setStatus(ChatInvitation.InvitationStatus.ACCEPTED);
        chatInvitationRepository.save(ci);
        return ResponseEntity.ok(Map.of("message", "Invitation acceptée"));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username).orElseThrow();
        
        long count = chatMessageRepository.findAll().stream()
            .filter(m -> m.getReceiver().getId().equals(currentUser.getId()))
            .filter(m -> !m.isRead())
            .count();
        
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PostMapping("/mark-as-read/{partnerId}")
    public ResponseEntity<?> markAsRead(@PathVariable Long partnerId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username).orElseThrow();
        
        List<ChatMessage> unread = chatMessageRepository.findAll().stream()
            .filter(m -> m.getReceiver().getId().equals(currentUser.getId()))
            .filter(m -> m.getSender().getId().equals(partnerId))
            .filter(m -> !m.isRead())
            .collect(Collectors.toList());
            
        unread.forEach(m -> m.setRead(true));
        chatMessageRepository.saveAll(unread);
        
        return ResponseEntity.ok(Map.of("message", "Messages marqués comme lus"));
    }

    @PostMapping("/invitations/reject/{id}")
    public ResponseEntity<?> rejectInvitation(@PathVariable Long id) {
        ChatInvitation ci = chatInvitationRepository.findById(id).orElseThrow();
        ci.setStatus(ChatInvitation.InvitationStatus.REJECTED);
        chatInvitationRepository.save(ci);
        return ResponseEntity.ok(Map.of("message", "Invitation refusée"));
    }

    @GetMapping("/search-users")
    public ResponseEntity<?> searchUsers(@RequestParam String q) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username).orElseThrow();
        
        List<User> users = userRepository.findAll().stream()
            .filter(u -> !u.getUsername().equals(currentUser.getUsername()))
            .filter(u -> (u.getUsername() != null && u.getUsername().toLowerCase().contains(q.toLowerCase())) || 
                         (u.getEmail() != null && u.getEmail().toLowerCase().contains(q.toLowerCase())) ||
                         (u.getFullName() != null && u.getFullName().toLowerCase().contains(q.toLowerCase())))
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(users.stream().map(u -> Map.of(
            "id", u.getId(),
            "username", u.getUsername(),
            "email", u.getEmail() != null ? u.getEmail() : "",
            "fullName", u.getFullName() != null && !u.getFullName().isEmpty() ? u.getFullName() : u.getUsername(),
            "role", u.getRoles().stream().findFirst().map(r -> r.getName().name().replace("ROLE_", "")).orElse("USER")
        )).collect(Collectors.toList()));
    }

    @GetMapping("/suggested-contacts")
    public ResponseEntity<?> getSuggestedContacts() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username).orElseThrow();
        
        List<Map<String, Object>> suggestions = new ArrayList<>();
        
        // Suggest Validator if user is in a group
        if (currentUser.getGroupe() != null && currentUser.getGroupe().getValidateur() != null) {
            User v = currentUser.getGroupe().getValidateur();
            suggestions.add(Map.of("id", v.getId(), "fullName", "Mon Validateur (" + v.getFullName() + ")", "role", "VALIDATEUR"));
        }
        
        // Suggest SuperValidators for Validators
        if (currentUser.getRoles().stream().anyMatch(r -> r.getName().name().equals("ROLE_VALIDATEUR"))) {
            userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().name().equals("ROLE_SUPER_VALIDATEUR")))
                .forEach(sv -> suggestions.add(Map.of("id", sv.getId(), "fullName", "Super Validateur (" + sv.getFullName() + ")", "role", "SUPER_VALIDATEUR")));
        }

        // Always suggest an ADMIN as "Support Technique" if current user is not Admin
        if (currentUser.getRoles().stream().noneMatch(r -> r.getName().name().equals("ROLE_ADMIN"))) {
            userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().name().equals("ROLE_ADMIN")))
                .findFirst()
                .ifPresent(admin -> suggestions.add(Map.of(
                    "id", admin.getId(), 
                    "fullName", "Support Technique BNA", 
                    "role", "ADMIN",
                    "isSupport", true
                )));
        }

        return ResponseEntity.ok(suggestions);
    }
}
