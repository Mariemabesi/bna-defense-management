package com.bna.defense.controller;

import com.bna.defense.dto.auth.SignupRequest;
import com.bna.defense.dto.auth.MessageResponse;
import com.bna.defense.entity.User;
import com.bna.defense.entity.Role.RoleType;
import com.bna.defense.entity.AuditLog;
import com.bna.defense.entity.Auxiliaire;
import com.bna.defense.service.UserService;
import com.bna.defense.service.AuditLogService;
import com.bna.defense.repository.UserRepository;
import com.bna.defense.repository.DossierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;
    private final AuditLogService auditLogService;
    private final UserRepository userRepository;
    private final DossierRepository dossierRepository;

    public UserController(UserService userService,
                          AuditLogService auditLogService,
                          UserRepository userRepository,
                          DossierRepository dossierRepository) {
        this.userService = userService;
        this.auditLogService = auditLogService;
        this.userRepository = userRepository;
        this.dossierRepository = dossierRepository;
    }

    @GetMapping("/users")
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> new UserDTO(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.isEnabled(),
                        user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList()),
                        user.getManager() != null ? user.getManager().getUsername() : null,
                        user.getManager() != null ? user.getManager().getId() : null
                )).collect(Collectors.toList());
    }

    @DeleteMapping("/users/{id}")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow();
        
        if ("admin".equals(user.getUsername())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Action impossible : le compte administrateur principal système est protégé."));
        }
        
        userRepository.clearManagerLinksForSubordinates(id);
        dossierRepository.clearUserLinksForAssignedCharge(id);
        dossierRepository.clearUserLinksForGroupValidateur(id);

        userRepository.delete(user);
        String adminUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        auditLogService.log(adminUsername, "SUPPRESSION_UTILISATEUR", "User", id,
                "Suppression de l'utilisateur : " + user.getUsername());
        return ResponseEntity.ok(new MessageResponse("Utilisateur supprimé avec succès"));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<AuditLog>> getLogs() {
        return ResponseEntity.ok(auditLogService.getRecentLogs());
    }

    @PostMapping("/users")
    public ResponseEntity<?> register(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Erreur : Ce nom d'utilisateur est déjà pris !"));
        }
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Erreur : Cet e-mail est déjà utilisé !"));
        }

        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(signUpRequest.getPassword());
        user.setEnabled(true);
        user.setFullName(signUpRequest.getFullName() != null ? signUpRequest.getFullName() : signUpRequest.getUsername());
        
        Set<RoleType> strRoles = signUpRequest.getRole() != null
                ? signUpRequest.getRole().stream().map(r -> {
                    try { return RoleType.valueOf(r); }
                    catch (Exception e) { return RoleType.ROLE_CHARGE_DOSSIER; }
                }).collect(Collectors.toSet())
                : new HashSet<>();

        if (signUpRequest.getAuxiliaireId() != null) {
             Auxiliaire aux = new Auxiliaire();
             aux.setId(signUpRequest.getAuxiliaireId());
             user.setLinkedAuxiliaire(aux);
        }

        if (signUpRequest.getManagerId() != null) {
            User manager = userRepository.findById(signUpRequest.getManagerId()).orElse(null);
            user.setManager(manager);
        }

        userService.createUser(user, strRoles);
        String adminUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        auditLogService.log(adminUsername, "CREATION_UTILISATEUR", "User", user.getId(),
                "Création de l'utilisateur : " + user.getUsername() + " (Rôles: " + strRoles + ")");
        return ResponseEntity.ok(new MessageResponse("Utilisateur enregistré avec succès !"));
    }

    @PutMapping("/users/{id}/toggle-status")
    @Transactional
    public ResponseEntity<?> toggleStatus(@PathVariable Long id) {
        try {
            User user = userRepository.findById(id).orElseThrow();
            if ("admin".equals(user.getUsername())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Action impossible : le compte administrateur principal système est protégé."));
            }
            user.setEnabled(!user.isEnabled());
            userRepository.save(user); // FIX: persist the status change to the database
            String action = user.isEnabled() ? "activé" : "suspendu";
            String adminUsername = SecurityContextHolder.getContext().getAuthentication().getName();
            auditLogService.log(adminUsername, "STATUT_UTILISATEUR", "User", id,
                    "Compte de l'utilisateur " + user.getUsername() + " " + action);
            return ResponseEntity.ok(new MessageResponse("Compte utilisateur " + action + " avec succès."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new MessageResponse("Erreur backend: " + e.getMessage()));
        }
    }

    @PutMapping("/users/{id}")
    @Transactional
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest updateRequest) {
        try {
            User user = userRepository.findById(id).orElseThrow();
            
            if ("admin".equals(user.getUsername())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Action impossible : le compte administrateur principal système est protégé."));
            }
            
            if (updateRequest.getManagerId() != null && updateRequest.getManagerId().equals(id)) {
                return ResponseEntity.badRequest().body(new MessageResponse("Un utilisateur ne peut pas être son propre responsable"));
            }

            if (updateRequest.getRole() != null && !updateRequest.getRole().isEmpty()) {
                Set<RoleType> roleTypes = updateRequest.getRole().stream()
                    .map(r -> {
                        try { return RoleType.valueOf(r); }
                        catch (Exception e) { return RoleType.ROLE_CHARGE_DOSSIER; }
                    }).collect(Collectors.toSet());
                userService.updateUserRoles(user, roleTypes);
            }

            if (updateRequest.getManagerId() != null) {
                User manager = userRepository.findById(updateRequest.getManagerId()).orElse(null);
                if (manager != null) {
                    user.setManager(manager);
                }
            } else {
                user.setManager(null);
            }
            
            String adminUsername = SecurityContextHolder.getContext().getAuthentication().getName();
            auditLogService.log(adminUsername, "MODIFICATION_UTILISATEUR", "User", id,
                    "Mise à jour de l'utilisateur : " + user.getUsername());
            return ResponseEntity.ok(new MessageResponse("Utilisateur mis à jour avec succès"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new MessageResponse("Erreur backend: " + e.getMessage()));
        }
    }

    public static class UpdateUserRequest {
        private List<String> role;
        private Long managerId;
        public UpdateUserRequest() {}
        public List<String> getRole() { return role; }
        public void setRole(List<String> role) { this.role = role; }
        public Long getManagerId() { return managerId; }
        public void setManagerId(Long managerId) { this.managerId = managerId; }
    }

    public static record UserDTO(Long id, String username, String email, boolean enabled, List<String> roles, String managerUsername, Long managerId) {
    }
}
