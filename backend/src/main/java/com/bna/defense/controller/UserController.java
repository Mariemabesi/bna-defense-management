package com.bna.defense.controller;

import com.bna.defense.entity.User;
import com.bna.defense.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private com.bna.defense.service.AuditLogService auditLogService;

    @Autowired
    private com.bna.defense.repository.UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Autowired
    private com.bna.defense.repository.RoleRepository roleRepository;

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserDTO> dtos = users.stream().map(user -> new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.isEnabled(),
                user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList())))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<User> toggleStatus(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow();
        user.setEnabled(!user.isEnabled());
        return ResponseEntity.ok(userRepository.save(user));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<com.bna.defense.entity.AuditLog>> getAllLogs() {
        return ResponseEntity.ok(auditLogService.getRecentLogs()); 
    }

    @PostMapping("/users")
    public ResponseEntity<?> register(@RequestBody com.bna.defense.controller.AuthController.SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        user.setEnabled(true);
        
        java.util.Set<com.bna.defense.entity.Role> roles = new java.util.HashSet<>();
        signUpRequest.getRole().forEach(role -> {
            com.bna.defense.entity.Role adminRole = roleRepository.findByName(com.bna.defense.entity.Role.RoleType.valueOf(role))
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(adminRole);
        });
        user.setRoles(roles);
        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully!");
    }

    public static record UserDTO(Long id, String username, String email, boolean enabled, List<String> roles) {
    }
}
