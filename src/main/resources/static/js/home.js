document.addEventListener('DOMContentLoaded', function() {
    const jwt = localStorage.getItem('jwt');
    console.log('[DEBUG] JWT token:', jwt ? jwt.substring(0, 20) + '...' : 'null');
    if (!jwt) { window.location.href = '/login.html'; return; }

    let tasks = [];
    let currentTab = 'allTasks';
    
    // Check URL parameters for initial tab
    const urlParams = new URLSearchParams(window.location.search);
    const initialTab = urlParams.get('tab');
    if (initialTab === 'myTasks' || initialTab === 'allTasks') {
        currentTab = initialTab;
    }

    const taskBoard = document.getElementById('taskBoard');
    const sortSelect = document.getElementById('sortSelect');
    const filterSelect = document.getElementById('filterSelect');
    const searchInput = document.getElementById('searchInput');
    const searchSubmitBtn = document.getElementById('searchSubmitBtn');
    const navAllTasks = document.getElementById('navAllTasks');
    const navMyTasks = document.getElementById('navMyTasks');
    const navCreateTask = document.getElementById('navCreateTask');
    const createTaskModal = document.getElementById('createTaskModal');
    const closeCreateTaskModal = document.getElementById('closeCreateTaskModal');
    const createTaskFormModal = document.getElementById('createTaskFormModal');

    // Function to get username from JWT token or localStorage
    function getUsername() {
        let username = localStorage.getItem('username');
        console.log('[DEBUG] Username from localStorage:', username);
        
        if (!username && jwt) {
            try {
                // Decode JWT token to extract username
                const payload = JSON.parse(atob(jwt.split('.')[1]));
                console.log('[DEBUG] JWT payload:', payload);
                username = payload.sub || payload.username;
                console.log('[DEBUG] Username from JWT:', username);
                if (username) {
                    localStorage.setItem('username', username);
                    console.log('[DEBUG] Stored username in localStorage:', username);
                }
            } catch (e) {
                console.error('[DEBUG] Failed to decode JWT:', e);
            }
        }
        return username || '';
    }

    async function fetchTasks({board, search, filter, sort} = {}) {
        const params = [];
        board = board || currentTab;
        const username = getUsername();
        params.push(`board=${board}&myUsername=${encodeURIComponent(username)}`);
        if (search) params.push('search=' + encodeURIComponent(search));
        if (filter) params.push('filter=' + encodeURIComponent(filter));
        if (sort) params.push('sort=' + encodeURIComponent(sort));
        const url = '/api/tasks' + (params.length ? '?' + params.join('&') : '');
        console.log('[DEBUG] Fetching tasks from:', url);
        console.log('[DEBUG] Username being sent:', username);
        
        try {
            const res = await fetch(url, { headers: { 'Authorization': 'Bearer ' + jwt } });
            console.log('[DEBUG] Response status:', res.status);
            console.log('[DEBUG] Response headers:', Object.fromEntries(res.headers.entries()));
            
            if (!res.ok) {
                console.error('[DEBUG] HTTP error:', res.status, res.statusText);
                const errorText = await res.text();
                console.error('[DEBUG] Error response:', errorText);
                taskBoard.innerHTML = `<div style="text-align:center;color:red;">Error: ${res.status} ${res.statusText}</div>`;
                return;
            }
            
            tasks = await res.json();
            console.log('[DEBUG] Received tasks:', tasks);
            console.log('[DEBUG] Number of tasks:', tasks.length);
            renderTasks();
        } catch (error) {
            console.error('[DEBUG] Fetch error:', error);
            taskBoard.innerHTML = `<div style="text-align:center;color:red;">Error: ${error.message}</div>`;
        }
    }

    function renderTasks() {
        console.log('[DEBUG] Rendering tasks, count:', tasks.length);
        if (!tasks.length) {
            taskBoard.innerHTML = '<div style="text-align:center;color:#aaa;">No tasks found.</div>';
            return;
        }
        taskBoard.innerHTML = tasks.map((task, idx) => {
            // Status and priority badges
            const statusBadge = `<span class="badge status-${task.status}">${task.status.replace('_',' ')}</span>`;
            const priorityBadge = `<span class="badge priority-${task.priority}">${task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}</span>`;
            return `
                <div class="task-row status-${task.status}">
                    <div class="task-row-header">
                        <div class="task-row-header-content">
                            <span class="task-index" style="font-weight:bold;color:#1976d2;margin-right:8px;">#${idx + 1}</span>
                            <span class="task-title">${task.title || ''}</span>
                            <span class="task-assigned-by">Assigned By: ${task.assignedBy?.fullName || task.assignedBy?.username || ''}</span>
                            <span class="task-date">Start: ${task.startDate ? task.startDate.replace('T', ' ').substring(0, 16) : ''}</span>
                            <span class="task-date">Deadline: ${task.deadlineDate ? task.deadlineDate.replace('T', ' ').substring(0, 16) : ''}</span>
                            ${statusBadge} ${priorityBadge}
                        </div>
                        <button class="expand-btn" title="Expand">&#9660;</button>
                    </div>
                    <div class="task-row-details">
                        <div><b>Description:</b> ${task.description || ''}</div>
                        <div><b>ID:</b> ${task.id}</div>
                        <div><b>Assigned To:</b> ${task.assignedTo?.fullName || task.assignedTo?.username}</div>
                        <div><b>Status:</b> ${task.status} ${statusBadge}</div>
                        <div><b>Priority:</b> ${task.priority} ${priorityBadge}</div>
                        <div class="task-actions">
                            <button class="btn-primary update-task-btn" data-id="${task.id}">Update</button>
                            <button class="btn-danger delete-task-btn" data-id="${task.id}">Delete</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners for expand buttons
        document.querySelectorAll('.expand-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent triggering the row header click
                toggleTaskExpansion(this);
            });
        });

        // Add event listeners for entire task row headers
        document.querySelectorAll('.task-row-header').forEach(header => {
            header.addEventListener('click', function() {
                const expandBtn = this.querySelector('.expand-btn');
                if (expandBtn) {
                    toggleTaskExpansion(expandBtn);
                }
            });
        });

        // Function to toggle task expansion (only one at a time)
        function toggleTaskExpansion(expandBtn) {
            const taskRow = expandBtn.closest('.task-row');
            const isExpanded = taskRow.classList.contains('expanded');

            // Collapse all other expanded task rows
            document.querySelectorAll('.task-row.expanded').forEach(row => {
                if (row !== taskRow) {
                    row.classList.remove('expanded');
                    const btn = row.querySelector('.expand-btn');
                    if (btn) btn.innerHTML = '&#9660;';
                }
            });

            if (isExpanded) {
                taskRow.classList.remove('expanded');
                expandBtn.innerHTML = '&#9660;';
            } else {
                taskRow.classList.add('expanded');
                expandBtn.innerHTML = '&#9650;';
            }
        }

        // Add event listeners for update buttons
        document.querySelectorAll('.update-task-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const taskId = this.getAttribute('data-id');
                window.location.href = `/update-task.html?id=${taskId}`;
            });
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-task-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const taskId = this.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this task?')) {
                    deleteTask(taskId);
                }
            });
        });
    }

    async function deleteTask(taskId) {
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + jwt }
            });
            
            if (res.ok) {
                // Refresh the task list
                fetchTasks({
                    board: currentTab,
                    search: searchInput.value,
                    filter: filterSelect.value,
                    sort: sortSelect.value
                });
            } else {
                console.error('Failed to delete task:', res.status);
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            fetchTasks({
                board: currentTab,
                search: searchInput.value,
                filter: filterSelect.value,
                sort: sortSelect.value
            });
        });
    }
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            fetchTasks({
                board: currentTab,
                search: searchInput.value,
                filter: filterSelect.value,
                sort: sortSelect.value
            });
        });
    }
    if (searchSubmitBtn) {
        searchSubmitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            fetchTasks({
                board: currentTab,
                search: searchInput.value,
                filter: filterSelect.value,
                sort: sortSelect.value
            });
        });
    }
    if (navAllTasks) {
        navAllTasks.addEventListener('click', function(e) {
            e.preventDefault();
            currentTab = 'allTasks';
            updateActiveTab();
            fetchTasks({ board: 'allTasks', search: searchInput.value, filter: filterSelect.value, sort: sortSelect.value });
        });
    }
    if (navMyTasks) {
        navMyTasks.addEventListener('click', function(e) {
            e.preventDefault();
            currentTab = 'myTasks';
            updateActiveTab();
            fetchTasks({ board: 'myTasks', search: searchInput.value, filter: filterSelect.value, sort: sortSelect.value });
        });
    }

    // Function to update active tab styling
    function updateActiveTab() {
        if (navAllTasks) navAllTasks.classList.remove('active');
        if (navMyTasks) navMyTasks.classList.remove('active');
        
        if (currentTab === 'allTasks' && navAllTasks) {
            navAllTasks.classList.add('active');
        } else if (currentTab === 'myTasks' && navMyTasks) {
            navMyTasks.classList.add('active');
        }
    }

    // Modal functionality
    if (navCreateTask) {
        navCreateTask.addEventListener('click', function(e) {
            e.preventDefault();
            openCreateTaskModal();
        });
    }

    if (closeCreateTaskModal) {
        closeCreateTaskModal.addEventListener('click', function() {
            closeModal();
        });
    }

    if (createTaskFormModal) {
        createTaskFormModal.addEventListener('submit', function(e) {
            e.preventDefault();
            createTask();
        });
    }

    // Close modal when clicking outside
    if (createTaskModal) {
        createTaskModal.addEventListener('click', function(e) {
            if (e.target === createTaskModal) {
                closeModal();
            }
        });
    }

    function openCreateTaskModal() {
        if (createTaskModal) {
            createTaskModal.classList.add('show');
            loadUsersForModal();
            // Set default dates
            const now = new Date();
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            document.getElementById('startDateInputModal').value = now.toISOString().slice(0, 16);
            document.getElementById('deadlineDateInputModal').value = tomorrow.toISOString().slice(0, 16);
        }
    }

    function closeModal() {
        if (createTaskModal) {
            createTaskModal.classList.remove('show');
            createTaskFormModal.reset();
        }
    }

    async function loadUsersForModal() {
        try {
            const jwt = localStorage.getItem('jwt');
            const response = await fetch('/api/user/users', {
                headers: { 'Authorization': 'Bearer ' + jwt }
            });
            
            if (response.ok) {
                const users = await response.json();
                const select = document.getElementById('assignedToSelectModal');
                
                select.innerHTML = '<option value="">Select user...</option>';
                users.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user.username;
                    option.textContent = user.fullName || user.username;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading users for modal:', error);
        }
    }

    async function createTask() {
        try {
            const jwt = localStorage.getItem('jwt');
            const username = getUsername();
            const assignedTo = document.getElementById('assignedToSelectModal').value;
            
            const taskData = {
                title: document.getElementById('taskTitleInputModal').value,
                description: document.getElementById('taskDescriptionInputModal').value,
                startDate: document.getElementById('startDateInputModal').value,
                deadlineDate: document.getElementById('deadlineDateInputModal').value,
                status: document.getElementById('statusSelectModal').value,
                priority: document.getElementById('prioritySelectModal').value
            };

            console.log('[DEBUG] Creating task with data:', taskData);
            console.log('[DEBUG] Assigned to:', assignedTo);
            console.log('[DEBUG] Assigned by:', username);

            const url = `/api/tasks?assignedTo=${encodeURIComponent(assignedTo)}&assignedBy=${encodeURIComponent(username)}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwt 
                },
                body: JSON.stringify(taskData)
            });

            console.log('[DEBUG] Create task response status:', response.status);

            if (response.ok) {
                const createdTask = await response.json();
                console.log('[DEBUG] Task created successfully:', createdTask);
                closeModal();
                showToast('Task created successfully!');
                // Refresh the task list
                fetchTasks({
                    board: currentTab,
                    search: searchInput.value,
                    filter: filterSelect.value,
                    sort: sortSelect.value
                });
            } else {
                const error = await response.text();
                console.error('[DEBUG] Failed to create task:', response.status, response.statusText);
                console.error('[DEBUG] Error response:', error);
                alert('Failed to create task: ' + response.status + ' ' + response.statusText + '\n' + error);
            }
        } catch (error) {
            console.error('[DEBUG] Error creating task:', error);
            alert('Error creating task: ' + error.message);
        }
    }

    // Initial load
    updateActiveTab(); // Set initial active tab
    fetchTasks();
}); 