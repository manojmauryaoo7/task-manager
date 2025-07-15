document.addEventListener('DOMContentLoaded', async function() {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) { window.location.href = '/login.html'; return; }
    
    // Navigation elements
    const navHome = document.getElementById('navHome');
    const navAllTasks = document.getElementById('navAllTasks');
    const navMyTasks = document.getElementById('navMyTasks');
    
    const res = await fetch('/api/user/profile', { headers: { 'Authorization': 'Bearer ' + jwt } });
    if (res.status !== 200) { localStorage.removeItem('jwt'); window.location.href = '/login.html'; return; }
    const user = await res.json();
    document.getElementById('profileFullName').value = user.fullName || '';
    document.getElementById('profileEmail').value = user.email || '';
    document.getElementById('profileMsg').textContent = '';
    document.getElementById('profileForm').onsubmit = async function(e) {
        e.preventDefault();
        const fullName = document.getElementById('profileFullName').value;
        const email = document.getElementById('profileEmail').value;
        const res2 = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + jwt, 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email })
        });
        if (res2.status === 200) {
            document.getElementById('profileMsg').textContent = '';
            if (window.showToast) window.showToast('Profile updated!', 2000);
        } else {
            document.getElementById('profileMsg').textContent = '';
            if (window.showToast) window.showToast('Update failed.', 3000);
        }
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
    
    // Function to update active tab styling (no active tab on profile page)
    function updateActiveTab() {
        if (navAllTasks) navAllTasks.classList.remove('active');
        if (navMyTasks) navMyTasks.classList.remove('active');
        // No active tab on profile page
    }
    
    // Set initial active tab
    updateActiveTab();
}); 