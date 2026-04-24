package com.bna.defense.controller;

import com.bna.defense.dto.auth.*;
import com.bna.defense.entity.Auxiliaire;
import com.bna.defense.entity.Role.RoleType;
import com.bna.defense.entity.User;
import com.bna.defense.repository.GroupeRepository;
import com.bna.defense.repository.UserRepository;
import com.bna.defense.security.JwtUtils;
import com.bna.defense.security.UserDetailsImpl;
import com.bna.defense.service.EmailService;
import com.bna.defense.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final GroupeRepository groupeRepository;
    private final UserService userService;
    private final EmailService emailService;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtUtils jwtUtils,
                          UserRepository userRepository,
                          GroupeRepository groupeRepository,
                          UserService userService,
                          EmailService emailService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
        this.groupeRepository = groupeRepository;
        this.userService = userService;
        this.emailService = emailService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
        String avatarUrl = user != null ? user.getAvatarUrl() : null;

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles,
                avatarUrl,
                userDetails.getGroupeId(),
                userDetails.isSuperValidateur()));
    }

    @PostMapping("/upload-avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file) {
        try {
            User user = getCurrentUser();
            
            String extension = "";
            String originalFileName = file.getOriginalFilename();
            if (originalFileName != null && originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            
            String fileName = UUID.randomUUID().toString() + extension;
            Path uploadPath = Paths.get("uploads/avatars");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            Path filePath = uploadPath.resolve(fileName);
            Files.write(filePath, file.getBytes());

            String avatarUrl = "/uploads/avatars/" + fileName;
            user.setAvatarUrl(avatarUrl);
            userRepository.save(user);

            return ResponseEntity.ok(new MessageResponse(avatarUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Erreur pendant l'upload : " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Erreur : Ce nom d'utilisateur est déjà pris !"));
        }
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Erreur : Cet e-mail est déjà utilisé !"));
        }

        try {
            User user = new User();
            user.setUsername(signUpRequest.getUsername());
            user.setEmail(signUpRequest.getEmail());
            user.setPassword(signUpRequest.getPassword());
            user.setFullName(signUpRequest.getFullName());
        
            if (signUpRequest.getManagerId() != null) {
                user.setManager(userRepository.findById(signUpRequest.getManagerId()).orElse(null));
            }

            if (signUpRequest.getGroupeId() != null) {
                user.setGroupe(groupeRepository.findById(signUpRequest.getGroupeId())
                        .orElseThrow(() -> new RuntimeException("Groupe non trouvé")));
            }

            if (signUpRequest.getFullName() != null) {
                String[] parts = signUpRequest.getFullName().split(" ", 2);
                user.setFirstName(parts[0]);
                if (parts.length > 1) { user.setLastName(parts[1]); }
            }

            Set<RoleType> roleTypes = signUpRequest.getRole() != null
                    ? signUpRequest.getRole().stream().map(r -> {
                        try { return RoleType.valueOf(r); }
                        catch (Exception e) { return RoleType.ROLE_CHARGE_DOSSIER; }
                    }).collect(Collectors.toSet())
                    : new HashSet<>();

            if (signUpRequest.getIsSuperValidateur() != null && signUpRequest.getIsSuperValidateur()) {
                roleTypes.add(RoleType.ROLE_SUPER_VALIDATEUR);
            }

            if (signUpRequest.getAuxiliaireId() != null) {
                Auxiliaire aux = new Auxiliaire();
                aux.setId(signUpRequest.getAuxiliaireId());
                user.setLinkedAuxiliaire(aux);
            }

            userService.createUser(user, roleTypes);
            return ResponseEntity.ok(new MessageResponse("Utilisateur enregistré avec succès !"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Erreur : " + e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        String token = userService.generateResetToken(request.getEmail());
        emailService.sendResetToken(request.getEmail(), token);
        return ResponseEntity.ok(new MessageResponse("Code OTP envoyé à votre adresse e-mail."));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        String resetToken = userService.verifyResetToken(request.getEmail(), request.getOtp());
        if (resetToken != null) {
            return ResponseEntity.ok(new TokenResponse(resetToken));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("OTP invalide ou expiré."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            userService.updatePassword(request.getEmail(), request.getResetToken(), request.getNewPassword());
            return ResponseEntity.ok(new MessageResponse("Mot de passe mis à jour avec succès."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            userService.changePassword(getCurrentUser(), request.getOldPassword(), request.getNewPassword());
            return ResponseEntity.ok(new MessageResponse("Le mot de passe a été changé avec succès."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Erreur : " + e.getMessage()));
        }
    }

    @PostMapping("/update-profile")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request) {
        try {
            userService.updateProfile(getCurrentUser(), request.getEmail(), request.getFirstName(), request.getLastName());
            return ResponseEntity.ok(new MessageResponse("Profil mis à jour avec succès."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Erreur : " + e.getMessage()));
        }
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Utilisateur non authentifié.");
        }
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé."));
    }
}
