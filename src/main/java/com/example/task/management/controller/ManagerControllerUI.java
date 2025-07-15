package com.example.task.management.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ManagerControllerUI {
    @GetMapping({"/manager","/manager.html"})
    public String managerPage() {
        return "manager";
    }
} 