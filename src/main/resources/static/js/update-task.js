document.addEventListener('DOMContentLoaded', function() {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) { 
        window.location.href = '/login.html'; 
        return; 
    }

    const urlParams = new URLSearchParams(window.location.search);
    const taskId = urlParams.get('id');
    
    if (!taskId) {
        alert('No task ID provided');
        window.location.href = '/home.html';
        return;
    }

    // Load task data
    loadTask(taskId);
    loadUsers();

    // Form submission
    document.getElementById('updateTaskForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateTask(taskId);
    });
});

async function loadTask(taskId) {
    try {
        const jwt = localStorage.getItem('jwt');
        console.log('[DEBUG] Loading task with ID:', taskId);
        console.log('[DEBUG] JWT token:', jwt ? jwt.substring(0, 20) + '...' : 'null');
        
        const response = await fetch(`/api/tasks/${taskId}`, {
            headers: { 'Authorization': 'Bearer ' + jwt }
        });
        
        console.log('[DEBUG] Response status:', response.status);
        console.log('[DEBUG] Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const task = await response.json();
            console.log('[DEBUG] Loaded task:', task);
            
            // Populate form fields
            document.getElementById('taskTitleInput').value = task.title || '';
            document.getElementById('taskDescriptionInput').value = task.description || '';
            document.getElementById('startDateInput').value = task.startDate ? task.startDate.substring(0, 16) : '';
            document.getElementById('deadlineDateInput').value = task.deadlineDate ? task.deadlineDate.substring(0, 16) : '';
            document.getElementById('statusSelect').value = task.status || 'IN_PROGRESS';
            document.getElementById('prioritySelect').value = task.priority || 'LOW';
            
            // Set assigned user after users are loaded
            setTimeout(() => {
                if (task.assignedTo) {
                    document.getElementById('assignedToSelect').value = task.assignedTo.username;
                }
            }, 100);
        } else {
            console.error('[DEBUG] Failed to load task:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('[DEBUG] Error response:', errorText);
            alert('Failed to load task: ' + response.status + ' ' + response.statusText);
            window.location.href = '/home.html';
        }
    } catch (error) {
        console.error('[DEBUG] Error loading task:', error);
        alert('Error loading task: ' + error.message);
        window.location.href = '/home.html';
    }
}

async function loadUsers() {
    try {
        const jwt = localStorage.getItem('jwt');
        console.log('[DEBUG] Loading users');
        console.log('[DEBUG] JWT token:', jwt ? jwt.substring(0, 20) + '...' : 'null');
        
        const response = await fetch('/api/user/users', {
            headers: { 'Authorization': 'Bearer ' + jwt }
        });
        
        console.log('[DEBUG] Users response status:', response.status);
        
        if (response.ok) {
            const users = await response.json();
            console.log('[DEBUG] Loaded users:', users);
            const select = document.getElementById('assignedToSelect');
            
            select.innerHTML = '<option value="">Select user...</option>';
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.username;
                option.textContent = user.fullName || user.username;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function updateTask(taskId) {
    try {
        const jwt = localStorage.getItem('jwt');
        console.log('[DEBUG] Updating task with ID:', taskId);
        console.log('[DEBUG] JWT token:', jwt ? jwt.substring(0, 20) + '...' : 'null');
        
        const formData = {
            title: document.getElementById('taskTitleInput').value,
            description: document.getElementById('taskDescriptionInput').value,
            assignedTo: { username: document.getElementById('assignedToSelect').value },
            startDate: document.getElementById('startDateInput').value,
            deadlineDate: document.getElementById('deadlineDateInput').value,
            status: document.getElementById('statusSelect').value,
            priority: document.getElementById('prioritySelect').value
        };

        console.log('[DEBUG] Form data:', formData);
        
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt 
            },
            body: JSON.stringify(formData)
        });

        console.log('[DEBUG] Update response status:', response.status);
        console.log('[DEBUG] Update response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
            const updatedTask = await response.json();
            console.log('[DEBUG] Task updated successfully:', updatedTask);
            alert('Task updated successfully');
            window.location.href = '/home.html';
        } else {
            const error = await response.text();
            console.error('[DEBUG] Failed to update task:', response.status, response.statusText);
            console.error('[DEBUG] Error response:', error);
            alert('Failed to update task: ' + response.status + ' ' + response.statusText + '\n' + error);
        }
    } catch (error) {
        console.error('[DEBUG] Error updating task:', error);
        alert('Error updating task: ' + error.message);
    }
} 