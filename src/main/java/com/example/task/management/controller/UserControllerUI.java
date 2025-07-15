package com.example.task.management.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class UserControllerUI {
    @GetMapping({"/", "/home","/home.html"})
    public String homePage() {
        return "home";
    }
    

    @GetMapping({"/profile","/profile.html"})
    public String profilePage() {
        return "profile";
    }
} 