package com.bna.defense.service;

import com.bna.defense.entity.Role;
import com.bna.defense.entity.User;
import com.bna.defense.repository.RoleRepository;
import com.bna.defense.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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

    public java.util.List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
