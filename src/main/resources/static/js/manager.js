document.addEventListener('DOMContentLoaded', async function() {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) { window.location.href = '/login.html'; return; }
    
    // Navigation elements
    const navHome = document.getElementById('navHome');
    const navAllTasks = document.getElementById('navAllTasks');
    const navMyTasks = document.getElementById('navMyTasks');
    const navManager = document.getElementById('navManager');
    
    const userListDiv = document.getElementById('managerUserList');
    let currentUser = null;
    // Fetch user profile to check role
    const res = await fetch('/api/user/profile', { headers: { 'Authorization': 'Bearer ' + jwt } });
    if (res.status !== 200) { localStorage.removeItem('jwt'); window.location.href = '/login.html'; return; }
    currentUser = await res.json();
    const roles = currentUser.roles.map(r => r.name);
    // Hide Manager Panel link if not manager/admin
    if (!(roles.includes('ROLE_MANAGER') || roles.includes('ROLE_ADMIN'))) {
        if (navManager) navManager.style.display = 'none';
        if (window.showToast) window.showToast('Access denied: Manager only', 3000);
        setTimeout(() => { window.location.href = '/home.html'; }, 1200);
        return;
    }
    // Load users for manager
    async function loadUsers() {
        const res = await fetch('/api/manager/users', { headers: { 'Authorization': 'Bearer ' + jwt } });
        if (res.status !== 200) {
            let msg = 'Access denied or session expired.';
            try {
                const err = await res.json();
                msg = err.error || JSON.stringify(err);
            } catch (e) {}
            if (window.showToast) window.showToast('Error: ' + msg, 3000);
            localStorage.removeItem('jwt');
            window.location.href = '/login.html';
            return;
        }
        const users = await res.json();
        userListDiv.innerHTML = users.map(u => `
            <div class="manager-user-row">
                <div><b>${u.username}</b> <span style="color:#888;font-size:0.98em;">(${u.roles.map(r=>r.name.replace('ROLE_','')).join(', ')})</span></div>
                <div>${u.fullName || ''} <span style="color:#888;">${u.email || ''}</span></div>
                <button class="btn-danger" onclick="deleteUser(${u.id})">Delete</button>
            </div>`).join('');
    }
    window.deleteUser = async function(id) {
        if (!confirm('Delete user?')) return;
        await fetch(`/api/manager/users/${id}`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + jwt } });
        loadUsers();
        if (window.showToast) window.showToast('User deleted!', 2000);
    };
    
    // Navigation functionality
    if (navHome) {
        navHome.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/home.html';
        });
    }
    
    if (navAllTasks) {
        navAllTasks.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/home.html?tab=allTasks';
        });
    }
    
    if (navMyTasks) {
        navMyTasks.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/home.html?tab=myTasks';
        });
    }
    
    if (navManager) {
        navManager.addEventListener('click', function(e) {
            e.preventDefault();
            // Already on manager page, just update active state
            updateActiveTab();
        });
    }
    
    // Function to update active tab styling
    function updateActiveTab() {
        if (navAllTasks) navAllTasks.classList.remove('active');
        if (navMyTasks) navMyTasks.classList.remove('active');
        if (navManager) navManager.classList.remove('active');
        
        // Manager tab is active on this page
        if (navManager) {
            navManager.classList.add('active');
        }
    }
    
    // Set initial active tab
    updateActiveTab();
    
    loadUsers();
}); 