package com.bna.defense.controller;

import com.bna.defense.entity.User;
import com.bna.defense.entity.Role;
import com.bna.defense.entity.Role.RoleType;
import com.bna.defense.entity.AuditLog;
import com.bna.defense.entity.Auxiliaire;
import com.bna.defense.service.UserService;
import com.bna.defense.service.AuditLogService;
import com.bna.defense.repository.UserRepository;
import com.bna.defense.controller.AuthController.SignupRequest;
import com.bna.defense.controller.AuthController.MessageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import jakarta.validation.Valid;

import java.util.List;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private UserRepository userRepository;

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
        
        // 1. Cleanup subordinates: Users who report to this manager
        userRepository.clearManagerLinksForSubordinates(id);

        // 2. Perform final deletion
        userRepository.delete(user);
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
        return ResponseEntity.ok(new MessageResponse("Utilisateur enregistré avec succès !"));
    }

    public static record UserDTO(Long id, String username, String email, boolean enabled, List<String> roles, String managerUsername, Long managerId) {
    }
}
