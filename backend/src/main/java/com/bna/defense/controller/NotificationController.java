package com.bna.defense.controller;

import com.bna.defense.entity.Notification;
import com.bna.defense.entity.User;
import com.bna.defense.repository.UserRepository;
import com.bna.defense.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Notification> getMyNotifications(Principal principal) {
        if (principal == null) {
            return Collections.emptyList();
        }
        User user = userRepository.findByUsername(principal.getName()).orElse(null);
        if (user == null) {
            return Collections.emptyList();
        }
        return notificationService.getForUser(user);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Principal principal) {
        Map<String, Long> resp = new HashMap<>();
        if (principal == null) {
            resp.put("count", 0L);
            return ResponseEntity.ok(resp);
        }
        
        User user = userRepository.findByUsername(principal.getName()).orElse(null);
        if (user == null) {
            resp.put("count", 0L);
            return ResponseEntity.ok(resp);
        }
        
        long count = notificationService.countUnread(user);
        resp.put("count", count);
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Principal principal) {
        if (principal == null) {
            return ResponseEntity.badRequest().build();
        }
        User user = userRepository.findByUsername(principal.getName()).orElse(null);
        if (user != null) {
            notificationService.markAllAsRead(user);
        }
        return ResponseEntity.ok().build();
    }
}
