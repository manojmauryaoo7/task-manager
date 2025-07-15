package com.example.task.management.service;

import com.example.task.management.model.User;
import com.example.task.management.model.Role;
import com.example.task.management.repository.UserRepository;
import com.example.task.management.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User createUser(String username, String password, String email, String fullName, Set<String> roleNames) {
        Set<Role> roles = roleRepository.findAll().stream()
            .filter(r -> roleNames.contains(r.getName()))
            .collect(java.util.stream.Collectors.toSet());
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setFullName(fullName);
        user.setRoles(roles);
        return userRepository.save(user);
    }

    public User updateUser(Long id, String email, String fullName) {
        User user = userRepository.findById(id).orElseThrow();
        user.setEmail(email);
        user.setFullName(fullName);
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public User updateUserRoles(Long id, Set<String> roleNames) {
        User user = userRepository.findById(id).orElseThrow();
        Set<Role> roles = roleRepository.findAll().stream()
            .filter(r -> roleNames.contains(r.getName()))
            .collect(java.util.stream.Collectors.toSet());
        user.setRoles(roles);
        return userRepository.save(user);
    }
} 