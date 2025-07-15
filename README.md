# Task Management System

A professional, modern, and responsive Task Management System built with Spring Boot, PostgreSQL, and a colorful Bootstrap5 + Tailwind CSS frontend. Designed for teams and organizations to manage tasks efficiently with role-based access and JWT authentication.

## Features

- **User Authentication & Authorization**: Secure login and registration with JWT-based authentication.
- **Role Management**: Supports Admin, Manager, and User roles with different permissions.
- **Task CRUD**: Create, view, update, and delete tasks with priority and status.
- **Advanced Filtering & Sorting**: Filter tasks by priority/status and sort by date or title.
- **Search**: Search tasks by ID or title.
- **Responsive UI**: Professional, colorful, and modern interface with Bootstrap5 and Tailwind CSS, including hover effects and consistent alignment.
- **Profile Sidebar**: View and manage user profile details.
- **Pagination**: Infinite lazy loading for task lists.

## Tech Stack

- **Backend**: Spring Boot 3, Spring Security, Spring Data JPA, JWT
- **Database**: PostgreSQL
- **Frontend**: HTML5, CSS3, Bootstrap5, Tailwind CSS, Vanilla JS
- **Build Tool**: Maven Wrapper
- **Testing**: JUnit 5

## Getting Started

### Prerequisites
- Java 17+
- Maven 3.9+
- PostgreSQL

### Setup
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd task-management
   ```
2. **Configure the database:**
   Edit `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/mydb
   spring.datasource.username=root
   spring.datasource.password=root
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
   jwt.secret=<your-secret>
   ```
3. **Build and run the application:**
   ```bash
   ./mvnw spring-boot:run
   ```
4. **Access the app:**
   Open [http://localhost:8080](http://localhost:8080) in your browser.

## Usage
- **Register** a new user or login with existing credentials.
- **Admins** can manage all users and tasks.
- **Managers** can assign and track tasks for their team.
- **Users** can view and update their own tasks.
- Use the search, filter, and sort options for efficient task management.

## Folder Structure
- `src/main/java/com/example/task/management/` - Java source code
- `src/main/resources/static/` - Static frontend assets (HTML, CSS, JS)
- `src/main/resources/templates/` - Thymeleaf templates
- `src/main/resources/application.properties` - App configuration

## Contribution
Contributions are welcome! Please fork the repo and submit a pull request.

## License
This project is licensed under the Apache License 2.0.