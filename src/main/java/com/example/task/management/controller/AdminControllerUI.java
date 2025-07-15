package com.example.task.management.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AdminControllerUI {
    @GetMapping({"/admin","/admin.html"})
    public String adminPage() {
        return "admin";
    }
} 