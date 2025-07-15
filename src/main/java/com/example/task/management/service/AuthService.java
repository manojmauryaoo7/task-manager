package com.example.task.management.service;

import com.example.task.management.model.User;
import com.example.task.management.repository.UserRepository;
import com.example.task.management.repository.RoleRepository;
import com.example.task.management.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;

    public Map<String, Object> register(String username, String password, String email, String fullName, Set<String> roles) {
        if (userRepository.findByUsername(username).isPresent()) {
            return Map.of("error", "Username already exists");
        }
        Set<com.example.task.management.model.Role> userRoles = roles.stream()
            .map(roleName -> roleRepository.findByName(roleName).orElseThrow())
            .collect(Collectors.toSet());
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setFullName(fullName);
        user.setRoles(userRoles);
        userRepository.save(user);
        String token = jwtUtil.generateToken(username, userRoles.stream().map(r -> r.getName()).collect(Collectors.toSet()));
        return Map.of("token", token, "roles", userRoles.stream().map(r -> r.getName()).collect(Collectors.toSet()));
    }

    private boolean checkPassword(String rawPassword, String hashedPassword) {
        return passwordEncoder.matches(rawPassword, hashedPassword);
    }

    public Map<String, Object> login(String username, String password) {
        try {
            User user = userRepository.findByUsername(username).orElseThrow();
            System.out.println("[DEBUG] Raw password: " + password);
            System.out.println("[DEBUG] Hashed password from DB: " + user.getPassword());
            boolean matches = checkPassword(password, user.getPassword());
            System.out.println("[DEBUG] passwordEncoder.matches result: " + matches);
            if (!matches) {
                return Map.of("error", "Invalid credentials");
            }
            System.out.println("[DEBUG] User roles: " + user.getRoles());
            Set<String> roles = user.getRoles().stream().map(r -> r.getName()).collect(Collectors.toSet());
            System.out.println("[DEBUG] Role names: " + roles);
            String token = jwtUtil.generateToken(username, roles);
            return Map.of("token", token, "role", roles);
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("error", "Invalid credentials", "exception", e.getMessage());
        }
    }

    public static void main(String[] args) {
        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        System.out.println(encoder.encode("testpass"));
    }
} 