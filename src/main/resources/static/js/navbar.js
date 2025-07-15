document.addEventListener('DOMContentLoaded', function() {
  const profileSidebar = document.getElementById('profileSidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const closeSidebar = document.getElementById('closeSidebar');
  const profileIcon = document.getElementById('profileIcon');
// Navbar and Profile Sidebar Logic

const jwt = localStorage.getItem('jwt');
const sidebarContent = document.getElementById('sidebarContent');
const navHome = document.getElementById('navHome');
const navAllTasks = document.getElementById('navAllTasks');
const navMyTasks = document.getElementById('navMyTasks');
const navCreateTask = document.getElementById('navCreateTask');

// SPA-like navigation
if (navHome) {
    navHome.onclick = function(e) {
        e.preventDefault();
        window.location.href = '/home.html';
    };
}

// Note: Tab switching is handled by home.js, not here
// Removing conflicting event handlers to let home.js handle tab switching

// Note: Create task functionality is handled by home.js, not here
// Removing conflicting event handler to let home.js handle create task modal

// Profile sidebar open/close
if (profileIcon && profileSidebar && closeSidebar && sidebarOverlay) {
    profileIcon.onclick = function() {
        profileSidebar.classList.add('open');
        sidebarOverlay.classList.add('open');
        renderSidebarContent();
    };
    closeSidebar.onclick = function() {
        profileSidebar.classList.remove('open');
        sidebarOverlay.classList.remove('open');
    };
    sidebarOverlay.onclick = function() {
        profileSidebar.classList.remove('open');
        sidebarOverlay.classList.remove('open');
    };
}

// Render sidebar content
function renderSidebarContent() {
    if (!jwt) {
        sidebarContent.innerHTML = '<div style="padding:2rem;">Not logged in.</div>';
        return;
    }
    fetch('/api/user/profile', { headers: { 'Authorization': 'Bearer ' + jwt } })
        .then(res => res.json())
        .then(user => {
            const initials = (user.fullName || user.username || '?').split(' ').map(s => s[0]).join('').substring(0,2).toUpperCase();
            const roles = user.roles.map(r => r.name);
            let managerLinks = '';
            let adminLinks = '';
            if (roles.includes('ROLE_ADMIN')) {
                adminLinks = `
                    <a class="sidebar-link" id="sidebarManageUsers">Manage Users</a>
                    <a class="sidebar-link" id="sidebarManageManagers">Manage Managers</a>
                `;
            } else if (roles.includes('ROLE_MANAGER')) {
                managerLinks = `<a class="sidebar-link" id="sidebarManageUsers">Manage Users</a>`;
            }
            sidebarContent.innerHTML = `
                <div class="sidebar-user">
                    <div class="sidebar-avatar">${initials}</div>
                    <div class="sidebar-user-info">
                        <div><b>${user.fullName || user.username}</b></div>
                        <div style="font-size:0.95em;color:#888;">${user.email || ''}</div>
                        <div style="font-size:0.9em;color:#aaa;">${user.roles.map(r=>r.name.replace('ROLE_','')).join(', ')}</div>
                    </div>
                </div>
                ${adminLinks || managerLinks}
                <a class="sidebar-link" id="sidebarProfile">Profile</a>
                <a class="sidebar-link" id="sidebarSettings">Settings</a>
                <div class="sidebar-divider"></div>
                <a class="sidebar-link" id="sidebarLogout">Logout</a>
            `;
            if (roles.includes('ROLE_ADMIN')) {
                document.getElementById('sidebarManageUsers').onclick = function() {
                    window.location.href = '/admin.html';
                };
                document.getElementById('sidebarManageManagers').onclick = function() {
                    window.location.href = '/admin.html#managers';
                };
            } else if (roles.includes('ROLE_MANAGER')) {
                document.getElementById('sidebarManageUsers').onclick = function() {
                    window.location.href = '/manager.html';
                };
            }
            document.getElementById('sidebarProfile').onclick = function() {
                window.location.href = '/profile.html';
            };
            const settingsElement = document.getElementById('sidebarSettings');
            if (settingsElement) {
                settingsElement.onclick = function() {
                    console.log('[DEBUG] Settings clicked!');
                    showToast('Settings coming soon!');
                };
                console.log('[DEBUG] Settings click handler attached');
            } else {
                console.error('[DEBUG] sidebarSettings element not found!');
            }
            document.getElementById('sidebarLogout').onclick = function() {
                localStorage.removeItem('jwt');
                window.location.href = '/login.html';
            };
        });
}

// Toast/snackbar utility
window.showToast = function(msg, duration=2500) {
    console.log('[DEBUG] showToast called with message:', msg);
    const toastContainer = document.getElementById('toastContainer');
    
    if (!toastContainer) {
        console.error('[DEBUG] toastContainer not found!');
        // Fallback to alert if toast container doesn't exist
        alert(msg);
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    toastContainer.appendChild(toast);
    
    console.log('[DEBUG] Toast added to container');
    
    setTimeout(() => { 
        if (toast && toast.parentNode) {
            toast.remove();
            console.log('[DEBUG] Toast removed');
        }
    }, duration);
};

// Test function - you can call this from browser console: testToast()
window.testToast = function() {
    console.log('[DEBUG] Testing toast...');
    showToast('Test toast message!');
};
}); 