package com.bna.defense.service;

import com.bna.defense.entity.Role;
import com.bna.defense.entity.User;
import com.bna.defense.repository.RoleRepository;
import com.bna.defense.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void updateUserRoles(User user, Set<Role.RoleType> roleTypes) {
        Set<Role> roles = new HashSet<>();
        if (roleTypes == null || roleTypes.isEmpty()) {
            Role userRole = roleRepository.findByName(Role.RoleType.ROLE_CHARGE_DOSSIER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
        } else {
            roleTypes.forEach(roleType -> {
                Role role = roleRepository.findByName(roleType)
                        .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                roles.add(role);
            });
        }
        user.setRoles(roles);
    }

    public User createUser(User user, Set<Role.RoleType> roleTypes) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        Set<Role> roles = new HashSet<>();

        if (roleTypes == null || roleTypes.isEmpty()) {
            Role userRole = roleRepository.findByName(Role.RoleType.ROLE_CHARGE_DOSSIER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
        } else {
            roleTypes.forEach(roleType -> {
                Role role = roleRepository.findByName(roleType)
                        .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                roles.add(role);
            });
        }

        user.setRoles(roles);
        return userRepository.save(user);
    }

    public String generateResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec cet e-mail."));
        
        // Generate 6-digit OTP
        String token = String.format("%06d", new Random().nextInt(999999));
        user.setResetToken(token);
        user.setTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);
        return token;
    }

    public String verifyResetToken(String email, String token) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || user.getResetToken() == null) return null;
        
        // 6-digit OTP verification
        if (user.getResetToken().equals(token) && user.getTokenExpiry().isAfter(LocalDateTime.now())) {
            // Once OTP is verified, replace it with a secure UUID for the next step (Point 13 Step 2)
            String uuidToken = java.util.UUID.randomUUID().toString();
            user.setResetToken(uuidToken);
            user.setTokenExpiry(LocalDateTime.now().plusMinutes(10)); // UUID valid for 10 mins
            userRepository.save(user);
            return uuidToken;
        }
        return null;
    }


    public void updatePassword(String email, String resetToken, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé."));
        
        if (user.getResetToken() == null || !user.getResetToken().equals(resetToken)) {
            throw new RuntimeException("Jeton de réinitialisation invalide.");
        }
        if (user.getTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Lien de réinitialisation expiré.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setTokenExpiry(null);
        userRepository.save(user);
    }


    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
