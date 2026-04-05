package com.bna.defense.controller;

import com.bna.defense.entity.User;
import com.bna.defense.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
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



    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserDTO> dtos = users.stream().map(user -> new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.isEnabled(),
                user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList()),
                user.getManager() != null ? user.getManager().getUsername() : null,
                user.getManager() != null ? user.getManager().getId() : null))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody java.util.Map<String, Object> updates) {
        User user = userRepository.findById(id).orElseThrow();
        
        if (updates.containsKey("role")) {
            List<String> strRoles = (List<String>) updates.get("role");
            java.util.Set<com.bna.defense.entity.Role.RoleType> roleTypes = strRoles.stream()
                .map(com.bna.defense.entity.Role.RoleType::valueOf)
                .collect(Collectors.toSet());
            userService.updateUserRoles(user, roleTypes);
        }

        if (updates.containsKey("managerId")) {
            Object managerIdObj = updates.get("managerId");
            if (managerIdObj == null) {
                user.setManager(null);
            } else {
                Long managerId = Long.valueOf(managerIdObj.toString());
                User manager = userRepository.findById(managerId).orElse(null);
                user.setManager(manager);
            }
        }

        userRepository.save(user);
        return ResponseEntity.ok(new AuthController.MessageResponse("Utilisateur mis à jour avec succès !"));
    }

    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<User> toggleStatus(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow();
        user.setEnabled(!user.isEnabled());
        return ResponseEntity.ok(userRepository.save(user));
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow();
        
        // 1. Safety Check: If user has history (Dossiers), we block the delete to preserve audit trail
        // Instead of hard delete, those users should be "Suspended"
        long dossierCount = userRepository.countDossiersByUserId(id);
        if (dossierCount > 0) {
            return ResponseEntity.status(409).body(new AuthController.MessageResponse(
                "Impossible de supprimer cet utilisateur car il est lié à " + dossierCount + " dossiers. Veuillez plutôt suspendre son compte."
            ));
        }

        // 2. Cleanup subordinates: Users who report to this manager
        userRepository.clearManagerLinksForSubordinates(id);

        // 3. Cleanup ephemeral data
        userRepository.deleteNotificationsByUserId(id);
        userRepository.deleteRecentDossiersByUserId(id);

        // 4. Perform final deletion
        userRepository.delete(user);
        return ResponseEntity.ok(new AuthController.MessageResponse("Utilisateur supprimé avec succès !"));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<com.bna.defense.entity.AuditLog>> getAllLogs() {
        return ResponseEntity.ok(auditLogService.getRecentLogs()); 
    }

    @PostMapping("/users")
    public ResponseEntity<?> register(@jakarta.validation.Valid @RequestBody com.bna.defense.controller.AuthController.SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body(new com.bna.defense.controller.AuthController.MessageResponse("Erreur : Ce nom d'utilisateur est déjà pris !"));
        }
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(new com.bna.defense.controller.AuthController.MessageResponse("Erreur : Cet e-mail est déjà utilisé !"));
        }

        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(signUpRequest.getPassword());
        user.setEnabled(true);
        user.setFullName(signUpRequest.getFullName() != null ? signUpRequest.getFullName() : signUpRequest.getUsername());
        
        java.util.Set<com.bna.defense.entity.Role.RoleType> strRoles = signUpRequest.getRole() != null
                ? signUpRequest.getRole().stream().map(r -> {
                    try { return com.bna.defense.entity.Role.RoleType.valueOf(r); }
                    catch (Exception e) { return com.bna.defense.entity.Role.RoleType.ROLE_CHARGE_DOSSIER; }
                }).collect(Collectors.toSet())
                : new java.util.HashSet<>();

        if (signUpRequest.getAuxiliaireId() != null) {
             com.bna.defense.entity.Auxiliaire aux = new com.bna.defense.entity.Auxiliaire();
             aux.setId(signUpRequest.getAuxiliaireId());
             user.setLinkedAuxiliaire(aux);
        }

        if (signUpRequest.getManagerId() != null) {
            User manager = userRepository.findById(signUpRequest.getManagerId()).orElse(null);
            user.setManager(manager);
        }

        userService.createUser(user, strRoles);
        return ResponseEntity.ok(new com.bna.defense.controller.AuthController.MessageResponse("Utilisateur enregistré avec succès !"));
    }

    public static record UserDTO(Long id, String username, String email, boolean enabled, List<String> roles, String managerUsername, Long managerId) {
    }
}
