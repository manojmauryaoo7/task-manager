package com.example.task.management.controller;

import com.example.task.management.model.Task;
import com.example.task.management.model.User;
import com.example.task.management.repository.RoleRepository;
import com.example.task.management.repository.TaskRepository;
import com.example.task.management.repository.UserRepository;
import com.example.task.management.service.TaskService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import org.springframework.security.core.GrantedAuthority;
import com.example.task.management.model.Role;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    @Autowired
    private TaskService taskService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private TaskRepository taskRepository;

    // Create Task
    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody Task task, @RequestParam String assignedTo, @RequestParam String assignedBy) {
        try {
            Task created = taskService.createTask(task, assignedTo, assignedBy);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get Task by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getTask(@PathVariable Long id) {
        Optional<Task> task = taskService.getTask(id);
        return task.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // List/Search/Filter/Sort Tasks
    @GetMapping
    public List<Task> getTasks(@RequestParam(required = false) String search,
                               @RequestParam(required = false) String sort,
                               @RequestParam(required = false) String filter,
                               @RequestParam(required = false) String board,
                               @RequestParam(required = false) String myUsername) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        String roles = auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).reduce((a, b) -> a + ", " + b).orElse("");
        System.out.println("[DEBUG] getTasks called by user: " + username + ", roles: " + roles + ", board: " + board + ", myUsername: " + myUsername);
        return taskService.getAllTasks(search, sort, filter, board, myUsername);
    }

    // Update Task
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(@PathVariable Long id, @RequestBody Task updatedTask) {
        User currentUser = getCurrentUser();
        try {
            Task updated = taskService.updateTask(id, updatedTask, currentUser);
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    // Delete Task
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        try {
            taskService.deleteTask(id, currentUser);
            return ResponseEntity.ok().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    // Helper to get current user from SecurityContext
    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userRepository.findByUsername(username).orElse(null);
    }

    // Test endpoint to create sample data
    @PostMapping("/test-data")
    public ResponseEntity<?> createTestData() {
        try {
            // Create roles
            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName("ROLE_ADMIN");
                    return roleRepository.save(role);
                });
            
            Role managerRole = roleRepository.findByName("ROLE_MANAGER")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName("ROLE_MANAGER");
                    return roleRepository.save(role);
                });
            
            Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName("ROLE_USER");
                    return roleRepository.save(role);
                });

            // Create test user
            User testUser = userRepository.findByUsername("newuser1")
                .orElseGet(() -> {
                    User user = new User();
                    user.setUsername("newuser1");
                    user.setPassword(passwordEncoder.encode("password123"));
                    user.setEmail("newuser1@example.com");
                    user.setFullName("Test User");
                    user.setRoles(new HashSet<>(Arrays.asList(managerRole)));
                    return userRepository.save(user);
                });

            // Create test tasks if none exist
            if (taskRepository.count() == 0) {
                Task task1 = new Task();
                task1.setTitle("Complete Project Documentation");
                task1.setDescription("Write comprehensive documentation for the new feature");
                task1.setAssignedTo(testUser);
                task1.setAssignedBy(testUser);
                task1.setStartDate(LocalDateTime.now());
                task1.setDeadlineDate(LocalDateTime.now().plusDays(7));
                task1.setStatus(Task.Status.IN_PROGRESS);
                task1.setPriority(Task.Priority.HIGH);
                task1.setCreatedAt(LocalDateTime.now());
                task1.setUpdatedAt(LocalDateTime.now());
                taskRepository.save(task1);

                Task task2 = new Task();
                task2.setTitle("Review Code Changes");
                task2.setDescription("Review pull request #123 for the authentication module");
                task2.setAssignedTo(testUser);
                task2.setAssignedBy(testUser);
                task2.setStartDate(LocalDateTime.now().minusDays(1));
                task2.setDeadlineDate(LocalDateTime.now().plusDays(2));
                task2.setStatus(Task.Status.BACKLOG);
                task2.setPriority(Task.Priority.MID);
                task2.setCreatedAt(LocalDateTime.now());
                task2.setUpdatedAt(LocalDateTime.now());
                taskRepository.save(task2);

                return ResponseEntity.ok("Created test user 'newuser1' with password 'password123' and 2 test tasks");
            }
            
            return ResponseEntity.ok("Test data already exists");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating test data: " + e.getMessage());
        }
    }
} 