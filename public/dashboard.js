

function logout() {
    fetch('/logout')
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.success) {
            window.location.href = '/';
        }
    })
    .catch(error => console.error('Error:', error));
}