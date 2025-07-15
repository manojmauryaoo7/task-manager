package com.example.task.management.controller;

import com.example.task.management.model.User;
import com.example.task.management.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    @Autowired
    private UserService userService;

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping("/users")
    public User createUser(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        String email = body.getOrDefault("email", "");
        String fullName = body.getOrDefault("fullName", "");
        Set<String> roles = Set.of(body.getOrDefault("role", "ROLE_USER"));
        return userService.createUser(username, password, email, fullName, roles);
    }

    @PutMapping("/users/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "");
        String fullName = body.getOrDefault("fullName", "");
        return userService.updateUser(id, email, fullName);
    }

    @PutMapping("/users/{id}/roles")
    public User updateUserRoles(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        Set<String> roles = ((List<String>) body.get("roles")).stream().collect(java.util.stream.Collectors.toSet());
        return userService.updateUserRoles(id, roles);
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }
} 