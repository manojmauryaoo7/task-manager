document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.token) {
        localStorage.setItem('jwt', data.token);
        localStorage.setItem('username', username); // Store username for task filtering
        window.location.href = '/home.html';
    } else {
        document.getElementById('loginError').textContent = data.error || 'Login failed';
    }
}); 