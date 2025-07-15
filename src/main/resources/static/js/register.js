document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;
    const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, fullName, email, role })
    });
    const data = await res.json();
    if (data.token) {
        localStorage.setItem('jwt', data.token);
        window.location.href = '/home.html';
    } else {
        document.getElementById('registerError').textContent = data.error || 'Registration failed';
    }
}); 