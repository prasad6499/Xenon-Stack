// public/login.js

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.success) {
            navigateToDashboard();
        }
    })
    .catch(error => console.error('Error:', error));
}

function navigateToDashboard() {
    window.location.href = '/dashboard';
}