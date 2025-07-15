document.addEventListener('DOMContentLoaded', async function() {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) { window.location.href = '/login.html'; return; }
    const userListDiv = document.getElementById('adminUserList');
    const managerListDiv = document.getElementById('adminManagerList');
    const adminPanelTitle = document.getElementById('adminPanelTitle');
    let currentUser = null;
    // Fetch user profile to check role
    const res = await fetch('/api/user/profile', { headers: { 'Authorization': 'Bearer ' + jwt } });
    if (res.status !== 200) { localStorage.removeItem('jwt'); window.location.href = '/login.html'; return; }
    currentUser = await res.json();
    const roles = currentUser.roles.map(r => r.name);
    // Hide Admin Panel link if not admin
    const navAdmin = document.getElementById('navAdmin');
    if (!roles.includes('ROLE_ADMIN')) {
        if (navAdmin) navAdmin.style.display = 'none';
        if (window.showToast) window.showToast('Access denied: Admin only', 3000);
        setTimeout(() => { window.location.href = '/home.html'; }, 1200);
        return;
    }

    // SPA-like navigation for Manage Users/Managers
    function showSection() {
        if (window.location.hash === '#managers') {
            adminPanelTitle.textContent = 'Manage Managers';
            userListDiv.style.display = 'none';
            managerListDiv.style.display = '';
            loadManagers();
        } else {
            adminPanelTitle.textContent = 'Manage Users';
            userListDiv.style.display = '';
            managerListDiv.style.display = 'none';
            loadUsers();
        }
    }
    window.addEventListener('hashchange', showSection);

    // Load all users
    async function loadUsers() {
        const res = await fetch('/api/admin/users', { headers: { 'Authorization': 'Bearer ' + jwt } });
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
            <div style='border-bottom:1px solid #eee;padding:8px;'>
                <b>${u.username}</b> (${u.roles.map(r=>r.name).join(', ')})<br>
                ${u.fullName || ''} ${u.email || ''}<br>
                <button class="btn-danger" onclick="deleteUser(${u.id})">Delete</button>
                <button class="btn-secondary" onclick="showRoleForm(${u.id}, '${u.roles.map(r=>r.name).join(',')}')">Roles</button>
            </div>`).join('');
    }
    // Load only managers
    async function loadManagers() {
        const res = await fetch('/api/admin/users', { headers: { 'Authorization': 'Bearer ' + jwt } });
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
        const managers = users.filter(u => u.roles.some(r => r.name === 'ROLE_MANAGER'));
        managerListDiv.innerHTML = managers.length === 0 ? '<div style="color:#aaa;">No managers found.</div>' : managers.map(u => `
            <div style='border-bottom:1px solid #eee;padding:8px;'>
                <b>${u.username}</b> (${u.roles.map(r=>r.name).join(', ')})<br>
                ${u.fullName || ''} ${u.email || ''}<br>
                <button class="btn-danger" onclick="deleteUser(${u.id})">Delete</button>
                <button class="btn-secondary" onclick="showRoleForm(${u.id}, '${u.roles.map(r=>r.name).join(',')}')">Roles</button>
            </div>`).join('');
    }
    window.deleteUser = async function(id) {
        if (!confirm('Delete user?')) return;
        await fetch(`/api/admin/users/${id}`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + jwt } });
        showSection();
        if (window.showToast) window.showToast('User deleted!', 2000);
    };
    window.showRoleForm = function(id, currentRoles) {
        const roles = ['ROLE_USER','ROLE_MANAGER','ROLE_ADMIN'];
        const form = `<form onsubmit="updateRoles(event,${id})">` +
            roles.map(r => `<label><input type='checkbox' name='roles' value='${r}' ${currentRoles.includes(r)?'checked':''}/> ${r.replace('ROLE_','')}</label>`).join(' ') +
            `<button type='submit' class='btn-primary'>Update Roles</button></form>`;
        // Show form in correct section
        if (window.location.hash === '#managers') {
            managerListDiv.innerHTML += `<div id='roleForm${id}'>${form}</div>`;
        } else {
            userListDiv.innerHTML += `<div id='roleForm${id}'>${form}</div>`;
        }
    };
    window.updateRoles = async function(e, id) {
        e.preventDefault();
        const roles = Array.from(e.target.roles).filter(cb=>cb.checked).map(cb=>cb.value);
        await fetch(`/api/admin/users/${id}/roles`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + jwt, 'Content-Type': 'application/json' },
            body: JSON.stringify({ roles })
        });
        document.getElementById('roleForm'+id).remove();
        showSection();
        if (window.showToast) window.showToast('Roles updated!', 2000);
    };
    // Initial load
    showSection();
}); 