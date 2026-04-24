package com.bna.defense.controller;

import com.bna.defense.security.JwtUtils;
import com.bna.defense.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import com.bna.defense.entity.User;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    com.bna.defense.repository.UserRepository userRepository;

    @Autowired
    com.bna.defense.repository.GroupeRepository groupeRepository;

    @Autowired
    com.bna.defense.service.UserService userService;

    @Autowired
    org.springframework.security.crypto.password.PasswordEncoder encoder;

    @Autowired
    com.bna.defense.service.EmailService emailService;

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
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(new MessageResponse("Pas authentifié"));
            }
            String username = authentication.getName();
            User user = userRepository.findByUsername(username).orElseThrow();

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
            com.bna.defense.entity.User user = new com.bna.defense.entity.User();
            user.setUsername(signUpRequest.getUsername());
            user.setEmail(signUpRequest.getEmail());
            user.setPassword(signUpRequest.getPassword());
            user.setFullName(signUpRequest.getFullName());
        
            Long managerId = signUpRequest.getManagerId();
            if (managerId != null) {
                user.setManager(userRepository.findById(managerId).orElse(null));
            }

            Long groupeId = signUpRequest.getGroupeId();
            if (groupeId != null) {
                user.setGroupe(groupeRepository.findById(groupeId).orElseThrow(() -> new RuntimeException("Groupe non trouvé")));
            }

            if (signUpRequest.getFullName() != null) {
                String[] parts = signUpRequest.getFullName().split(" ", 2);
                user.setFirstName(parts[0]);
                if (parts.length > 1) { user.setLastName(parts[1]); }
            }

            java.util.Set<com.bna.defense.entity.Role.RoleType> strRoles = signUpRequest.getRole() != null
                    ? signUpRequest.getRole().stream().map(r -> {
                        try { return com.bna.defense.entity.Role.RoleType.valueOf(r); }
                        catch (Exception e) { return com.bna.defense.entity.Role.RoleType.ROLE_CHARGE_DOSSIER; }
                    }).collect(Collectors.toSet())
                    : new java.util.HashSet<>();

            if (signUpRequest.getIsSuperValidateur() != null && signUpRequest.getIsSuperValidateur()) {
                strRoles.add(com.bna.defense.entity.Role.RoleType.ROLE_SUPER_VALIDATEUR);
            }

            if (signUpRequest.getAuxiliaireId() != null) {
                com.bna.defense.entity.Auxiliaire aux = new com.bna.defense.entity.Auxiliaire();
                aux.setId(signUpRequest.getAuxiliaireId());
                user.setLinkedAuxiliaire(aux);
            }

            userService.createUser(user, strRoles);
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
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        com.bna.defense.entity.User user = userRepository.findByUsername(username).orElseThrow();
        if (!encoder.matches(request.getOldPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Erreur : L'ancien mot de passe est incorrect."));
        }
        user.setPassword(encoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("Le mot de passe a été changé avec succès."));
    }

    @PostMapping("/update-profile")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        com.bna.defense.entity.User user = userRepository.findByUsername(username).orElseThrow();
        
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setFullName(request.getFirstName() + " " + request.getLastName());
        
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("Profil mis à jour avec succès."));
    }

    public static class UpdateProfileRequest {
        private String email; private String firstName; private String lastName;
        public String getEmail() { return email; }
        public void setEmail(String e) { this.email = e; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String f) { this.firstName = f; }
        public String getLastName() { return lastName; }
        public void setLastName(String l) { this.lastName = l; }
    }

    public static class ChangePasswordRequest {
        private String oldPassword; private String newPassword;
        public String getOldPassword() { return oldPassword; }
        public void setOldPassword(String p) { this.oldPassword = p; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String p) { this.newPassword = p; }
    }

    public static class ForgotPasswordRequest {
        private String email;
        public String getEmail() { return email; }
        public void setEmail(String e) { this.email = e; }
    }

    public static class VerifyOtpRequest {
        private String email; private String otp;
        public String getEmail() { return email; }
        public void setEmail(String e) { this.email = e; }
        public String getOtp() { return otp; }
        public void setOtp(String o) { this.otp = o; }
    }

    public static class ResetPasswordRequest {
        private String email; private String resetToken; private String newPassword;
        public String getEmail() { return email; }
        public void setEmail(String e) { this.email = e; }
        public String getResetToken() { return resetToken; }
        public void setResetToken(String r) { this.resetToken = r; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String p) { this.newPassword = p; }
    }


    public static class LoginRequest {
        private String username; private String password;
        public LoginRequest() {}
        public String getUsername() { return username; }
        public void setUsername(String u) { this.username = u; }
        public String getPassword() { return password; }
        public void setPassword(String p) { this.password = p; }
    }

    public static class SignupRequest {
        private String username; private String email; private String password;
        private List<String> role; private String fullName; private Long groupeId;
        private Boolean isSuperValidateur = false;
        private Long auxiliaireId;
        public SignupRequest() {}
        public String getUsername() { return username; }
        public void setUsername(String u) { this.username = u; }
        public String getEmail() { return email; }
        public void setEmail(String e) { this.email = e; }
        public String getPassword() { return password; }
        public void setPassword(String p) { this.password = p; }
        public List<String> getRole() { return role; }
        public void setRole(List<String> r) { this.role = r; }
        public String getFullName() { return fullName; }
        public void setFullName(String f) { this.fullName = f; }
        public Long getGroupeId() { return groupeId; }
        public void setGroupeId(Long g) { this.groupeId = g; }
        public Boolean getIsSuperValidateur() { return isSuperValidateur; }
        public void setIsSuperValidateur(Boolean s) { this.isSuperValidateur = s; }
        public Long getAuxiliaireId() { return auxiliaireId; }
        public void setAuxiliaireId(Long a) { this.auxiliaireId = a; }
        private Long managerId;
        public Long getManagerId() { return managerId; }
        public void setManagerId(Long m) { this.managerId = m; }
    }

    public static class TokenResponse {
        private String token;
        public TokenResponse(String token) { this.token = token; }
        public String getToken() { return token; }
        public void setToken(String t) { this.token = t; }
    }

    public static class MessageResponse {
        private String message;
        public MessageResponse() {}
        public MessageResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class JwtResponse {
        private String token; private Long id; private String username; private String email; private List<String> roles;
        private Long groupeId; private boolean isSuperValidateur; private String avatarUrl;
        public JwtResponse(String t, Long i, String u, String e, List<String> r, String a, Long g, boolean s) {
            this.token = t; this.id = i; this.username = u; this.email = e; this.roles = r;
            this.avatarUrl = a; this.groupeId = g; this.isSuperValidateur = s;
        }
        public String getToken() { return token; }
        public Long getId() { return id; }
        public String getUsername() { return username; }
        public String getEmail() { return email; }
        public List<String> getRoles() { return roles; }
        public Long getGroupeId() { return groupeId; }
        public boolean isSuperValidateur() { return isSuperValidateur; }
        public String getAvatarUrl() { return avatarUrl; }
    }
}
