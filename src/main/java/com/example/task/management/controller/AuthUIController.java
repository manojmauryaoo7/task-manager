package com.example.task.management.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AuthUIController {
    @GetMapping({"/login","/login.html"})
    public String loginPage() {
        return "login";
    }

    @GetMapping({"/register","/register.html"})
    public String registerPage() {
        return "register";
    }
} 