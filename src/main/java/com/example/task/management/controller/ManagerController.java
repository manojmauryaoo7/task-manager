package com.example.task.management.controller;

import com.example.task.management.model.User;
import com.example.task.management.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/manager")
public class ManagerController {
    @Autowired
    private UserService userService;

    @GetMapping("/users")
    public List<User> getAllUsers() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("[DEBUG] ManagerController - Authenticated user: " + auth.getName());
        System.out.println("[DEBUG] ManagerController - User roles: " + auth.getAuthorities());
        return userService.getAllUsers();
    }

    @PostMapping("/users")
    public User createUser(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        String email = body.getOrDefault("email", "");
        String fullName = body.getOrDefault("fullName", "");
        Set<String> roles = Set.of("ROLE_USER");
        return userService.createUser(username, password, email, fullName, roles);
    }

    @PutMapping("/users/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "");
        String fullName = body.getOrDefault("fullName", "");
        return userService.updateUser(id, email, fullName);
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    @GetMapping("/test")
    public String testManager() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return "User: " + auth.getName() + ", Roles: " + auth.getAuthorities();
    }
} 