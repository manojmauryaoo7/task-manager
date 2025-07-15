package com.example.task.management.service;

import com.example.task.management.model.Task;
import com.example.task.management.model.User;
import com.example.task.management.repository.TaskRepository;
import com.example.task.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {
    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private UserRepository userRepository;

    public Task createTask(Task task, String assignedToUsername, String assignedByUsername) {
        User assignedTo = userRepository.findByUsername(assignedToUsername).orElseThrow();
        User assignedBy = userRepository.findByUsername(assignedByUsername).orElseThrow();
        task.setAssignedTo(assignedTo);
        task.setAssignedBy(assignedBy);
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    public Optional<Task> getTask(Long id) {
        return taskRepository.findById(id);
    }

    public List<Task> getAllTasks(String search, String sort, String filter, String board, String myUsername) {
        Specification<Task> spec = buildSpecification(search, filter, board, myUsername);
        org.springframework.data.domain.Sort sortObj = buildSort(sort);
        List<Task> result = taskRepository.findAll(spec, sortObj);
        System.out.println("[DEBUG] Requested sort: " + sort);
        System.out.println("[DEBUG] First 5 tasks after sort:");
        for (int i = 0; i < Math.min(5, result.size()); i++) {
            Task t = result.get(i);
            System.out.println("  - id=" + t.getId() + ", title=" + t.getTitle() + ", startDate=" + t.getStartDate() + ", deadlineDate=" + t.getDeadlineDate());
        }
        return result;
    }

    private Specification<Task> buildSpecification(String search, String filter, String board, String myUsername) {
        return (root, query, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            
            if (search != null && !search.isEmpty()) {
                // Try to parse search as a Long for ID search
                jakarta.persistence.criteria.Predicate idMatch = cb.disjunction();
                try {
                    Long idVal = Long.valueOf(search.trim());
                    idMatch = cb.equal(root.get("id"), idVal);
                } catch (NumberFormatException ignored) {}
                jakarta.persistence.criteria.Predicate titleMatch = cb.like(cb.lower(root.get("title")), "%" + search.toLowerCase() + "%");
                predicates.add(cb.or(idMatch, titleMatch));
            }
            
            if (filter != null && !filter.isEmpty()) {
                if (filter.equalsIgnoreCase("priority-high")) {
                    predicates.add(cb.equal(root.get("priority"), Task.Priority.HIGH));
                } else if (filter.equalsIgnoreCase("priority-mid")) {
                    predicates.add(cb.equal(root.get("priority"), Task.Priority.MID));
                } else if (filter.equalsIgnoreCase("priority-low")) {
                    predicates.add(cb.equal(root.get("priority"), Task.Priority.LOW));
                } else if (filter.equalsIgnoreCase("status-inprogress")) {
                    predicates.add(cb.equal(root.get("status"), Task.Status.IN_PROGRESS));
                } else if (filter.equalsIgnoreCase("status-backlog")) {
                    predicates.add(cb.equal(root.get("status"), Task.Status.BACKLOG));
                } else if (filter.equalsIgnoreCase("status-completed")) {
                    predicates.add(cb.equal(root.get("status"), Task.Status.COMPLETED));
                }
            }
            
            // Board filtering - only apply if myUsername is not empty
            if (board != null && myUsername != null && !myUsername.trim().isEmpty()) {
                System.out.println("[DEBUG] Filtering by board: " + board + ", username: " + myUsername);
                if (board.equalsIgnoreCase("myTasks")) {
                    // My Tasks: only tasks assigned to the current user
                    predicates.add(cb.equal(root.get("assignedTo").get("username"), myUsername));
                } else if (board.equalsIgnoreCase("allTasks")) {
                    // All Tasks: tasks assigned to OR created by the current user
                    predicates.add(cb.or(
                        cb.equal(root.get("assignedTo").get("username"), myUsername),
                        cb.equal(root.get("assignedBy").get("username"), myUsername)
                    ));
                }
            } else {
                System.out.println("[DEBUG] No board filtering applied - board: " + board + ", username: " + myUsername);
            }
            
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private org.springframework.data.domain.Sort buildSort(String sort) {
        if (sort == null) return org.springframework.data.domain.Sort.unsorted();
        switch (sort) {
            case "byStartDate":
                return org.springframework.data.domain.Sort.by("startDate").ascending();
            case "byDeadlineDate":
                return org.springframework.data.domain.Sort.by("deadlineDate").ascending();
            case "titleAsc":
                return org.springframework.data.domain.Sort.by("title").ascending();
            case "titleDesc":
                return org.springframework.data.domain.Sort.by("title").descending();
            default:
                return org.springframework.data.domain.Sort.unsorted();
        }
    }

    public Task updateTask(Long id, Task updatedTask, User currentUser) {
        Task task = taskRepository.findById(id).orElseThrow();
        System.out.println("[DEBUG] updateTask called by user: " + (currentUser != null ? currentUser.getUsername() : "null"));
        System.out.println("[DEBUG] Task assignedTo: " + (task.getAssignedTo() != null ? task.getAssignedTo().getUsername() : "null") + ", assignedBy: " + (task.getAssignedBy() != null ? task.getAssignedBy().getUsername() : "null"));
        System.out.println("[DEBUG] canEditTask result: " + canEditTask(task, currentUser));
        if (!canEditTask(task, currentUser)) throw new SecurityException("Not allowed to edit this task");
        task.setTitle(updatedTask.getTitle());
        task.setDescription(updatedTask.getDescription());
        // Update assignedTo if provided and valid
        if (updatedTask.getAssignedTo() != null && updatedTask.getAssignedTo().getUsername() != null) {
            User newAssignee = userRepository.findByUsername(updatedTask.getAssignedTo().getUsername()).orElse(null);
            if (newAssignee != null) task.setAssignedTo(newAssignee);
        }
        task.setStartDate(updatedTask.getStartDate());
        task.setDeadlineDate(updatedTask.getDeadlineDate());
        task.setStatus(updatedTask.getStatus());
        task.setPriority(updatedTask.getPriority());
        task.setUpdatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    public void deleteTask(Long id, User currentUser) {
        Task task = taskRepository.findById(id).orElseThrow();
        if (!canDeleteTask(task, currentUser)) throw new SecurityException("Not allowed to delete this task");
        taskRepository.delete(task);
    }

    // Permission logic
    public boolean canEditTask(Task task, User user) {
        if (user == null) {
            System.out.println("[DEBUG] canEditTask: user is null");
            return false;
        }
        boolean isAssignee = task.getAssignedTo().getId().equals(user.getId());
        boolean isAssigner = task.getAssignedBy().getId().equals(user.getId());
        boolean isSuperior = isSuperior(user, task.getAssignedBy());
        System.out.println("[DEBUG] canEditTask: user=" + user.getUsername() + ", assignedTo=" + (task.getAssignedTo() != null ? task.getAssignedTo().getUsername() : "null") + ", assignedBy=" + (task.getAssignedBy() != null ? task.getAssignedBy().getUsername() : "null") + ", isAssignee=" + isAssignee + ", isAssigner=" + isAssigner + ", isSuperior=" + isSuperior);
        return isAssignee || isAssigner || isSuperior;
    }

    public boolean canDeleteTask(Task task, User user) {
        if (user == null) return false;
        // Only assigned by (creator) or superior can delete
        if (task.getAssignedBy().getId().equals(user.getId())) return true;
        if (isSuperior(user, task.getAssignedBy())) return true;
        return false;
    }

    // Hierarchy: admin > manager > user
    private boolean isSuperior(User user, User other) {
        int userLevel = getRoleLevel(user);
        int otherLevel = getRoleLevel(other);
        return userLevel > otherLevel;
    }

    private int getRoleLevel(User user) {
        if (user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN"))) return 3;
        if (user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_MANAGER"))) return 2;
        return 1; // ROLE_USER
    }
} 