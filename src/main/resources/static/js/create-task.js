document.addEventListener('DOMContentLoaded', function() {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) { window.location.href = '/login.html'; return; }
    const assignedToSelect = document.getElementById('assignedToSelect');
    const createTaskForm = document.getElementById('createTaskForm');
    const taskTitleInput = document.getElementById('taskTitleInput');
    const taskDescriptionInput = document.getElementById('taskDescriptionInput');
    const startDateInput = document.getElementById('startDateInput');
    const deadlineDateInput = document.getElementById('deadlineDateInput');
    const statusSelect = document.getElementById('statusSelect');
    const prioritySelect = document.getElementById('prioritySelect');
    let currentUser = null;
    let users = [];

    async function fetchCurrentUser() {
        const res = await fetch('/api/user/profile', { headers: { 'Authorization': 'Bearer ' + jwt } });
        if (res.status !== 200) { localStorage.removeItem('jwt'); window.location.href = '/login.html'; return; }
        currentUser = await res.json();
    }
    async function fetchUsers() {
        const res = await fetch('/api/user/users', { headers: { 'Authorization': 'Bearer ' + jwt } });
        users = await res.json();
        assignedToSelect.innerHTML = users.map(u => `<option value="${u.username}">${u.fullName || u.username}</option>`).join('');
    }

    createTaskForm.onsubmit = async function(e) {
        e.preventDefault();
        const data = {
            title: taskTitleInput.value,
            description: taskDescriptionInput.value,
            startDate: startDateInput.value,
            deadlineDate: deadlineDateInput.value,
            status: statusSelect.value,
            priority: prioritySelect.value
        };
        const assignedTo = assignedToSelect.value;
        const res = await fetch(`/api/tasks?assignedTo=${encodeURIComponent(assignedTo)}&assignedBy=${encodeURIComponent(currentUser.username)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt },
            body: JSON.stringify(data)
        });
        if (res.status === 200) {
            if (window.showToast) window.showToast('Task created!', 2000);
            setTimeout(() => { window.location.href = '/home.html'; }, 800);
        } else {
            if (window.showToast) window.showToast('Error creating task', 3000);
        }
    };

    (async function() {
        await fetchCurrentUser();
        await fetchUsers();
    })();
}); 