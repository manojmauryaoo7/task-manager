package com.example.task.management.controller;

import com.example.task.management.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody Map<String, Object> body) {
        String username = (String) body.get("username");
        String password = (String) body.get("password");
        String email = body.getOrDefault("email", "").toString();
        String fullName = body.getOrDefault("fullName", "").toString();
        // Accept either 'role' (string) or 'roles' (array of strings)
        java.util.Set<String> roles = new java.util.HashSet<>();
        if (body.containsKey("roles")) {
            Object rolesObj = body.get("roles");
            if (rolesObj instanceof java.util.List<?>) {
                for (Object r : (java.util.List<?>) rolesObj) {
                    if (r != null) roles.add(r.toString());
                }
            }
        } else if (body.containsKey("role")) {
            roles.add(body.get("role").toString());
        } else {
            roles.add("ROLE_USER");
        }
        return authService.register(username, password, email, fullName, roles);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        System.out.println("[DEBUG] AuthController.login called with: " + body);
        String username = body.get("username");
        String password = body.get("password");
        return authService.login(username, password);
    }
} 