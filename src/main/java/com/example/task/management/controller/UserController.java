package com.example.task.management.controller;

import com.example.task.management.model.User;
import com.example.task.management.repository.UserRepository;
import com.example.task.management.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
public class UserController {
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/profile")
    public User getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return userService.getUserByUsername(userDetails.getUsername()).orElseThrow();
    }

    @PutMapping("/profile")
    public User updateProfile(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Map<String, String> body) {
        User user = userService.getUserByUsername(userDetails.getUsername()).orElseThrow();
        String email = body.getOrDefault("email", user.getEmail());
        String fullName = body.getOrDefault("fullName", user.getFullName());
        return userService.updateUser(user.getId(), email, fullName);
    }

    @GetMapping("/users")
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
            .map(u -> new UserDTO(u.getId(), u.getUsername(), u.getFullName()))
            .collect(Collectors.toList());
    }

    public static class UserDTO {
        public Long id;
        public String username;
        public String fullName;
        public UserDTO(Long id, String username, String fullName) {
            this.id = id;
            this.username = username;
            this.fullName = fullName;
        }
    }
} 