package com.example.task.management;

import com.example.task.management.model.Role;
import com.example.task.management.model.Task;
import com.example.task.management.model.User;
import com.example.task.management.repository.RoleRepository;
import com.example.task.management.repository.TaskRepository;
import com.example.task.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;

@SpringBootApplication
public class TaskManagementApplication {

	public static void main(String[] args) {
		SpringApplication.run(TaskManagementApplication.class, args);
	}

	@Bean
	CommandLineRunner initData(UserRepository userRepository, 
							  RoleRepository roleRepository, 
							  TaskRepository taskRepository,
							  PasswordEncoder passwordEncoder) {
		return args -> {
			// Create roles if they don't exist
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

			// Create test users if they don't exist
			User admin = userRepository.findByUsername("admin")
				.orElseGet(() -> {
					User u = new User();
					u.setUsername("admin");
					u.setPassword(passwordEncoder.encode("admin123"));
					u.setEmail("admin@example.com");
					u.setFullName("Admin User");
					u.setRoles(new HashSet<>(Arrays.asList(adminRole)));
					return userRepository.save(u);
				});

			User manager = userRepository.findByUsername("manager")
				.orElseGet(() -> {
					User u = new User();
					u.setUsername("manager");
					u.setPassword(passwordEncoder.encode("manager123"));
					u.setEmail("manager@example.com");
					u.setFullName("Manager User");
					u.setRoles(new HashSet<>(Arrays.asList(managerRole)));
					return userRepository.save(u);
				});

			User user = userRepository.findByUsername("user")
				.orElseGet(() -> {
					User u = new User();
					u.setUsername("user");
					u.setPassword(passwordEncoder.encode("user123"));
					u.setEmail("user@example.com");
					u.setFullName("Regular User");
					u.setRoles(new HashSet<>(Arrays.asList(userRole)));
					return userRepository.save(u);
				});

			// Create test tasks if none exist
			if (taskRepository.count() == 0) {
				Task task1 = new Task();
				task1.setTitle("Complete Project Documentation");
				task1.setDescription("Write comprehensive documentation for the new feature");
				task1.setAssignedTo(user);
				task1.setAssignedBy(manager);
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
				task2.setAssignedTo(manager);
				task2.setAssignedBy(admin);
				task2.setStartDate(LocalDateTime.now().minusDays(1));
				task2.setDeadlineDate(LocalDateTime.now().plusDays(2));
				task2.setStatus(Task.Status.BACKLOG);
				task2.setPriority(Task.Priority.MID);
				task2.setCreatedAt(LocalDateTime.now());
				task2.setUpdatedAt(LocalDateTime.now());
				taskRepository.save(task2);

				Task task3 = new Task();
				task3.setTitle("Setup Development Environment");
				task3.setDescription("Install and configure all required tools for new team members");
				task3.setAssignedTo(admin);
				task3.setAssignedBy(admin);
				task3.setStartDate(LocalDateTime.now().minusDays(2));
				task3.setDeadlineDate(LocalDateTime.now().plusDays(1));
				task3.setStatus(Task.Status.COMPLETED);
				task3.setPriority(Task.Priority.LOW);
				task3.setCreatedAt(LocalDateTime.now());
				task3.setUpdatedAt(LocalDateTime.now());
				taskRepository.save(task3);

				System.out.println("Created 3 test tasks");
			}
		};
	}
}

