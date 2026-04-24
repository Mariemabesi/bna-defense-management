package com.bna.defense.service;

import com.bna.defense.entity.Role;
import com.bna.defense.entity.User;
import com.bna.defense.repository.RoleRepository;
import com.bna.defense.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
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
        user.getRoles().clear();
        user.getRoles().addAll(roles);
        userRepository.save(user);
    }

    @Transactional
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

    @Transactional
    public void updateProfile(User user, String email, String firstName, String lastName) {
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setFullName(firstName + " " + lastName);
        userRepository.save(user);
    }

    @Transactional
    public void changePassword(User user, String oldPassword, String newPassword) {
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("L'ancien mot de passe est incorrect.");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public String generateResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec cet e-mail."));
        
        String token = String.format("%06d", new Random().nextInt(999999));
        user.setResetToken(token);
        user.setTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);
        return token;
    }

    public String verifyResetToken(String email, String token) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || user.getResetToken() == null) return null;
        
        if (user.getResetToken().equals(token) && user.getTokenExpiry().isAfter(LocalDateTime.now())) {
            String uuidToken = UUID.randomUUID().toString();
            user.setResetToken(uuidToken);
            user.setTokenExpiry(LocalDateTime.now().plusMinutes(10));
            userRepository.save(user);
            return uuidToken;
        }
        return null;
    }

    @Transactional
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

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }
}
