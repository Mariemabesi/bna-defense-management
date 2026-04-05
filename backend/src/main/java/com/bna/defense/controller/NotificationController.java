package com.bna.defense.controller;

import com.bna.defense.entity.Notification;
import com.bna.defense.entity.User;
import com.bna.defense.repository.UserRepository;
import com.bna.defense.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    @Autowired private NotificationService notificationService;
    @Autowired private UserRepository userRepository;

    @GetMapping
    public List<Notification> getMyNotifications(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        return notificationService.getForUser(user);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        long count = notificationService.countUnread(user);
        Map<String, Long> resp = new HashMap<>();
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
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public Notification saveNotification(@RequestBody Notification notification, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        notification.setUser(user);
        notification.setRead(false);
        return notificationService.save(notification);
    }
}
